/*
  # Add User Preferences Table
  
  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `preferred_scene` (text)
      - `video_enabled` (boolean, default true)
      - `theme_preference` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for authenticated users to manage their preferences
    
  3. Functions
    - Add `get_user_preferences` function to retrieve preferences with defaults
    - Add `get_user_stats` function to count insights and sessions
*/

-- Create a user_preferences table to store user preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_scene TEXT,
  video_enabled BOOLEAN DEFAULT true,
  theme_preference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Set up RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add an update trigger for the updated_at column
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create a function to get user preferences with defaults
CREATE OR REPLACE FUNCTION public.get_user_preferences(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_prefs json;
BEGIN
    SELECT json_build_object(
        'preferred_scene', COALESCE(preferred_scene, 'ocean'),
        'video_enabled', COALESCE(video_enabled, true),
        'theme_preference', COALESCE(theme_preference, 'auto')
    ) INTO user_prefs
    FROM user_preferences
    WHERE user_id = $1;
    
    -- If no preferences exist yet, return defaults
    IF user_prefs IS NULL THEN
        user_prefs := json_build_object(
            'preferred_scene', 'ocean',
            'video_enabled', true,
            'theme_preference', 'auto'
        );
    END IF;
    
    RETURN user_prefs;
END;
$$;

-- Create a function to count insights and sessions for a user
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    stats json;
BEGIN
    SELECT json_build_object(
        'insight_count', (SELECT COUNT(*) FROM insights WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = $1)),
        'session_count', (SELECT COUNT(*) FROM chat_sessions WHERE user_id = $1),
        'morning_session_count', (SELECT COUNT(*) FROM chat_sessions WHERE user_id = $1 AND type = 'morning'),
        'evening_session_count', (SELECT COUNT(*) FROM chat_sessions WHERE user_id = $1 AND type = 'evening'),
        'pinned_insight_id', (SELECT id FROM insights WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = $1) AND is_pinned = true LIMIT 1)
    ) INTO stats;
    
    RETURN stats;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;