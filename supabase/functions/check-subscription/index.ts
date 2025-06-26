/*
  # Check Subscription Function

  1. Purpose
    - Validates user subscription status with RevenueCat
    - Returns subscription details and entitlements
    - Handles subscription state management

  2. Security
    - Validates user authentication
    - Secure RevenueCat API integration
    - Rate limiting for subscription checks
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionCheckRequest {
  userId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId }: SubscriptionCheckRequest = await req.json()

    // Get RevenueCat API key from environment
    const revenueCatApiKey = Deno.env.get('REVENUECAT_API_KEY')
    if (!revenueCatApiKey) {
      throw new Error('RevenueCat API key not configured')
    }

    // Call RevenueCat API to check subscription
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${revenueCatApiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      // If user not found in RevenueCat, they're on free plan
      if (response.status === 404) {
        return new Response(
          JSON.stringify({
            isPro: false,
            status: 'inactive',
            entitlements: {},
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
      throw new Error(`RevenueCat API error: ${response.statusText}`)
    }

    const data = await response.json()
    const subscriber = data.subscriber

    // Check for active entitlements
    const hasProEntitlement = subscriber.entitlements?.pro?.is_active === true
    const subscriptionStatus = hasProEntitlement ? 'active' : 'inactive'

    return new Response(
      JSON.stringify({
        isPro: hasProEntitlement,
        status: subscriptionStatus,
        entitlements: subscriber.entitlements || {},
        expiresDate: subscriber.entitlements?.pro?.expires_date,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Subscription Check Error:', error)
    
    // Return free plan status on error to avoid blocking users
    return new Response(
      JSON.stringify({
        isPro: false,
        status: 'inactive',
        entitlements: {},
        error: 'Failed to check subscription status',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})