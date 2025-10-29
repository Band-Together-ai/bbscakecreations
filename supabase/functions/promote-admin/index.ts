import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
    // CRITICAL SECURITY: Verify the caller is authenticated and is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the calling user is an admin using the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if the calling user is an admin using the is_admin RPC
    const { data: isAdmin, error: roleError } = await supabase.rpc('is_admin', { 
      _user_id: user.id 
    });

    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify admin status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAdmin) {
      console.warn(`Unauthorized admin promotion attempt by user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Admin access required to promote users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate the email list
    const requestSchema = z.object({
      emails: z.array(z.string().email().max(255)).min(1).max(100),
    });

    const body = await req.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { emails } = validation.data;

    console.log('Promoting emails to admin:', emails);

    // Get user IDs from auth.users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) throw usersError;

    const targetUsers = users.users.filter(u => u.email && emails.includes(u.email));
    
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
      JSON.stringify({ error: 'Operation failed. Please try again.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
