/*
  # Improve Chat Sessions Schema

  1. New Columns
    - `completed` (boolean) - Flag to mark sessions as completed
  
  2. Indexes
    - Improve query performance for insights and sessions
  
  3. Functions
    - `complete_session_v2` - Complete a session and generate insight
    - `get_recent_sessions_v2` - Get recent sessions with insights
  
  4. Security
    - All functions use RLS and verify user ownership
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

-- Drop existing functions if they exist (to avoid naming conflicts)
DROP FUNCTION IF EXISTS public.complete_session(uuid, text, text);
DROP FUNCTION IF EXISTS public.get_recent_sessions(int, text);

-- Create function to complete a session and generate insight
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
  v_user_id uuid;
  v_session_type text;
  v_insight_id uuid;
  v_result json;
BEGIN
  -- Get user_id and type from session
  SELECT cs.user_id, cs.type INTO v_user_id, v_session_type
  FROM chat_sessions cs
  WHERE cs.id = p_session_id;
  
  -- Verify user owns this session
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Session not found or not authorized';
  END IF;
  
  -- Create new insight
  INSERT INTO insights (session_id, quote, type, scene_type, created_at)
  VALUES (p_session_id, p_insight_quote, v_session_type, p_scene_type, now())
  RETURNING id INTO v_insight_id;
  
  -- Update session as completed and link to insight
  UPDATE chat_sessions
  SET completed = true,
      completed_at = now(),
      insight_id = v_insight_id
  WHERE id = p_session_id;
  
  -- Return the result
  SELECT json_build_object(
    'success', true,
    'insight_id', v_insight_id,
    'session_id', p_session_id
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Create function to get recent sessions
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
  v_sessions json;
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
      'completed', cs.completed,
      'insight', CASE WHEN i.id IS NOT NULL THEN
        json_build_object(
          'id', i.id,
          'quote', i.quote,
          'is_pinned', i.is_pinned,
          'created_at', i.created_at
        )
      ELSE NULL END
    )
  )
  INTO v_sessions
  FROM chat_sessions cs
  LEFT JOIN insights i ON cs.insight_id = i.id
  WHERE cs.user_id = auth.uid()
  AND (p_session_type IS NULL OR cs.type = p_session_type)
  ORDER BY cs.created_at DESC
  LIMIT p_limit_count;
  
  -- Handle null result (no sessions found)
  IF v_sessions IS NULL THEN
    v_sessions := '[]'::json;
  END IF;
  
  RETURN v_sessions;
END;
$$;

-- Create helper function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats json;
BEGIN
  SELECT json_build_object(
    'total_insights', (
      SELECT COUNT(*) FROM insights 
      WHERE session_id IN (
        SELECT id FROM chat_sessions WHERE user_id = auth.uid()
      )
    ),
    'total_sessions', (
      SELECT COUNT(*) FROM chat_sessions WHERE user_id = auth.uid()
    ),
    'completed_sessions', (
      SELECT COUNT(*) FROM chat_sessions 
      WHERE user_id = auth.uid() AND completed = true
    ),
    'pinned_insights', (
      SELECT COUNT(*) FROM insights 
      WHERE is_pinned = true 
      AND session_id IN (
        SELECT id FROM chat_sessions WHERE user_id = auth.uid()
      )
    ),
    'morning_sessions', (
      SELECT COUNT(*) FROM chat_sessions 
      WHERE user_id = auth.uid() AND type = 'morning'
    ),
    'evening_sessions', (
      SELECT COUNT(*) FROM chat_sessions 
      WHERE user_id = auth.uid() AND type = 'evening'
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.complete_session_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_sessions_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats TO authenticated;