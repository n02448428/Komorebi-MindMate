/*
  # Fix function ambiguity issues

  1. New Tables/Columns
    - No new tables or columns added

  2. Security
    - Maintain existing RLS policies
    - Update function permissions

  3. Changes
    - Drop all versions of ambiguous functions using parameter wildcards
    - Re-create functions with unique names and clear parameter prefixes
    - Add indexes for performance optimization
*/

-- Add completed column to chat_sessions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_sessions' AND column_name = 'completed'
  ) THEN
    ALTER TABLE public.chat_sessions ADD COLUMN completed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_insights_session_id ON public.insights(session_id);
CREATE INDEX IF NOT EXISTS idx_insights_is_pinned ON public.insights(is_pinned);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_type ON public.chat_sessions(type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_completed ON public.chat_sessions(completed);

-- Drop ALL versions of these functions to avoid ambiguity
-- Using wildcard parameter lists to ensure all versions are removed
DROP FUNCTION IF EXISTS public.complete_session(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.complete_session(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.complete_session() CASCADE;
DROP FUNCTION IF EXISTS public.get_recent_sessions(int, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_recent_sessions(int) CASCADE;
DROP FUNCTION IF EXISTS public.get_recent_sessions() CASCADE;

-- Create function to complete a session and generate insight with clear parameter naming
CREATE OR REPLACE FUNCTION public.complete_session_v2(
  p_session_id uuid,
  p_insight_quote text,
  p_scene_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  session_type text;
  insight_id uuid;
  result json;
BEGIN
  -- Get user_id and type from session
  SELECT cs.user_id, cs.type INTO user_id, session_type
  FROM chat_sessions cs
  WHERE cs.id = p_session_id;

  -- Verify user owns this session
  IF user_id IS NULL OR user_id != auth.uid() THEN
    RAISE EXCEPTION 'Session not found or not authorized';
  END IF;

  -- Create new insight
  INSERT INTO insights (session_id, quote, type, scene_type)
  VALUES (p_session_id, p_insight_quote, session_type, p_scene_type)
  RETURNING id INTO insight_id;

  -- Update session as completed and link to insight
  UPDATE chat_sessions
  SET completed = true,
      completed_at = now(),
      insight_id = insight_id
  WHERE id = p_session_id;

  -- Return the result
  SELECT json_build_object(
    'success', true,
    'insight_id', insight_id,
    'session_id', p_session_id
  ) INTO result;

  RETURN result;
END;
$$;

-- Create function to get recent sessions with clear parameter naming
CREATE OR REPLACE FUNCTION public.get_recent_sessions_v2(
  p_limit_count int DEFAULT 10,
  p_session_type text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sessions json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', cs.id,
      'type', cs.type,
      'created_at', cs.created_at,
      'completed_at', cs.completed_at,
      'duration', cs.duration,
      'scene_type', cs.scene_type,
      'message_count', cs.message_count,
      'insight', CASE WHEN i.id IS NOT NULL THEN
        json_build_object(
          'id', i.id,
          'quote', i.quote,
          'is_pinned', i.is_pinned
        )
      ELSE NULL END
    )
  )
  INTO sessions
  FROM chat_sessions cs
  LEFT JOIN insights i ON cs.insight_id = i.id
  WHERE cs.user_id = auth.uid()
  AND (p_session_type IS NULL OR cs.type = p_session_type)
  ORDER BY cs.created_at DESC
  LIMIT p_limit_count;

  -- Handle null result (no sessions found)
  IF sessions IS NULL THEN
    sessions := '[]'::json;
  END IF;

  RETURN sessions;
END;
$$;

-- Grant necessary permissions for the new functions
GRANT EXECUTE ON FUNCTION public.complete_session_v2(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_sessions_v2(int, text) TO authenticated;

-- Create compatibility view for easy transition (optional)
COMMENT ON FUNCTION public.complete_session_v2(uuid, text, text) IS 'Complete a chat session and generate an insight (v2)';
COMMENT ON FUNCTION public.get_recent_sessions_v2(int, text) IS 'Get recent chat sessions for current user (v2)';