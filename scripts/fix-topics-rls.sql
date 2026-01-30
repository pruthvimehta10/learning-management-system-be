-- RLS Policies for topics table
-- These policies replace the old lesson policies

-- Drop existing policies if they exist (in case there are any leftover)
DROP POLICY IF EXISTS "Users can read their own lesson completions" ON topic_completions;
DROP POLICY IF EXISTS "Users can mark lessons as complete" ON topic_completions;
DROP POLICY IF EXISTS "Anyone can read published lessons" ON topics;
DROP POLICY IF EXISTS "Instructors can insert lessons" ON topics;
DROP POLICY IF EXISTS "Instructors can update their own lessons" ON topics;

-- RLS Policies for topics table
CREATE POLICY "Anyone can read topics for published courses" ON topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = topics.course_id 
      AND courses.is_published = true
    )
  );

CREATE POLICY "Instructors can insert topics" ON topics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = topics.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update their own topics" ON topics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = topics.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete their own topics" ON topics
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = topics.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

-- RLS Policies for topic_completions table
CREATE POLICY "Users can read their own topic completions" ON topic_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mark topics as complete" ON topic_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also update quiz_questions policies to work with topic_id
DROP POLICY IF EXISTS "Users can read quiz questions" ON quiz_questions;

CREATE POLICY "Users can read quiz questions" ON quiz_questions
  FOR SELECT USING (
    -- Allow reading questions for published courses
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = quiz_questions.course_id 
      AND courses.is_published = true
    )
    OR
    -- Allow instructors to read questions for their own courses
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = quiz_questions.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = quiz_questions.course_id 
      AND courses.instructor_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = quiz_questions.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );
