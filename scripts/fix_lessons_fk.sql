-- Fix missing foreign key relationship between lessons and courses
-- The error 'PGRST200' indicates this relationship is missing in the schema cache or actual database

DO $$
BEGIN
    -- Check if the constraint already exists to avoid errors
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'lessons_course_id_fkey' 
        AND table_name = 'lessons'
    ) THEN
        ALTER TABLE lessons
        ADD CONSTRAINT lessons_course_id_fkey
        FOREIGN KEY (course_id)
        REFERENCES courses(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Verify the column exists just in case
-- ALTER TABLE lessons ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- Refresh schema cache (Supabase specific, usually done by reloading schema in dashboard)
NOTIFY pgrst, 'reload schema';
