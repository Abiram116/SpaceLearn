-- First, backup existing user data without the grade field
CREATE TEMP TABLE users_backup AS
SELECT 
  id,
  email,
  username,
  full_name,
  gender::text as gender_text,
  age,
  bio,
  avatar_url,
  streak_count,
  last_activity_date,
  created_at,
  updated_at
FROM users;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS subspaces CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing type if it exists
DROP TYPE IF EXISTS gender_type CASCADE;

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'prefer_not_to_say');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  gender gender_type,
  age INTEGER CHECK (age >= 13),
  bio TEXT,
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restore user data from backup
INSERT INTO users (
  id,
  email,
  username,
  full_name,
  gender,
  age,
  bio,
  avatar_url,
  streak_count,
  last_activity_date,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  username,
  full_name,
  CASE 
    WHEN gender_text = 'other' THEN 'prefer_not_to_say'::gender_type
    WHEN gender_text IN ('male', 'female', 'prefer_not_to_say') THEN gender_text::gender_type
    ELSE NULL
  END,
  age,
  bio,
  avatar_url,
  streak_count,
  last_activity_date,
  created_at,
  updated_at
FROM users_backup;

-- Drop the temporary backup table
DROP TABLE users_backup;

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subspaces table
CREATE TABLE subspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning_sessions table
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects ON DELETE CASCADE,
  subspace_id UUID REFERENCES subspaces ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  subspace_id UUID REFERENCES subspaces ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  subspace_id UUID REFERENCES subspaces ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT false,
  context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON chat_messages;

CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages" ON chat_messages
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages" ON chat_messages
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- First enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Allow trigger function to create users" ON users;

-- Create policies for user management
CREATE POLICY "Allow public profile creation" ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON users
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Subjects policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON subjects;

-- First enable a permissive policy for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON subjects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (auth.uid() = user_id);

-- Then add specific policies
CREATE POLICY "Users can view own subjects" ON subjects
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subjects" ON subjects
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subjects" ON subjects
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subjects" ON subjects
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Subspaces policies
CREATE POLICY "Users can CRUD own subspaces" ON subspaces
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM subjects
      WHERE subjects.id = subspaces.subject_id
      AND subjects.user_id = auth.uid()
    )
  );

-- Learning sessions policies
CREATE POLICY "Users can CRUD own learning sessions" ON learning_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Users can CRUD own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

-- Assignments policies
CREATE POLICY "Users can CRUD own assignments" ON assignments
  FOR ALL USING (auth.uid() = user_id);

-- Create or replace the handle_new_user function with full user data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    username,
    full_name,
    gender,
    age,
    created_at,
    updated_at,
    streak_count,
    last_activity_date
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'gender')::gender_type,
    (NEW.raw_user_meta_data->>'age')::integer,
    NOW(),
    NOW(),
    1,
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 