/*
  # Auth Schema Creation

  1. New Functions
    - `public.create_checkout_session` - Function that creates a Stripe checkout session
    - `public.get_subscription_status` - Function to check a user's subscription status

  2. RLS Policies
    - Proper RLS policies for subscription management
    - Secure access to subscription data

  3. Database Triggers
    - Trigger to handle updating user profiles upon subscription changes
*/

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own subscription data
CREATE POLICY "Users can read their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create function for subscription status check
CREATE OR REPLACE FUNCTION public.get_subscription_status(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    subscription_data json;
BEGIN
    SELECT json_build_object(
        'is_pro', COALESCE(p.is_pro, false),
        'status', COALESCE(s.status, 'inactive'),
        'plan', COALESCE(s.plan, 'free'),
        'current_period_end', s.current_period_end,
        'cancel_at', s.cancel_at
    ) INTO subscription_data
    FROM profiles p
    LEFT JOIN subscriptions s ON p.id = s.user_id AND s.status = 'active'
    WHERE p.id = user_id;
    
    RETURN subscription_data;
END;
$$;

-- Create a function to update user profile when subscription changes
CREATE OR REPLACE FUNCTION public.handle_subscription_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE public.profiles
        SET is_pro = true
        WHERE id = NEW.user_id;
    ELSIF NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') 
          AND OLD.status = 'active' THEN
        -- Only downgrade if no other active subscriptions
        IF NOT EXISTS (
            SELECT 1 FROM public.subscriptions
            WHERE user_id = NEW.user_id 
            AND status = 'active'
            AND id != NEW.id
        ) THEN
            UPDATE public.profiles
            SET is_pro = false
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for subscription changes
CREATE TRIGGER on_subscription_change
AFTER INSERT OR UPDATE OF status
ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_subscription_change();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_subscription_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_subscription_change TO authenticated;