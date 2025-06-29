/*
  # Schema update for bidirectional insight-chat linking
  
  1. New Fields
    - Add insightCardId to chat_sessions table for direct linking
  
  2. Changes
    - Update the generate_insight function to save the link in both directions
    - Add migration function to update existing connections
  
  3. Security
    - Maintain all existing RLS policies
*/

-- Add insightCardId field to track which insight was generated from a session
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS insight_id UUID REFERENCES insights(id) ON DELETE SET NULL;

-- Update generate_insight function to set the insight_id on the chat session
CREATE OR REPLACE FUNCTION generate_insight(
  session_id UUID,
  insight_quote TEXT,
  scene_type TEXT,
  image_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_owner UUID;
  session_type TEXT;
  insight_id UUID;
BEGIN
  -- Get session information
  SELECT 
    user_id,
    type
  INTO 
    session_owner,
    session_type
  FROM chat_sessions
  WHERE id = session_id;
  
  -- Check if session exists and belongs to the user
  IF session_owner IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF session_owner != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Create the insight
  INSERT INTO insights (
    session_id,
    quote,
    type,
    scene_type,
    image_url,
    created_at
  )
  VALUES (
    session_id,
    insight_quote,
    session_type,
    scene_type,
    image_url,
    now()
  )
  RETURNING id INTO insight_id;
  
  -- Update the chat session to link back to the insight
  UPDATE chat_sessions
  SET insight_id = insight_id
  WHERE id = session_id;
  
  -- Mark the session as complete
  PERFORM complete_session(session_id);
  
  RETURN insight_id;
END;
$$;

-- Helper function to associate existing insights with their sessions
CREATE OR REPLACE FUNCTION migrate_insight_connections()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For each session that has an insight but no insight_id set
  UPDATE chat_sessions cs
  SET insight_id = i.id
  FROM insights i
  WHERE i.session_id = cs.id
    AND cs.insight_id IS NULL;
END;
$$;

-- Run the migration
SELECT migrate_insight_connections();