-- Create labs table
CREATE TABLE IF NOT EXISTS labs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create course_labs junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS course_labs (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES labs(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (course_id, lab_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_labs_course_id ON course_labs(course_id);
CREATE INDEX IF NOT EXISTS idx_course_labs_lab_id ON course_labs(lab_id);

-- Enable RLS (Row Level Security)
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_labs ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust based on your auth model, currently assuming public read for authorized users or similar)
-- For now, allowing all authenticated users to read. Admins (service role) can write.
-- Note: You might need specific policies for admin users if you have an 'is_admin' flag or similar.

-- Policy: Authenticated users can view labs
CREATE POLICY "Authenticated users can view labs" ON labs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can view course assignments
CREATE POLICY "Authenticated users can view course labs" ON course_labs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Only service role or admins can insert/update/delete (This part depends on how you handle admins)
-- Assuming Supabase Service Role for admin operations or specific user metadata check.
-- For simplicity in this script, we rely on Supabase dashboard/service key for admin tasks initially, 
-- or you can add specific admin policies if you have an admin role logic.

-- Example Admin Policy (commented out unless you have is_admin function/claim):
-- CREATE POLICY "Admins can manage labs" ON labs
--   FOR ALL USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));
