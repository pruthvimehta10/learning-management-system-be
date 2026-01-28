-- Migration: Remove categories, modules, and topics
-- Simplifying course structure to Course -> Lesson (Direct)

-- 1. Remove category column from courses
ALTER TABLE courses DROP COLUMN IF EXISTS category;

-- 2. Migrate data if necessary (ensure lessons are linked to courses)
-- In this schema, lessons already have course_id. 
-- However, we should ensure that if there were lessons linked ONLY to topics, 
-- they still have their course_id set correctly.
-- Looking at the schema, lessons.course_id is NOT NULL.

-- 3. Drop topics and modules tables
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS modules CASCADE;

-- 4. Remove topic_id from lessons if it exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='lessons' AND column_name='topic_id') THEN
    ALTER TABLE lessons DROP COLUMN topic_id;
  END IF;
END $$;
