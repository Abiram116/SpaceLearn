-- Update assignments table
ALTER TABLE assignments 
ADD COLUMN title TEXT,
ADD COLUMN description TEXT;

-- Update assignment_results table
ALTER TABLE assignment_results
DROP COLUMN difficulty; 