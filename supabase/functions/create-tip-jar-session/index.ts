import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const { email, paymentId } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Creating tip jar session for:', email);

    // Check if user exists, if not create one
    let userId: string;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      console.log('Existing user found:', userId);
    } else {
      // Create new user (email-only, no password required)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      userId = newUser.user.id;
      console.log('New user created:', userId);

      // Assign free role (will be upgraded by promo or paid later)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'free' });

      if (roleError) {
        console.error('Error assigning role:', roleError);
      }
    }

    // Create tip jar session (30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const { data: session, error: sessionError } = await supabase
      .from('tip_jar_sessions')
      .insert({
        user_id: userId,
        user_email: email,
        expires_at: expiresAt,
        payment_id: paymentId,
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    // Log activity
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      action_type: 'tip_jar_purchase',
      details: { amount: 5, payment_id: paymentId },
    });

    console.log('Tip jar session created:', session.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionId: session.id,
        userId,
        expiresAt 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-tip-jar-session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
