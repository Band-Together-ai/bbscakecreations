import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
  });

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const signature = req.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret');
    return new Response('Webhook signature missing', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event received:', event.type);

    // Create service role client for database updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Helper to get userId from event
    async function getUserIdFromEvent(): Promise<string | null> {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        return (session.client_reference_id as string) ?? null;
      }

      // For subscription events, get customer and extract userId from metadata
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      if (!customerId) return null;

      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
      return customer.metadata?.userId ?? null;
    }

    const userId = await getUserIdFromEvent();

    if (!userId) {
      console.warn('No userId found for event:', event.type);
      return new Response('No userId found', { status: 200 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Checkout completed for user:', userId);
        await supabaseAdmin.rpc('set_user_role', {
          p_user_id: userId,
          p_role: 'paid'
        });

        // Log activity
        await supabaseAdmin.from('user_activity_log').insert({
          user_id: userId,
          action_type: 'subscription_started',
          details: { event_type: event.type }
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';

        console.log(`Subscription ${event.type} for user ${userId}, active: ${isActive}`);

        await supabaseAdmin.rpc('set_user_role', {
          p_user_id: userId,
          p_role: isActive ? 'paid' : 'free'
        });

        await supabaseAdmin.from('user_activity_log').insert({
          user_id: userId,
          action_type: isActive ? 'subscription_activated' : 'subscription_deactivated',
          details: {
            event_type: event.type,
            status: subscription.status
          }
        });
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('Subscription deleted for user:', userId);
        await supabaseAdmin.rpc('set_user_role', {
          p_user_id: userId,
          p_role: 'free'
        });

        await supabaseAdmin.from('user_activity_log').insert({
          user_id: userId,
          action_type: 'subscription_canceled',
          details: { event_type: event.type }
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log('Payment succeeded for user:', userId);
        await supabaseAdmin.from('user_activity_log').insert({
          user_id: userId,
          action_type: 'payment_succeeded',
          details: { event_type: event.type }
        });
        break;
      }

      case 'invoice.payment_failed': {
        console.log('Payment failed for user:', userId);
        await supabaseAdmin.from('user_activity_log').insert({
          user_id: userId,
          action_type: 'payment_failed',
          details: { event_type: event.type }
        });
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
