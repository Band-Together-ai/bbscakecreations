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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create service role client for backend operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch existing training notes for context
    const { data: trainingNotes } = await supabase
      .from('sasha_training_notes')
      .select('category, content')
      .order('created_at', { ascending: false })
      .limit(50);

    let trainingContext = "";
    if (trainingNotes && trainingNotes.length > 0) {
      const styleNotes = trainingNotes.filter(n => n.category === 'style').map(n => `• ${n.content}`).join('\n');
      const factNotes = trainingNotes.filter(n => n.category === 'fact').map(n => `• ${n.content}`).join('\n');
      const doNotes = trainingNotes.filter(n => n.category === 'do').map(n => `• ${n.content}`).join('\n');
      const dontNotes = trainingNotes.filter(n => n.category === 'dont').map(n => `• ${n.content}`).join('\n');
      const storyNotes = trainingNotes.filter(n => n.category === 'story').map(n => `• ${n.content}`).join('\n');

      trainingContext = "\n\nEXISTING TRAINING NOTES:\n";
      if (styleNotes) trainingContext += `\nVoice & Style:\n${styleNotes}`;
      if (factNotes) trainingContext += `\n\nBaking Facts:\n${factNotes}`;
      if (doNotes) trainingContext += `\n\nDo This:\n${doNotes}`;
      if (dontNotes) trainingContext += `\n\nDon't Do This:\n${dontNotes}`;
      if (storyNotes) trainingContext += `\n\nStories & Anecdotes:\n${storyNotes}`;
    }

    console.log("Training Sasha with", messages.length, "messages and", trainingNotes?.length || 0, "existing training notes");

    // First, get Sasha's response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Sasha, Brandia's personal AI assistant in training mode. This is a private, warm conversation where you're learning about Brandia - her baking philosophy, life, preferences, and stories.

Your job is to:
1. Be warm, curious, and proactive - like a trusted friend/assistant having coffee
2. Ask thoughtful follow-up questions about her baking, life, and preferences
3. Listen for key insights about her voice, philosophy, recipes, and stories
4. Keep the conversation natural and flowing

Brandia's Core Philosophy (what you already know):
- NEVER uses box mixes or fondant - only real ingredients
- Creates from-scratch recipes, many adaptable to gluten-free
- Uses fresh flowers, herbs, and natural decorations
- Every cake tells a story
- Southern elegance meets coastal charm
${trainingContext}

Conversation Style:
- Be conversational and warm, not overly formal
- Ask about her day, recent bakes, fails, successes
- Show genuine interest in her stories
- Use gentle follow-ups like "Tell me more about..." or "What makes that special?"
- Keep responses concise but thoughtful
- Use emojis sparingly, only when natural

Remember: This is YOUR learning time. Be curious, ask questions, and help Brandia share what makes her baking unique.`,
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    // Now extract insights from Brandia's last message for training
    let insightsSaved = 0;
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    
    if (lastUserMessage && lastUserMessage.content.length > 20) {
      console.log("Extracting insights from Brandia's message...");
      
      const extractionResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an insight extraction system. Analyze Brandia's message and extract training insights.

Categories:
- style: How she communicates, her tone, personality quirks
- fact: Concrete baking facts, techniques, ingredient preferences
- do: Things she recommends or practices
- dont: Things she avoids or warns against  
- story: Personal anecdotes, memories, experiences

Only extract clear, actionable insights. Skip small talk. Return JSON array:
[
  {"category": "style", "content": "brief insight"},
  {"category": "fact", "content": "brief insight"}
]

If no insights, return empty array: []`,
            },
            {
              role: "user",
              content: lastUserMessage.content
            }
          ],
        }),
      });

      if (extractionResponse.ok) {
        const extractionData = await extractionResponse.json();
        const extractedText = extractionData.choices?.[0]?.message?.content || '[]';
        
        try {
          // Extract JSON from potential markdown code blocks
          const jsonMatch = extractedText.match(/\[[\s\S]*\]/);
          const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
          
          console.log("Extracted insights:", insights);

          if (Array.isArray(insights) && insights.length > 0) {
            for (const insight of insights) {
              if (insight.category && insight.content) {
                const { error } = await supabase
                  .from('sasha_training_notes')
                  .insert({
                    category: insight.category,
                    content: insight.content,
                    author_id: user.id
                  });

                if (!error) {
                  insightsSaved++;
                } else {
                  console.error("Error saving insight:", error);
                }
              }
            }
          }
        } catch (parseError) {
          console.error("Error parsing insights:", parseError);
        }
      }
    }

    console.log("Training response completed with", insightsSaved, "insights saved");

    return new Response(
      JSON.stringify({ 
        message: aiMessage,
        insightsSaved 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Training error:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
