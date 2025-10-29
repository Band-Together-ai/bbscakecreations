import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import toolLexicon from "../_shared/tool_lexicon.json" with { type: "json" };
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const requestSchema = z.object({
      bakebookEntryId: z.string().uuid(),
      userId: z.string().uuid().optional(),
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { bakebookEntryId, userId } = validation.data;

    console.log('Scanning bakebook entry:', bakebookEntryId);

    // Fetch the bakebook entry with recipe details
    const { data: entry, error: entryError } = await supabaseClient
      .from('bakebook_entries')
      .select(`
        id,
        notes,
        user_modifications,
        recipe:recipes(
          id,
          title,
          instructions,
          ingredients
        )
      `)
      .eq('id', bakebookEntryId)
      .single();

    if (entryError || !entry) {
      console.error('Entry fetch error:', entryError);
      return new Response(
        JSON.stringify({ error: 'Entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the entry belongs to a bakebook owned by the authenticated user
    const { data: bakebook, error: bakebookError } = await supabaseClient
      .from('bakebooks')
      .select('user_id')
      .eq('id', entry.id)
      .single();

    if (bakebookError || !bakebook || bakebook.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine all text to scan
    const recipe = Array.isArray(entry.recipe) ? entry.recipe[0] : entry.recipe;
    const textToScan = [
      recipe?.instructions || '',
      JSON.stringify(recipe?.ingredients || []),
      entry.notes || '',
      JSON.stringify(entry.user_modifications || {}),
    ].join(' ').toLowerCase();

    console.log('Text length to scan:', textToScan.length);

    // Track found tools with confidence scores
    const foundTools = new Map<string, number>();

    // Scan for tool keywords
    for (const [keyword, canonicalKey] of Object.entries(toolLexicon)) {
      if (textToScan.includes(keyword.toLowerCase())) {
        // Higher confidence for exact matches, lower for partial
        const confidence = keyword.split(' ').length > 1 ? 1.0 : 0.8;
        
        // Keep highest confidence score for each canonical key
        const currentConfidence = foundTools.get(canonicalKey as string) || 0;
        if (confidence > currentConfidence) {
          foundTools.set(canonicalKey as string, confidence);
        }
      }
    }

    console.log('Found tool canonical keys:', Array.from(foundTools.keys()));

    // Fetch matching catalog items
    const { data: catalogItems, error: catalogError } = await supabaseClient
      .from('affiliate_catalog')
      .select('*')
      .in('canonical_key', Array.from(foundTools.keys()))
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (catalogError) {
      console.error('Catalog fetch error:', catalogError);
      throw catalogError;
    }

    console.log('Found catalog items:', catalogItems?.length || 0);

    // Insert affiliate mentions
    const mentionInserts = catalogItems?.map(item => ({
      source_type: 'bakebook_entry',
      source_id: bakebookEntryId,
      canonical_key: item.canonical_key,
      user_id: userId || null,
      confidence: foundTools.get(item.canonical_key) || 1.0,
      shown_to_user: true,
    })) || [];

    let mentionIds: string[] = [];
    
    if (mentionInserts.length > 0) {
      const { data: mentions, error: mentionError } = await supabaseClient
        .from('affiliate_mentions')
        .insert(mentionInserts)
        .select('id');

      if (mentionError) {
        console.error('Mention insert error:', mentionError);
      } else {
        mentionIds = mentions?.map(m => m.id) || [];
      }
    }

    console.log('Inserted mentions:', mentionIds.length);

    return new Response(
      JSON.stringify({
        success: true,
        suggestedTools: catalogItems || [],
        mentionIds,
        scanStats: {
          toolsFound: foundTools.size,
          catalogMatches: catalogItems?.length || 0,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
