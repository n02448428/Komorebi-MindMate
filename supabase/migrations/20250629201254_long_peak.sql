/*
# Subscription Management

1. New Tables
  - `subscriptions` - User subscription data
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles.id)
    - `status` (text, subscription status)
    - `plan` (text, subscription plan)
    - `created_at` (timestamptz)
    - `current_period_start` (timestamptz)
    - `current_period_end` (timestamptz)
    - `cancel_at` (timestamptz)
    - `canceled_at` (timestamptz)
    - `payment_provider` (text)
    - `payment_provider_id` (text)

2. Functions
  - `get_subscription` - Gets a user's subscription
  - `create_subscription` - Creates a new subscription
  - `update_subscription` - Updates a subscription's status

3. Security
  - Enable RLS on subscription table
  - Add policies for authenticated users to access only their own subscription data
*/

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid')),
  plan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  payment_provider TEXT NOT NULL,
  payment_provider_id TEXT,
  
  -- Add an index for user_id for faster queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE (user_id, payment_provider)
);

-- Enable Row Level Security on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for the subscriptions table
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Function to get a user's subscription
CREATE OR REPLACE FUNCTION get_subscription()
RETURNS TABLE (
  id UUID,
  status TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  is_active BOOLEAN,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.status,
    s.plan,
    s.created_at,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at,
    s.canceled_at,
    s.status IN ('trialing', 'active') AND s.current_period_end > now() AS is_active,
    EXTRACT(DAY FROM (s.current_period_end - now()))::INTEGER AS days_remaining
  FROM subscriptions s
  WHERE s.user_id = auth.uid()
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to create a new subscription
CREATE OR REPLACE FUNCTION create_subscription(
  plan_id TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  provider TEXT,
  provider_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_id UUID;
BEGIN
  -- Validate plan ID
  IF plan_id NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid plan ID. Must be "monthly" or "yearly"';
  END IF;
  
  -- Create the subscription
  INSERT INTO subscriptions (
    user_id,
    status,
    plan,
    current_period_start,
    current_period_end,
    payment_provider,
    payment_provider_id
  )
  VALUES (
    auth.uid(),
    'active',
    plan_id,
    period_start,
    period_end,
    provider,
    provider_id
  )
  ON CONFLICT (user_id, payment_provider)
  DO UPDATE SET
    status = 'active',
    plan = plan_id,
    current_period_start = period_start,
    current_period_end = period_end,
    canceled_at = NULL,
    cancel_at = NULL,
    payment_provider_id = provider_id
  RETURNING id INTO subscription_id;
  
  -- Update user's pro status
  UPDATE profiles
  SET is_pro = true,
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN subscription_id;
END;
$$;

-- Function to update a subscription's status
CREATE OR REPLACE FUNCTION update_subscription_status(
  provider TEXT,
  provider_id TEXT,
  new_status TEXT,
  cancel_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_user_id UUID;
BEGIN
  -- Get the user_id for this subscription
  SELECT user_id INTO subscription_user_id
  FROM subscriptions
  WHERE payment_provider = provider
    AND payment_provider_id = provider_id;
  
  -- Check if subscription exists
  IF subscription_user_id IS NULL THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Update the subscription
  UPDATE subscriptions
  SET status = new_status,
      canceled_at = CASE 
        WHEN new_status = 'canceled' THEN now() 
        ELSE canceled_at
      END,
      cancel_at = CASE
        WHEN new_status = 'canceled' THEN cancel_date
        ELSE cancel_at
      END
  WHERE payment_provider = provider
    AND payment_provider_id = provider_id;
  
  -- Update user's pro status if subscription is no longer active
  IF new_status NOT IN ('trialing', 'active') THEN
    UPDATE profiles
    SET is_pro = false,
        updated_at = now()
    WHERE id = subscription_user_id;
  END IF;
  
  RETURN true;
END;
$$;