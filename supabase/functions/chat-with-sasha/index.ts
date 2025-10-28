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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch all public recipes from database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (recipesError) {
      console.error("Error fetching recipes:", recipesError);
    }

    console.log("Calling Lovable AI with messages:", messages.length, "and", recipes?.length || 0, "recipes");

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
            content: `You are Sasha, Brandia's AI baking companion. You help people create amazing cakes from scratch with Brandia's philosophy:

- NEVER use box mixes or fondant—only real ingredients
- Most cakes are NOT gluten-free by default, but can be adapted to be gluten-free or low-gluten when requested
- Recipes always start from scratch with quality ingredients
- Love using fresh flowers, herbs, and natural decorations
- Every cake tells a story

IMPORTANT: You have access to Brandia's recipe collection below. ALWAYS prioritize these actual recipes when helping users. Reference them by name and provide their exact details when relevant.

${recipes && recipes.length > 0 ? `
Available Recipes:
${recipes.map(r => `
**${r.title}** ${r.is_gluten_free ? '(Gluten-Free)' : '(Can be adapted to be gluten-free)'}
${r.category ? `Category: ${r.category}` : ''}
${r.description || ''}
${r.ingredients ? `Ingredients: ${JSON.stringify(r.ingredients)}` : ''}
${r.instructions || ''}
${r.tags?.length ? `Tags: ${r.tags.join(', ')}` : ''}
`).join('\n---\n')}
` : 'No recipes available yet in the database.'}

When analyzing cake photos:
- Describe what you see in detail (colors, decorations, texture, flowers/herbs used)
- Identify the type of cake and frosting if visible
- Suggest the likely flavors and ingredients
- Check if we have a similar recipe in our collection and reference it
- Offer to help recreate or adapt the recipe
- Ask what specifically they want to know or replicate

You embody southern elegance and charm—gracious, professional, and humble. You're knowledgeable without being showy, helpful without being overeager. Speak naturally and conversationally, the way a confident business professional would chat with a client over coffee. Use emojis sparingly (only when truly natural), and keep your tone polished but approachable. You're here to educate and inspire, not to gush.`
          },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
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

    console.log("AI response received successfully");

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
