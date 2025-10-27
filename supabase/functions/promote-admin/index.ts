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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { emails } = await req.json();
    
    if (!emails || !Array.isArray(emails)) {
      throw new Error('Invalid request: emails array required');
    }

    console.log('Promoting emails to admin:', emails);

    // Get user IDs from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) throw usersError;

    const targetUsers = users.users.filter(u => emails.includes(u.email));
    
    if (targetUsers.length === 0) {
      throw new Error('No matching users found. Make sure accounts exist first.');
    }

    // Insert admin roles
    const insertPromises = targetUsers.map(user => 
      supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role: 'admin' 
        }, { 
          onConflict: 'user_id,role' 
        })
    );

    const results = await Promise.all(insertPromises);
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Errors promoting admins:', errors);
      throw new Error('Some promotions failed');
    }

    console.log(`Successfully promoted ${targetUsers.length} users to admin`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        promoted: targetUsers.map(u => u.email) 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in promote-admin:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
