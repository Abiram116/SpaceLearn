-- Drop existing assignments table if it exists
DROP TABLE IF EXISTS assignments CASCADE;

-- Create assignments table with updated structure
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects ON DELETE CASCADE,
  subspace_name TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assignments_subspace_name ON assignments(subspace_name);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject_id ON assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at);

-- Add RLS policies
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own assignments
CREATE POLICY "Users can view their own assignments"
  ON assignments FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own assignments
CREATE POLICY "Users can insert their own assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own assignments
CREATE POLICY "Users can update their own assignments"
  ON assignments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own assignments
CREATE POLICY "Users can delete their own assignments"
  ON assignments FOR DELETE
  USING (auth.uid() = user_id); 