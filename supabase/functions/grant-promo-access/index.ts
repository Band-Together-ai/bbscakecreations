import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: isAdminData } = await supabase.rpc('is_admin', { _user_id: user.id });
    if (!isAdminData) {
      throw new Error('Admin access required');
    }

    // Validate input
    const requestSchema = z.object({
      targetUserId: z.string().uuid(),
      promoType: z.string().max(100).optional(),
      days: z.number().int().min(1).max(3650).optional(),
      notes: z.string().max(500).optional(),
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetUserId, promoType, days, notes } = validation.data;

    console.log('Granting promo access to user:', targetUserId);

    // Calculate expiration if days provided
    let expiresAt = null;
    if (days && days > 0) {
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    // Upsert promo access
    const { data: promo, error: promoError } = await supabase
      .from('promo_users')
      .upsert({
        user_id: targetUserId,
        promo_type: promoType || 'admin_grant',
        granted_at: new Date().toISOString(),
        expires_at: expiresAt,
        notes: notes || null,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (promoError) {
      console.error('Error granting promo:', promoError);
      throw promoError;
    }

    // Log activity
    await supabase.from('user_activity_log').insert({
      user_id: targetUserId,
      action_type: 'promo_granted',
      details: { promo_type: promoType, days, notes, granted_by: user.id },
    });

    console.log('Promo access granted:', promo.id);

    return new Response(
      JSON.stringify({ success: true, promo }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in grant-promo-access:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('Admin');
    
    return new Response(
      JSON.stringify({ error: isAuthError ? 'Access denied' : 'Operation failed. Please try again.' }),
      { 
        status: isAuthError ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
