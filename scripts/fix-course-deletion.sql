-- Fix Course Deletion Issues
-- This script handles foreign key constraints and ensures proper cascade deletion

-- 1. First, check if topics table exists and has proper foreign key constraints
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topics') THEN
        -- Add proper cascade delete if it doesn't exist
        ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_course_id_fkey;
        ALTER TABLE topics ADD CONSTRAINT topics_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Handle quiz_questions table (should reference topics now)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_questions') THEN
        -- Update foreign key to reference topics instead of lessons
        ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_course_id_fkey;
        ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
            
        -- Update topic_id constraint
        ALTER TABLE quiz_questions DROP CONSTRAINT IF EXISTS quiz_questions_topic_id_fkey;
        ALTER TABLE quiz_questions ADD CONSTRAINT quiz_questions_topic_id_fkey 
            FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Handle enrollments table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;
        ALTER TABLE enrollments ADD CONSTRAINT enrollments_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Handle any other tables that might reference courses
DO $$
BEGIN
    -- Check for lesson_completions (now topic_completions)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'topic_completions') THEN
        ALTER TABLE topic_completions DROP CONSTRAINT IF EXISTS topic_completions_course_id_fkey;
        ALTER TABLE topic_completions ADD CONSTRAINT topic_completions_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    END IF;
    
    -- Check for quiz_scores
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_scores') THEN
        ALTER TABLE quiz_scores DROP CONSTRAINT IF EXISTS quiz_scores_course_id_fkey;
        ALTER TABLE quiz_scores ADD CONSTRAINT quiz_scores_course_id_fkey 
            FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Create a function to safely delete a course with all related data
CREATE OR REPLACE FUNCTION delete_course_safely(course_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    deleted_topics INTEGER;
    deleted_quiz_questions INTEGER;
    deleted_enrollments INTEGER;
BEGIN
    -- Check if course exists
    IF NOT EXISTS (SELECT 1 FROM courses WHERE id = course_uuid) THEN
        RETURN json_build_object('success', false, 'error', 'Course not found');
    END IF;
    
    -- Count related data before deletion
    SELECT COUNT(*) INTO deleted_topics FROM topics WHERE course_id = course_uuid;
    SELECT COUNT(*) INTO deleted_quiz_questions FROM quiz_questions WHERE course_id = course_uuid;
    SELECT COUNT(*) INTO deleted_enrollments FROM enrollments WHERE course_id = course_uuid;
    
    -- Delete the course (cascade should handle the rest)
    DELETE FROM courses WHERE id = course_uuid;
    
    -- Return success with statistics
    result := json_build_object(
        'success', true,
        'deleted_topics', COALESCE(deleted_topics, 0),
        'deleted_quiz_questions', COALESCE(deleted_quiz_questions, 0),
        'deleted_enrollments', COALESCE(deleted_enrollments, 0),
        'message', 'Course and all related data deleted successfully'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant necessary permissions
GRANT EXECUTE ON FUNCTION delete_course_safely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_course_safely(UUID) TO service_role;
