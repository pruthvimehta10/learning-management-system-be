-- PRODUCTION SETUP SCRIPT
-- Run this script in your Production Supabase SQL Editor to sync the schema.

-- 1. Create LABS Table
CREATE TABLE IF NOT EXISTS labs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create COURSE_LABS Table
CREATE TABLE IF NOT EXISTS course_labs (
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lab_id UUID REFERENCES labs(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (course_id, lab_id)
);

-- Indexes for Labs
CREATE INDEX IF NOT EXISTS idx_course_labs_course_id ON course_labs(course_id);
CREATE INDEX IF NOT EXISTS idx_course_labs_lab_id ON course_labs(lab_id);

-- 3. Create CATEGORIES Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 5. Modify COURSES Table (Add new columns)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS lab_id TEXT;

-- Indexes for Courses
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_lab_id ON courses(lab_id);

-- 6. RLS POLICIES (Merged & Fixed)

-- CATEGORIES Policies
DROP POLICY IF EXISTS "Everyone can view categories" ON categories;
CREATE POLICY "Everyone can view categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
CREATE POLICY "Authenticated users can insert categories" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
CREATE POLICY "Authenticated users can delete categories" ON categories FOR DELETE USING (auth.role() = 'authenticated');

-- LABS Policies (Fixed to allow write access for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view labs" ON labs;
CREATE POLICY "Authenticated users can view labs" ON labs FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can create labs" ON labs;
CREATE POLICY "Authenticated users can create labs" ON labs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update labs" ON labs;
CREATE POLICY "Authenticated users can update labs" ON labs FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete labs" ON labs;
CREATE POLICY "Authenticated users can delete labs" ON labs FOR DELETE USING (auth.role() = 'authenticated');

-- COURSE_LABS Policies
DROP POLICY IF EXISTS "Authenticated users can view course labs" ON course_labs;
CREATE POLICY "Authenticated users can view course labs" ON course_labs FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert course_labs" ON course_labs;
CREATE POLICY "Authenticated users can insert course_labs" ON course_labs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete course_labs" ON course_labs;
CREATE POLICY "Authenticated users can delete course_labs" ON course_labs FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Grant Permissions to authenticated and anon roles (Ensure basic access)
GRANT SELECT ON labs TO authenticated;
GRANT SELECT ON categories TO authenticated, anon;
GRANT SELECT ON course_labs TO authenticated;
