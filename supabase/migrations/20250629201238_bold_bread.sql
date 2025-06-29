/*
# Session Management Functions

1. New Functions
  - `start_session` - Creates a new chat session
  - `complete_session` - Marks a session as complete
  - `add_message` - Adds a message to a session
  - `generate_insight` - Creates an insight from a session

2. Functionality
  - Handles session creation and tracking
  - Automatically increments message counts
  - Calculates session duration
  - Links insights with their respective chat sessions

3. Security
  - All functions enforce user permissions
  - Safe transaction handling
*/

-- Function to start a new chat session
CREATE OR REPLACE FUNCTION start_session(
  session_type TEXT,
  scene_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_id UUID;
BEGIN
  -- Validate session type
  IF session_type NOT IN ('morning', 'evening') THEN
    RAISE EXCEPTION 'Invalid session type. Must be "morning" or "evening"';
  END IF;
  
  -- Create a new session
  INSERT INTO chat_sessions (
    user_id,
    type,
    scene_type,
    created_at
  )
  VALUES (
    auth.uid(),
    session_type,
    scene_type,
    now()
  )
  RETURNING id INTO session_id;
  
  -- Update user's last session type
  UPDATE profiles
  SET last_session_type = session_type,
      updated_at = now()
  WHERE id = auth.uid();
  
  RETURN session_id;
END;
$$;

-- Function to complete a chat session
CREATE OR REPLACE FUNCTION complete_session(
  session_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_owner UUID;
  session_start TIMESTAMPTZ;
  duration_seconds INTEGER;
  message_count INTEGER;
BEGIN
  -- Get session information
  SELECT 
    user_id,
    created_at,
    (SELECT COUNT(*) FROM messages WHERE messages.session_id = chat_sessions.id)
  INTO 
    session_owner,
    session_start,
    message_count
  FROM chat_sessions
  WHERE id = session_id;
  
  -- Check if session exists and belongs to the user
  IF session_owner IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF session_owner != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Calculate session duration
  duration_seconds := EXTRACT(EPOCH FROM (now() - session_start));
  
  -- Update session with completion data
  UPDATE chat_sessions
  SET 
    completed_at = now(),
    duration = duration_seconds,
    message_count = message_count
  WHERE id = session_id;
  
  RETURN true;
END;
$$;

-- Function to add a message to a session
CREATE OR REPLACE FUNCTION add_message(
  session_id UUID,
  message_content TEXT,
  message_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_owner UUID;
  message_id UUID;
BEGIN
  -- Get session owner
  SELECT user_id INTO session_owner
  FROM chat_sessions
  WHERE id = session_id;
  
  -- Check if session exists and belongs to the user
  IF session_owner IS NULL THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  IF session_owner != auth.uid() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  
  -- Validate role
  IF message_role NOT IN ('user', 'assistant') THEN
    RAISE EXCEPTION 'Invalid role. Must be "user" or "assistant"';
  END IF;
  
  -- Insert the message
  INSERT INTO messages (
    session_id,
    content,
    role,
    created_at
  )
  VALUES (
    session_id,
    message_content,
    message_role,
    now()
  )
  RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;

-- Function to generate an insight from a session
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
  
  -- Mark the session as complete
  PERFORM complete_session(session_id);
  
  RETURN insight_id;
END;
$$;