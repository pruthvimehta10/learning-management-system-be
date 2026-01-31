-- Debug and Fix Course Deletion
-- Run this script step by step to identify and fix issues

-- Step 1: Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'topics', 'lessons', 'quiz_questions', 'enrollments', 'topic_completions', 'lesson_completions')
ORDER BY table_name;

-- Step 2: Check existing foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'courses' OR ccu.table_name = 'courses')
ORDER BY tc.table_name, tc.constraint_name;

-- Step 3: Check if there are any courses with related data
SELECT 
    c.id,
    c.title,
    COUNT(t.id) as topic_count,
    COUNT(qq.id) as quiz_question_count,
    COUNT(e.id) as enrollment_count
FROM courses c
LEFT JOIN topics t ON c.id = t.course_id
LEFT JOIN quiz_questions qq ON c.id = qq.course_id  
LEFT JOIN enrollments e ON c.id = e.course_id
GROUP BY c.id, c.title
ORDER BY c.title;
