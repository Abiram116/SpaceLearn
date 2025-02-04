-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subspaces table
CREATE TABLE IF NOT EXISTS subspaces (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subspaces ENABLE ROW LEVEL SECURITY;

-- Create policies for subjects
CREATE POLICY "Enable all operations for authenticated users only" ON subjects
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create policies for subspaces
CREATE POLICY "Enable all operations for authenticated users only" ON subspaces
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subspaces_updated_at
    BEFORE UPDATE ON subspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 