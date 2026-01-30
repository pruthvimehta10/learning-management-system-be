-- Rename table lessons to topics
ALTER TABLE IF EXISTS lessons RENAME TO topics;

-- Rename lesson_completions to topic_completions
ALTER TABLE IF EXISTS lesson_completions RENAME TO topic_completions;

-- Rename column lesson_id to topic_id in topic_completions
ALTER TABLE IF EXISTS topic_completions RENAME COLUMN lesson_id TO topic_id;

-- Rename column lesson_id to topic_id in quiz_questions
ALTER TABLE IF EXISTS quiz_questions RENAME COLUMN lesson_id TO topic_id;

-- Rename column lesson_id to topic_id in quiz_scores
ALTER TABLE IF EXISTS quiz_scores RENAME COLUMN lesson_id TO topic_id;

-- Update foreign key references if not automatically updated (Postgres usually handles table renames gracefully, but good to double check constraints if needed)
-- Note: Supabase/Postgres automaticlly updates FK constraints when renaming tables/columns usually.

-- If you have any saved queries or functions that use 'lessons', they will need manual updating.
-- This script only handles the schema level renames.
