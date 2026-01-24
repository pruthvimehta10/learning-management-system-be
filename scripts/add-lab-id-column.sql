-- Add lab_id column to courses table
-- This allows courses to be associated with specific labs from the external system

ALTER TABLE courses 
ADD COLUMN lab_id TEXT;

-- Optional: Add an index for faster lookups
CREATE INDEX idx_courses_lab_id ON courses(lab_id);

-- Optional: Add comment
COMMENT ON COLUMN courses.lab_id IS 'Lab ID from external authentication system';
