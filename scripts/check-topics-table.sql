-- Check if topics table exists and its structure
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('topics', 'lessons')
ORDER BY table_name;

-- Check topics table structure if it exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'topics'
ORDER BY ordinal_position;

-- Check if there are any topics in the table
SELECT COUNT(*) as topic_count 
FROM topics;

-- Check if quiz_questions table exists and has topic_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'quiz_questions'
AND column_name IN ('topic_id', 'lesson_id')
ORDER BY column_name;
