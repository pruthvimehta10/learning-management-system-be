-- Fix RLS policies for labs to allow inserts and updates
-- This script adds policies to allow authenticated users to manage labs

-- Drop existing policies if they conflict (optional, but good for idempotency if we knew names)
-- Since we don't know exact names of previous policies if user created custom ones, we just add new inclusive ones.

-- 1. Policy for INSERT on labs
CREATE POLICY "Authenticated users can create labs" ON labs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 2. Policy for UPDATE on labs
CREATE POLICY "Authenticated users can update labs" ON labs
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Policy for DELETE on labs
CREATE POLICY "Authenticated users can delete labs" ON labs
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 4. Similar policies for course_labs
CREATE POLICY "Authenticated users can insert course_labs" ON course_labs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete course_labs" ON course_labs
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Verification comment
COMMENT ON TABLE labs IS 'RLS Policies updated to allow management by authenticated users';
