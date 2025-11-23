import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, pasted_text } = await req.json();
    console.log('parse-recipe invoked with URL:', url);

    // Auth check
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let content = pasted_text || '';

    // If URL provided and no pasted text, fetch content
    if (url && !pasted_text) {
      try {
        console.log('Fetching URL content...');
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BrandiaBot/1.0)',
          },
        });
        
        if (!response.ok) {
          console.error('Fetch failed with status:', response.status);
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        console.log('URL fetched successfully, parsing HTML...');
        const html = await response.text();
        // Basic HTML stripping - keep just text
        const scriptRegex = /<script[^>]*>[\s\S]*?<\/script>/gi;
        const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
        const tagRegex = /<[^>]+>/g;
        const spaceRegex = /\s+/g;
        
        content = html
          .replace(scriptRegex, '')
          .replace(styleRegex, '')
          .replace(tagRegex, ' ')
          .replace(spaceRegex, ' ')
          .trim()
          .slice(0, 50000);
        
        console.log('Content extracted, length:', content.length);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return new Response(JSON.stringify({ 
          error: 'Could not fetch URL. Please paste the recipe text instead.' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (!content) {
      return new Response(JSON.stringify({ error: 'No content to parse' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Lovable AI to extract recipe
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI for recipe extraction...');
    const systemPrompt = `You are a recipe extraction assistant. Extract ingredients and instructions from the provided content, and intelligently detect if the recipe contains BOTH cake/baked good AND frosting/icing components.

CRITICAL RULES:
1. Extract ingredients as a structured JSON array with: ingredient, amount, unit, notes
2. Extract instructions as numbered steps
3. Preserve measurements exactly as written
4. Keep language clear and actionable
5. If content mentions variations or substitutions, include those as notes
6. Do NOT add commentary or extra text - just extract what's there

SEPARATION DETECTION:
- If the recipe contains BOTH a baked component (cake, cookies, etc.) AND a frosting/icing/topping component, set hasSeparation: true
- Keywords for frosting section: "frosting", "icing", "buttercream", "ganache", "glaze", "topping", "assembly", "decoration"
- Keywords for cake section: "batter", "bake at", "cake layers", "preheat oven", "flour", "eggs"
- Provide a confidence score (0-1) for the separation

Return ONLY valid JSON in this exact format:
{
  "hasSeparation": false,
  "confidence": 0.0,
  "cakePart": {
    "ingredients": [
      {"ingredient": "flour", "amount": "2", "unit": "cups", "notes": "all-purpose"}
    ],
    "instructions": [
      "Preheat oven to 350°F",
      "Mix dry ingredients in a bowl"
    ]
  },
  "frostingPart": {
    "ingredients": [
      {"ingredient": "butter", "amount": "1", "unit": "cup", "notes": "softened"}
    ],
    "instructions": [
      "Beat butter until fluffy",
      "Add powdered sugar gradually"
    ]
  },
  "assemblyInstructions": "Once cake is cooled, frost with buttercream..."
}

If hasSeparation is false, put everything in cakePart and leave frostingPart empty.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract recipe from this content:\n\n${content.slice(0, 30000)}` }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI extraction failed: ${aiResponse.status}`);
    }

    console.log('AI response received, parsing...');
    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || '';
    console.log('Extracted text length:', extractedText.length);
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(extractedText);
      }
      console.log('Successfully parsed recipe data');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Extracted text:', extractedText.substring(0, 500));
      return new Response(JSON.stringify({ 
        error: 'Could not parse recipe structure from content',
        raw: extractedText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Recipe parsing complete, returning data');
    return new Response(JSON.stringify({
      hasSeparation: parsed.hasSeparation || false,
      confidence: parsed.confidence || 0,
      cakePart: parsed.cakePart || { ingredients: [], instructions: [] },
      frostingPart: parsed.frostingPart || { ingredients: [], instructions: [] },
      assemblyInstructions: parsed.assemblyInstructions || '',
      source_url: url || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('parse-recipe error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
