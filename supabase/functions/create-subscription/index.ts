import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/v128/stripe@12.18.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionCreateRequest {
  userId: string
  planId: string
  userEmail: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, planId, userEmail }: SubscriptionCreateRequest = await req.json()
    
    if (!userId || !planId) {
      throw new Error('Missing required parameters: userId and planId are required')
    }

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey)

    // Map plan IDs to Stripe Price IDs
    // TODO: Replace these with your actual Stripe Price IDs from your Stripe Dashboard
    const priceMapping: Record<string, string> = {
      'monthly': 'price_1RfaIqBGpVuNZeuZm5jNUGNU', 
      'yearly': 'price_1RfaJHBGpVuNZeuZpWeAuc6J'
    }

    const priceId = priceMapping[planId]
    if (!priceId) {
      console.error(`Plan ID "${planId}" doesn't match any known price. Valid options are "monthly" or "yearly".`)
      throw new Error(`Invalid plan ID: ${planId}. Valid options are "monthly" or "yearly".`)
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: `${req.headers.get('origin') || 'http://localhost:5173'}/session?success=true`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:5173'}/upgrade?canceled=true`,
      metadata: { userId, planId }
    })

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Subscription Creation Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})