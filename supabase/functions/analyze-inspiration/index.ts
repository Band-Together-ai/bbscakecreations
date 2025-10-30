import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { url, content_type = 'blog', title, pasted_text } = await req.json();
    
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch content from URL or use pasted text
    let contentToAnalyze = pasted_text || '';
    
    if (!pasted_text && url) {
      try {
        const fetchResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; BrandiaBot/1.0)',
          },
        });
        
        if (fetchResponse.ok) {
          const html = await fetchResponse.text();
          // Simple HTML stripping - extract text content
          contentToAnalyze = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 50000); // Limit to 50k chars
        }
      } catch (fetchError) {
        console.log('Fetch failed, will need pasted text:', fetchError);
      }
    }

    if (!contentToAnalyze) {
      return new Response(JSON.stringify({ 
        error: 'Unable to fetch content. Please paste text manually.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Analyze with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert at extracting baking principles from content.

CRITICAL RULES:
- Summarize principles in OUR OWN WORDS - never quote or copy sentences
- No plagiarism - extract the teachable concept, not the creator's prose
- Group into tiers: top (3-5 key principles), supporting (5-15 helpful tips), deep (detailed techniques)
- Keep bullets concise and actionable
- Add relevant tags for each bullet (e.g., ['frosting', 'room-temp-eggs', 'pan-strips'])
- Focus on practical baking wisdom that can be applied to recipes

Return a JSON object with this structure:
{
  "title": "Extracted or inferred title",
  "top": [{ "text": "principle", "tags": ["tag1", "tag2"] }],
  "supporting": [{ "text": "principle", "tags": ["tag1"] }],
  "deep": [{ "text": "detailed technique", "tags": ["tag1"] }]
}`;

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
          { role: 'user', content: `Analyze this content and extract baking principles:\n\n${contentToAnalyze}` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Create source record
    const { data: source, error: sourceError } = await supabase
      .from('inspiration_sources')
      .insert({
        title: title || analysis.title || 'Untitled Source',
        url: url || null,
        content_type,
        added_by: user.id,
        takeaways: {
          top: analysis.top || [],
          supporting: analysis.supporting || [],
          deep: analysis.deep || []
        },
        approved: false
      })
      .select()
      .single();

    if (sourceError) {
      console.error('Source creation error:', sourceError);
      throw sourceError;
    }

    // Create bullet records for each takeaway
    const bullets = [];
    for (const tier of ['top', 'supporting', 'deep']) {
      const items = analysis[tier] || [];
      for (const item of items) {
        bullets.push({
          source_id: source.id,
          tier,
          text: item.text,
          tags: item.tags || [],
          is_approved: false
        });
      }
    }

    if (bullets.length > 0) {
      const { data: createdBullets, error: bulletsError } = await supabase
        .from('inspiration_bullets')
        .insert(bullets)
        .select();

      if (bulletsError) {
        console.error('Bullets creation error:', bulletsError);
      }
    }

    return new Response(JSON.stringify({ 
      source,
      bullets_count: bullets.length,
      analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-inspiration:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});