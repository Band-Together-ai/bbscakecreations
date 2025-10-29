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
      email: z.string().email().max(255),
      promoType: z.string().max(100).optional(),
      days: z.number().int().min(1).max(3650).optional(),
      notes: z.string().max(500).optional(),
      redirectTo: z.string().url().max(500).optional(),
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, promoType, days, notes, redirectTo } = validation.data;

    console.log('Creating invite for user:', email);

    // Create invite
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectTo || `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/auth`,
    });

    if (inviteError) {
      console.error('Error creating invite:', inviteError);
      throw inviteError;
    }

    console.log('Invite created successfully');

    // Store pending promo access (will be applied when they sign up)
    // We'll use the email as a lookup since we don't have user_id yet
    const { error: promoError } = await supabase
      .from('promo_users')
      .insert({
        user_id: inviteData.user.id, // Use the newly created user ID
        promo_type: promoType || 'early_bird_lifetime',
        granted_at: new Date().toISOString(),
        expires_at: days && days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() : null,
        notes: notes || 'Invited by admin',
      });

    if (promoError) {
      console.error('Error storing promo:', promoError);
      // Don't throw - invite was created successfully
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inviteLink: inviteData.user.invited_at ? 'Invite email sent' : 'User created',
        userId: inviteData.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in invite-user:', error);
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
