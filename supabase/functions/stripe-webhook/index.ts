import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      throw new Error('Missing Stripe signature header')
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    console.log('Received Stripe webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.client_reference_id || session.metadata?.userId
          const planId = session.metadata?.planId
          
          if (!userId) {
            console.error('No user ID found in session metadata')
            break
          }

          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Update user's subscription status in database
          const { error: updateError } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: subscription.status,
              plan: planId || 'monthly',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              payment_provider: 'stripe',
              payment_provider_id: subscription.id,
              created_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,payment_provider'
            })

          if (updateError) {
            console.error('Error updating subscription:', updateError)
            throw updateError
          }

          // Update user's Pro status in profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_pro: true })
            .eq('id', userId)

          if (profileError) {
            console.error('Error updating user profile:', profileError)
            throw profileError
          }

          console.log(`Successfully activated Pro subscription for user ${userId}`)
        }
        break

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscriptionEvent = event.data.object as Stripe.Subscription
        const userIdFromSub = subscriptionEvent.metadata?.userId
        
        if (userIdFromSub) {
          const isActive = subscriptionEvent.status === 'active'
          
          // Update subscription status
          const { error: subUpdateError } = await supabase
            .from('subscriptions')
            .update({
              status: subscriptionEvent.status,
              current_period_start: new Date(subscriptionEvent.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscriptionEvent.current_period_end * 1000).toISOString(),
              ...(subscriptionEvent.canceled_at && {
                canceled_at: new Date(subscriptionEvent.canceled_at * 1000).toISOString()
              }),
              ...(subscriptionEvent.cancel_at && {
                cancel_at: new Date(subscriptionEvent.cancel_at * 1000).toISOString()
              })
            })
            .eq('payment_provider_id', subscriptionEvent.id)

          if (subUpdateError) {
            console.error('Error updating subscription status:', subUpdateError)
          }

          // Update user's Pro status
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ is_pro: isActive })
            .eq('id', userIdFromSub)

          if (profileUpdateError) {
            console.error('Error updating user Pro status:', profileUpdateError)
          }

          console.log(`Updated subscription status for user ${userIdFromSub}: ${subscriptionEvent.status}`)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})