-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies if the tables exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subjects') THEN
        DROP POLICY IF EXISTS "Enable all access to subjects" ON public.subjects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subspaces') THEN
        DROP POLICY IF EXISTS "Enable all access to subspaces" ON public.subspaces;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        DROP POLICY IF EXISTS "Enable all access to users" ON public.users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'learning_sessions') THEN
        DROP POLICY IF EXISTS "Enable all access to learning_sessions" ON public.learning_sessions;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_preferences') THEN
        DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
    END IF;
END $$;

-- Drop existing triggers if the tables exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subjects') THEN
        DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'subspaces') THEN
        DROP TRIGGER IF EXISTS update_subspaces_updated_at ON public.subspaces;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'learning_sessions') THEN
        DROP TRIGGER IF EXISTS update_user_streak_on_activity ON public.learning_sessions;
    END IF;
END $$;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_user_streak() CASCADE;

-- Drop existing tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS public.learning_sessions CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.subspaces CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table first (as it's referenced by other tables)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    age INTEGER CHECK (age >= 13),
    grade TEXT,
    avatar_url TEXT,
    bio TEXT,
    streak_count INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subspaces table
CREATE TABLE public.subspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    last_accessed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning_sessions table
CREATE TABLE public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    subspace_id UUID REFERENCES public.subspaces(id) ON DELETE CASCADE,
    duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light',
    notification_enabled BOOLEAN DEFAULT true,
    study_reminder_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- Update streak if last activity was yesterday
    IF (
        SELECT last_activity_date 
        FROM public.users 
        WHERE id = NEW.user_id
    ) = CURRENT_DATE - 1 THEN
        UPDATE public.users
        SET streak_count = streak_count + 1,
            last_activity_date = CURRENT_DATE
        WHERE id = NEW.user_id;
    -- Reset streak if last activity was more than a day ago
    ELSIF (
        SELECT last_activity_date 
        FROM public.users 
        WHERE id = NEW.user_id
    ) < CURRENT_DATE - 1 THEN
        UPDATE public.users
        SET streak_count = 1,
            last_activity_date = CURRENT_DATE
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subspaces_updated_at
    BEFORE UPDATE ON public.subspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streak_on_activity
    AFTER INSERT ON public.learning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- Create RLS policies
CREATE POLICY "Enable all access to users" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access to subjects" ON public.subjects
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access to subspaces" ON public.subspaces
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all access to learning_sessions" ON public.learning_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL
    USING (true)
    WITH CHECK (true);