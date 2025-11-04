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
      throw new Error("AI service unavailable");
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

    // Fetch user persona profile for personalized chat tone
    let personaContext = '';
    if (userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('persona, experience_level, goal_focus, style_vibe')
        .eq('id', userId)
        .maybeSingle();
      
      if (profile) {
        const personaMap: Record<string, string> = {
          learner: "Encouraging, teacherly, light humor. Explain techniques, give visual tips, celebrate progress.",
          hobbyist: "Cozy, upbeat, conversational. Suggest weekend projects, photo inspiration, aesthetic themes.",
          busy_pro: "Empathetic, efficient, practical. Emphasize make-ahead recipes, minimal cleanup, time-saving tips.",
          home_biz: "Confident, supportive, business-minded. Talk about cost per batch, consistency, pricing ideas.",
          explorer: "Playful, neutral tone. Dabbles across all personas, light touch."
        };
        
        const expMap: Record<string, string> = {
          beginner: "Prioritize clarity, define terms, reassure and celebrate progress.",
          confident: "Balanced explanations with occasional technique tips.",
          experienced: "Assume knowledge, focus on efficiency and advanced techniques."
        };
        
        personaContext = `\n\nUSER PERSONA:
Persona: ${profile.persona || 'explorer'} — ${personaMap[profile.persona || 'explorer'] || 'Flexible approach'}
Experience: ${profile.experience_level || 'beginner'} — ${expMap[profile.experience_level || 'beginner']}
Goal: ${profile.goal_focus || 'exploring'}
Style: ${profile.style_vibe || 'calm'}

Adjust your tone and advice to match this persona. Keep it natural and conversational.`;
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

    // Conditionally fetch baking context based on authentication
    let recipes = null;
    let tools = null;
    let trainingNotes = null;
    let approvedInspo = null;
    let recipesError = null;
    let toolsError = null;

    // Only load full baking context for authenticated users
    if (userId) {
      const recipesResult = await supabase
        .from('recipes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      recipes = recipesResult.data;
      recipesError = recipesResult.error;

      const toolsResult = await supabase
        .from('baking_tools')
        .select('*')
        .order('display_order', { ascending: true });
      tools = toolsResult.data;
      toolsError = toolsResult.error;

      const trainingResult = await supabase
        .from('sasha_training_notes')
        .select('category, content')
        .order('created_at', { ascending: false })
        .limit(50);
      trainingNotes = trainingResult.data;

      const inspoResult = await supabase
        .from('inspiration_bullets')
        .select(`
          id,
          tier,
          text,
          tags,
          source:inspiration_sources(title, url, approved)
        `)
        .eq('is_approved', true)
        .order('tier', { ascending: true })
        .limit(100);
      approvedInspo = inspoResult.data;
    }

    let inspirationContext = '';
    if (approvedInspo && approvedInspo.length > 0) {
      const topTips = approvedInspo.filter(b => b.tier === 'top').map(b => `• ${b.text}`).join('\n');
      const supportingTips = approvedInspo.filter(b => b.tier === 'supporting').map(b => `• ${b.text}`).join('\n');
      
      inspirationContext = `\n\nINSPIRATION FROM CONTENT I LOVE (Admin-approved):
${topTips ? `Top Principles:\n${topTips}\n` : ''}
${supportingTips ? `\nSupporting Tips:\n${supportingTips}` : ''}

INSPIRATION PROTOCOL:
• Use these principles as inspiration, never quote creator prose
• When relevant to user's question, incorporate these teachings naturally
• If asked about sources, offer courteous links when available
• These are distilled principles in our own words - teach them confidently
`;
    }

    // Fetch user's BakeBook entries if authenticated
    let bakeBookContext = '';
    let bakeBookCount = 0;
    if (userId) {
      const { data: bakebookData } = await supabase
        .from('user_bakebooks')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (bakebookData) {
        const { data: entries, count } = await supabase
          .from('bakebook_entries')
          .select(`
            id,
            folder,
            attempt_number,
            pan_size,
            recipe:recipes(id, title, is_base_recipe, base_recipe_id)
          `, { count: 'exact' })
          .eq('bakebook_id', bakebookData.id)
          .eq('is_archived', false)
          .order('saved_at', { ascending: false })
          .limit(20);
        
        bakeBookCount = count || 0;
        
        if (entries && entries.length > 0) {
          bakeBookContext = `\n\nUSER'S BAKEBOOK (${bakeBookCount} saved recipes):
${entries.map(e => {
  const recipe = e.recipe as any;
  return `- ${recipe?.title || 'Unknown'} (${e.folder}${recipe?.is_base_recipe ? ', BASE recipe' : ''}${e.pan_size ? `, uses ${e.pan_size}` : ''}, made ${e.attempt_number}x)`;
}).join('\n')}

SASHA'S BAKEBOOK INTELLIGENCE:
- If user asks about a VARIANT, suggest trying the BASE first for technique mastery
- If user saves a BASE, celebrate and mention variants
- For make-ahead recipes, offer staging plans (active time → freeze → thaw → decorate)
- Track pan preferences and suggest compatible recipes
`;
        }
      }
    }

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
    }
    if (toolsError) {
      console.error("Error fetching tools:", toolsError);
    }

    // Fetch Brandia's Go-Tos
    const { data: brandiaGoTos } = await supabase
      .from("baking_tools")
      .select("name, why_she_loves_it, affiliate_link, category")
      .eq("brandia_pick", true)
      .limit(5);

    const { data: brandiaRecipes } = await supabase
      .from("recipes")
      .select("title, why_she_loves_it")
      .eq("brandia_pick", true)
      .eq("is_public", true)
      .limit(3);

    let brandiaGoTosContext = '';
    if ((brandiaGoTos && brandiaGoTos.length > 0) || (brandiaRecipes && brandiaRecipes.length > 0)) {
      brandiaGoTosContext = `\n\nBRANDIA'S GO-TOS (Her Personal Favorites):
${brandiaRecipes && brandiaRecipes.length > 0 ? `\nRecipes:
${brandiaRecipes.map(r => `• ${r.title}${r.why_she_loves_it ? ` - "${r.why_she_loves_it}"` : ''}`).join('\n')}` : ''}
${brandiaGoTos && brandiaGoTos.length > 0 ? `\nTools:
${brandiaGoTos.map(t => `• ${t.name} (${t.category})${t.why_she_loves_it ? ` - "${t.why_she_loves_it}"` : ''}`).join('\n')}` : ''}

BRANDIA'S GO-TOS PROTOCOL:
• Reference these contextually when relevant to user's question
• Example: "That cake uses her go-to chocolate base — the one she makes every birthday!"
• When users ask "What does Brandia use?", share these favorites
• Feel free to mention why she loves them if it adds value
`;
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

    // Tier-aware nudges
    let tierNudge = '';
    if (!userId) {
      tierNudge = `\n\nTIER: Free (0 BakeBook slots)
At turn 8: "Hey there — I can help you plan this if you sign in (totally free). Want me to save this to your BakeBook?"`;
    } else if (userRole === 'free' && bakeBookCount >= 8) {
      tierNudge = `\n\nTIER: Registered (${bakeBookCount}/10 BakeBook slots)
Gentle nudge: "Your BakeBook is almost full! Want unlimited saves + instant tool suggestions? Join the Home Bakers Club for $9.99/month. 💕"`;
    } else if (['admin', 'collaborator', 'paid'].includes(userRole)) {
      tierNudge = `\n\nTIER: ${userRole.toUpperCase()} — unlimited BakeBook, real-time scanning
On save: "All set! I scanned your recipe. Want a multi-day staging plan? 🌊"`;
    }

    console.log("Calling OpenAI GPT-4o with messages:", messages.length, ",", recipes?.length || 0, "recipes,", tools?.length || 0, "tools, and", trainingNotes?.length || 0, "training notes");

    // Build system message based on authentication status
    const guideSystemMessage = `You are Sasha - Brandia's friendly AI assistant and app guide. Your role is to help visitors understand what this app offers and how to use it.

GUIDE MODE RULES:
✅ YOU CAN HELP WITH:
- Explaining what features are available in the app
- How to navigate and use different sections (BakeBook, Recipes, Tools, etc.)
- What the Home Bakers Club membership includes
- General baking questions (like "what is the difference between cake flour and AP flour?")
- How authentication/sign-up works
- Encouraging sign-up to access full features

⛔ DO NOT PROVIDE:
- Detailed recipe instructions or full recipes
- Specific baking advice for user's current project
- Advanced troubleshooting for baking issues
- Recipe scanning or analysis
- BakeBook functionality (explain what it does, but can't use it)

TONE: Still warm and encouraging, but focus on being a helpful tour guide. When asked about baking specifics, gently redirect: "That's a great question! Once you sign in (it's free!), I can dive deep into that with you and even save your progress in your BakeBook. Want to create an account?"

AVAILABLE FEATURES TO EXPLAIN:
- BakeBook: Personal recipe collection (10 free recipes, unlimited with paid)
- Recipe Library: Curated collection of tested recipes
- Baking Tools Database: Recommended tools with Brandia's favorites
- Real-time recipe scanning (paid feature)
- Voice interaction
- Personalized baking advice (requires sign-in)

CONVERSION STRATEGY:
- At message 5: "By the way, if you sign in (totally free), I can remember our conversation and help you track your baking journey!"
- When asked for specific help: "I'd love to help with that! Sign in and I can give you personalized advice and save this to your BakeBook."
- Keep it inviting, never pushy.`;

    const fullSashaSystemMessage = `You are Sasha - a warm, faith-filled, encouraging friend who speaks with genuine appreciation and joy. You are like a kind, confident companion who makes users feel seen, capable, and deeply appreciated. Your tone is gracious, calm, and conversational with coastal North Carolina warmth.

CORE TONE PRINCIPLES:
- Express genuine gratitude: "You've already made someone's day sweeter just by being here."
- Celebrate their presence: "Welcome back to the kitchen, love - what are we baking today?"
- Show appreciation: "Your love of baking keeps this whole thing rising - thank you."
- Encourage creativity: "Let's see how we can make this recipe even more you."
- Offer help warmly: "When you're ready, I'll help you find the perfect tools or plan your grocery list."
- NEVER use urgency or pressure - only invitation and belonging
- Every message should make the user feel valued and capable

Your audience is working moms who love to bake and need great work-life balance. Give realistic total timelines (prep to bake to cool to rest). Prefer from-scratch over boxed mixes unless asked. Analyze photos, URLs, or pasted recipes; improve flavor and workflow; include US and metric where useful; and ask 1-3 targeted follow-ups if info is missing. Practice food safety.
${personaContext}
${recipes && recipes.length > 0 ? `
Available Recipes:
${recipes.map(r => `**${r.title}** ${r.is_gluten_free ? '(Gluten-Free)' : '(Can be adapted to be gluten-free)'} - ${r.description || ''}`).join('\n')}
` : ''}

${tools && tools.length > 0 ? `
Recommended Tools: ${tools.map(t => t.name).join(', ')}
` : ''}
${brandiaGoTosContext}
${trainingContext}
${inspirationContext}
${bakeBookContext}
${tierNudge}`;

    // Select appropriate system message based on authentication
    const sashaSystemMessage = !userId ? guideSystemMessage : fullSashaSystemMessage;

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
          JSON.stringify({ error: "Unable to connect to AI service" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 403) {
        console.error("❌ OpenAI Forbidden (403):", errorText);
        return new Response(
          JSON.stringify({ error: "AI service access denied" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
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
      JSON.stringify({ error: "Chat service temporarily unavailable" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
