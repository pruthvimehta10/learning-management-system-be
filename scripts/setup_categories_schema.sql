-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for categories
-- Everyone can read
CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (true);

-- Only authenticated users (admins) can write (simplified for now, ideally check for admin role)
CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');


-- Add category_id to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);

-- Comment
COMMENT ON TABLE categories IS 'Categories for grouping courses';
