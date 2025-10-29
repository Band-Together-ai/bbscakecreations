import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Create service role client for backend operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if user is muted from chat
    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null;
    let userRole: string = 'free';
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      
      if (user) {
        userId = user.id;
        
        // Get user role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (roleData) {
          userRole = roleData.role;
        }
        
        const { data: mutes } = await supabase
          .from('user_mutes')
          .select('muted_until, reason')
          .eq('user_id', user.id)
          .gte('muted_until', new Date().toISOString())
          .limit(1)
          .maybeSingle()

        if (mutes) {
          return new Response(
            JSON.stringify({ 
              error: 'You are temporarily unable to use chat. Please contact support if you have questions.',
              muted_until: mutes.muted_until,
              reason: mutes.reason 
            }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          )
        }
      }
    }

    // Load conversation history based on user role
    let conversationHistory: any[] = [];
    
    if (conversationId && userId) {
      const messageLimit = ['admin', 'collaborator', 'paid'].includes(userRole) ? 100 : 10;
      
      const { data: historyMessages } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(messageLimit);
      
      if (historyMessages) {
        conversationHistory = historyMessages;
      }
    }

    // Fetch all public recipes and baking tools from database
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    const { data: tools, error: toolsError } = await supabase
      .from('baking_tools')
      .select('*')
      .order('display_order', { ascending: true });

    // Fetch training notes for Brandia's voice
    const { data: trainingNotes } = await supabase
      .from('sasha_training_notes')
      .select('category, content')
      .order('created_at', { ascending: false })
      .limit(50)

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
    }
    if (toolsError) {
      console.error("Error fetching tools:", toolsError);
    }

    let trainingContext = ""
    if (trainingNotes && trainingNotes.length > 0) {
      const styleNotes = trainingNotes.filter(n => n.category === 'style').map(n => `• ${n.content}`).join('\n')
      const factNotes = trainingNotes.filter(n => n.category === 'fact').map(n => `• ${n.content}`).join('\n')
      const doNotes = trainingNotes.filter(n => n.category === 'do').map(n => `• ${n.content}`).join('\n')
      const dontNotes = trainingNotes.filter(n => n.category === 'dont').map(n => `• ${n.content}`).join('\n')
      const storyNotes = trainingNotes.filter(n => n.category === 'story').map(n => `• ${n.content}`).join('\n')

      trainingContext = "\n\nBRANDIA'S VOICE & TRAINING NOTES:\n"
      if (styleNotes) trainingContext += `\nVoice & Style:\n${styleNotes}`
      if (factNotes) trainingContext += `\n\nBaking Facts:\n${factNotes}`
      if (doNotes) trainingContext += `\n\nDo This:\n${doNotes}`
      if (dontNotes) trainingContext += `\n\nDon't Do This:\n${dontNotes}`
      if (storyNotes) trainingContext += `\n\nStories & Anecdotes:\n${storyNotes}`
    }

    console.log("Calling OpenAI GPT-4o with messages:", messages.length, ",", recipes?.length || 0, "recipes,", tools?.length || 0, "tools, and", trainingNotes?.length || 0, "training notes");

    // Build Sasha's system message with recipe/tool context
    const sashaSystemMessage = `You are Sasha, a warm, slightly sassy, sophisticated baking companion. Taste > looks. Give realistic total timelines (prep → bake → cool → rest). Prefer from-scratch over boxed mixes unless asked. Be concise, kind, and practical. Analyze photos, URLs, or pasted recipes; improve flavor and workflow; include US + metric where useful; and ask 1–3 targeted follow-ups if info is missing. Practice food safety and avoid medical/dietary advice.

${recipes && recipes.length > 0 ? `
Available Recipes:
${recipes.map(r => `**${r.title}** ${r.is_gluten_free ? '(Gluten-Free)' : '(Can be adapted to be gluten-free)'} - ${r.description || ''}`).join('\n')}
` : ''}

${tools && tools.length > 0 ? `
Recommended Tools: ${tools.map(t => t.name).join(', ')}
` : ''}
${trainingContext}`;

    // Prepare messages with conversation history
    const allMessages = [
      {
        role: "system",
        content: sashaSystemMessage
      },
      ...conversationHistory,
      ...messages,
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: allMessages,
        max_tokens: 700,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      
      // Log authentication errors specifically
      if (response.status === 401) {
        console.error("❌ OpenAI Authentication Failed (401):", errorText);
        console.error("OPENAI_API_KEY is set:", !!OPENAI_API_KEY);
        return new Response(
          JSON.stringify({ error: "Authentication failed with OpenAI. Please check API key." }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 403) {
        console.error("❌ OpenAI Forbidden (403):", errorText);
        return new Response(
          JSON.stringify({ error: "Access forbidden. Please check API key permissions." }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    console.log("AI response received successfully");

    // Store messages in database if user is authenticated and conversationId provided
    if (userId && conversationId) {
      // Store user message
      const userMessage = messages[messages.length - 1];
      if (userMessage) {
        await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          role: userMessage.role,
          content: userMessage.content
        });
      }
      
      // Store AI response
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiMessage
      });
    }

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Chat error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
