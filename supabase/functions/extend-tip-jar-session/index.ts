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

    const { sessionId, paymentId, additionalMinutes = 30 } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    console.log('Extending tip jar session:', sessionId);

    // Get current session
    const { data: currentSession, error: fetchError } = await supabase
      .from('tip_jar_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError) {
      console.error('Error fetching session:', fetchError);
      throw fetchError;
    }

    // Calculate new expiration (add minutes to current expires_at or now, whichever is later)
    const baseTime = Math.max(new Date(currentSession.expires_at).getTime(), Date.now());
    const newExpiresAt = new Date(baseTime + additionalMinutes * 60 * 1000).toISOString();

    // Update session
    const { data: updatedSession, error: updateError } = await supabase
      .from('tip_jar_sessions')
      .update({ 
        expires_at: newExpiresAt,
        is_active: true,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw updateError;
    }

    // Log activity
    await supabase.from('user_activity_log').insert({
      user_id: currentSession.user_id,
      action_type: 'tip_jar_extended',
      details: { 
        session_id: sessionId,
        additional_minutes: additionalMinutes,
        payment_id: paymentId 
      },
    });

    console.log('Session extended, new expiry:', newExpiresAt);

    return new Response(
      JSON.stringify({ 
        success: true, 
        expiresAt: newExpiresAt,
        session: updatedSession 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extend-tip-jar-session:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
