-- Check the courses_level_check constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'courses'::regclass 
AND contype = 'c' 
AND conname = 'courses_level_check';

-- Check what level values currently exist in the courses table
SELECT DISTINCT level FROM courses ORDER BY level;

-- Check the column definition
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name = 'level';
