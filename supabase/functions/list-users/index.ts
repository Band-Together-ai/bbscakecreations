import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('list-users: Starting request')

    // Safely read Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('list-users: No Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No auth header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('list-users: Failed to get user', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('list-users: User authenticated:', user.id)

    // Check if user has admin role (handles multi-role users correctly)
    const { data: roles, error: roleCheckError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    if (roleCheckError) {
      console.error('list-users: Error fetching roles', roleCheckError)
      return new Response(
        JSON.stringify({ error: 'Error checking permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const isAdmin = Array.isArray(roles) && roles.some(r => r.role === 'admin')
    console.log('list-users: Is admin?', isAdmin, 'Roles:', roles)

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // List all users from auth
    const { data: usersData, error: usersError } = await supabaseClient.auth.admin.listUsers()

    if (usersError) {
      throw usersError
    }

    // Fetch user roles
    const { data: rolesData, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('user_id, role')

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
    }

    // Fetch promo users
    const { data: promoData, error: promoError } = await supabaseClient
      .from('promo_users')
      .select('user_id, promo_type, expires_at, granted_at, notes')

    if (promoError) {
      console.error('Error fetching promo users:', promoError)
    }

    return new Response(
      JSON.stringify({ 
        users: usersData.users,
        roles: rolesData || [],
        promo: promoData || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error listing users:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to retrieve users' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
