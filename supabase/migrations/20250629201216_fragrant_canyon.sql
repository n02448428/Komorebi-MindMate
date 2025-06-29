/*
# Initial Database Schema for Komorebi MindMate

1. New Tables
  - `profiles` - User profile data
    - `id` (uuid, primary key, references auth.users)
    - `email` (text, not null)
    - `name` (text)
    - `is_pro` (boolean, default false)
    - `created_at` (timestamptz, default now())
    - `updated_at` (timestamptz)
    - `timezone` (text)
    - `last_session_type` (text)
    - `preferred_scene` (text)
  
  - `chat_sessions` - User chat sessions
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles.id)
    - `type` (text, 'morning' or 'evening')
    - `created_at` (timestamptz)
    - `completed_at` (timestamptz)
    - `scene_type` (text)
    - `message_count` (integer)
    - `duration` (integer, in seconds)
  
  - `messages` - Individual messages within chat sessions
    - `id` (uuid, primary key)
    - `session_id` (uuid, references chat_sessions.id)
    - `content` (text)
    - `role` (text, 'user' or 'assistant')
    - `created_at` (timestamptz)
  
  - `insights` - Insights generated from sessions
    - `id` (uuid, primary key)
    - `session_id` (uuid, references chat_sessions.id)
    - `quote` (text)
    - `type` (text, 'morning' or 'evening')
    - `created_at` (timestamptz)
    - `scene_type` (text)
    - `is_pinned` (boolean, default false)
    - `image_url` (text)

2. Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access only their own data
*/

-- Profiles table to store user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  timezone TEXT,
  last_session_type TEXT,
  preferred_scene TEXT
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  scene_type TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  duration INTEGER, -- in seconds
  
  -- Add an index for user_id for faster queries
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Add an index for session_id for faster queries
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  quote TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('morning', 'evening')),
  created_at TIMESTAMPTZ DEFAULT now(),
  scene_type TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  image_url TEXT,
  
  -- Add an index for session_id for faster queries
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Add a trigger to update the updated_at column in profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policies for the chat_sessions table
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
  ON chat_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for the messages table
CREATE POLICY "Users can view messages in their chat sessions"
  ON messages
  FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = messages.session_id));

CREATE POLICY "Users can insert messages in their chat sessions"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = messages.session_id));

-- Create policies for the insights table
CREATE POLICY "Users can view their own insights"
  ON insights
  FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = insights.session_id));

CREATE POLICY "Users can insert their own insights"
  ON insights
  FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = insights.session_id));

CREATE POLICY "Users can update their own insights"
  ON insights
  FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = insights.session_id));

CREATE POLICY "Users can delete their own insights"
  ON insights
  FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = insights.session_id));

-- Create a function to create user profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();