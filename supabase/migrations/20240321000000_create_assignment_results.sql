-- Drop existing assignment_results table if it exists
DROP TABLE IF EXISTS assignment_results CASCADE;

-- Create assignment_results table
CREATE TABLE assignment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  evaluation TEXT NOT NULL,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_assignment_results_user_id ON assignment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_results_assignment_id ON assignment_results(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_results_created_at ON assignment_results(created_at);

-- Add RLS policies
ALTER TABLE assignment_results ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own results
CREATE POLICY "Users can view their own assignment results"
  ON assignment_results FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own results
CREATE POLICY "Users can insert their own assignment results"
  ON assignment_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add comments for better documentation
COMMENT ON TABLE assignment_results IS 'Stores results of assignments completed by users';
COMMENT ON COLUMN assignment_results.id IS 'Unique identifier for the assignment result';
COMMENT ON COLUMN assignment_results.user_id IS 'Reference to the user who completed the assignment';
COMMENT ON COLUMN assignment_results.assignment_id IS 'Reference to the completed assignment';
COMMENT ON COLUMN assignment_results.difficulty IS 'Difficulty level of the assignment (easy, medium, hard)';
COMMENT ON COLUMN assignment_results.score IS 'Number of correct answers';
COMMENT ON COLUMN assignment_results.total_questions IS 'Total number of questions in the assignment';
COMMENT ON COLUMN assignment_results.evaluation IS 'Overall evaluation or feedback for the assignment';
COMMENT ON COLUMN assignment_results.responses IS 'JSON containing user responses and correct answers';
COMMENT ON COLUMN assignment_results.created_at IS 'Timestamp when the result was recorded'; 