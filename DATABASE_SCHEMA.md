# EduFlow Database Schema Documentation

## Overview
This document describes the Supabase PostgreSQL database schema for the EduFlow EdTech platform. The schema supports user authentication, course management, lesson tracking, and quiz scoring.

## Tables

### 1. **users** (Managed by Supabase Auth)
Stores user profile information. The `id` is auto-linked to Supabase Auth.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `id`: User ID (UUID, linked to Supabase Auth)
- `email`: User's email address (unique)
- `full_name`: User's display name
- `avatar_url`: Profile picture URL
- `bio`: User biography/bio
- `created_at`: Account creation timestamp
- `updated_at`: Last profile update timestamp

---

### 2. **courses**
Stores course information and metadata.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  level TEXT DEFAULT 'Beginner',
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  rating DECIMAL(3, 1) DEFAULT 0,
  total_students INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `id`: Course ID (UUID)
- `title`: Course name
- `description`: Full course description
- `category`: Course category (e.g., "Web Dev", "Data Science", "Business")
- `level`: Difficulty level (Beginner, Intermediate, Advanced)
- `instructor_id`: Reference to the course instructor (user)
- `thumbnail_url`: Course image/thumbnail
- `rating`: Average course rating (0-5)
- `total_students`: Count of enrolled students

---

### 3. **lessons**
Stores individual lessons within a course.

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration INT,
  order_index INT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `id`: Lesson ID (UUID)
- `course_id`: Reference to parent course
- `title`: Lesson title
- `description`: Lesson content description
- `video_url`: URL to video content (e.g., Mux, S3)
- `duration`: Video duration in minutes
- `order_index`: Sequence number for lesson ordering
- `is_published`: Whether lesson is live

---

### 4. **enrollments**
Tracks user enrollment in courses.

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress DECIMAL(5, 2) DEFAULT 0,
  completed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

**Key Fields:**
- `id`: Enrollment ID
- `user_id`: Enrolled user
- `course_id`: Enrolled course
- `enrolled_at`: Enrollment date
- `progress`: Course completion percentage (0-100)
- `completed_at`: Course completion date (NULL if not completed)

---

### 5. **lesson_completions**
Tracks which lessons each user has completed.

```sql
CREATE TABLE lesson_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

**Key Fields:**
- `id`: Completion record ID
- `user_id`: User who completed the lesson
- `lesson_id`: Completed lesson
- `completed_at`: Completion timestamp

---

### 6. **quiz_questions**
Stores questions for micro-quizzes (lesson quizzes) and final exams.

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  is_final_exam BOOLEAN DEFAULT FALSE,
  question_text TEXT NOT NULL,
  correct_answer_index INT NOT NULL,
  question_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `id`: Question ID
- `lesson_id`: Associated lesson (NULL for final exam questions)
- `is_final_exam`: Boolean flag for final exam questions
- `question_text`: The quiz question
- `correct_answer_index`: Index of correct answer (0-3)
- `question_order`: Question sequence

---

### 7. **quiz_options**
Stores answer options for quiz questions.

```sql
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INT NOT NULL
);
```

**Key Fields:**
- `id`: Option ID
- `question_id`: Parent question
- `option_text`: Answer option text
- `option_order`: Display sequence

---

### 8. **quiz_scores**
Tracks quiz attempt results and scores.

```sql
CREATE TABLE quiz_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  is_final_exam BOOLEAN DEFAULT FALSE,
  score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  time_taken_seconds INT
);
```

**Key Fields:**
- `id`: Score record ID
- `user_id`: User who took the quiz
- `lesson_id`: Associated lesson quiz (NULL for final exam)
- `is_final_exam`: Whether this is a final exam score
- `score`: Percentage score (0-100)
- `passed`: Whether user passed (score >= 70%)
- `attempted_at`: Attempt timestamp
- `time_taken_seconds`: Time spent on quiz

---

### 9. **quiz_answers**
Stores individual answers to quiz questions (optional, for analytics).

```sql
CREATE TABLE quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score_id UUID NOT NULL REFERENCES quiz_scores(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_index INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `id`: Answer record ID
- `score_id`: Associated quiz attempt
- `question_id`: Question being answered
- `selected_option_index`: User's selected answer index
- `is_correct`: Whether answer was correct

---

## Data Relationships

```
users
  ├── enrollments (1:N)
  │   └── courses (N:1)
  │       └── lessons (1:N)
  │           ├── lesson_completions (1:N from users)
  │           └── quiz_questions (1:N)
  │               └── quiz_options (1:N)
  │
  ├── lesson_completions (1:N)
  │   └── lessons (N:1)
  │
  └── quiz_scores (1:N)
      ├── quiz_answers (1:N)
      │   └── quiz_questions (N:1)
      └── lessons (N:1, for lesson quizzes)
```

---

## Row Level Security (RLS) Policies

All tables implement RLS to ensure users can only access their own data:

1. **users**: Users can only view/update their own profile
2. **enrollments**: Users can only see enrollments they own
3. **lesson_completions**: Users can only complete lessons for enrolled courses
4. **quiz_scores**: Users can only see their own quiz attempts
5. **quiz_answers**: Derived from quiz_scores, inherits same permissions

---

## Key Queries

### Get All Courses (Public)
```sql
SELECT * FROM courses WHERE is_published = TRUE ORDER BY created_at DESC;
```

### Get User's Enrolled Courses
```sql
SELECT c.* FROM courses c
JOIN enrollments e ON c.id = e.course_id
WHERE e.user_id = $1;
```

### Get Lessons for a Course with Progress
```sql
SELECT 
  l.*,
  EXISTS(SELECT 1 FROM lesson_completions WHERE user_id = $1 AND lesson_id = l.id) as completed
FROM lessons l
WHERE l.course_id = $2
ORDER BY l.order_index;
```

### Get Final Exam Score
```sql
SELECT * FROM quiz_scores
WHERE user_id = $1 AND is_final_exam = TRUE
ORDER BY attempted_at DESC LIMIT 1;
```

### Calculate Course Progress
```sql
SELECT 
  COUNT(DISTINCT l.id)::FLOAT / COUNT(DISTINCT lc.lesson_id) * 100 as progress
FROM lessons l
LEFT JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = $1
WHERE l.course_id = $2;
```

---

## Authentication Flow

1. User signs up via Supabase Auth (email/password)
2. User record created in `users` table
3. On login, check `enrollments` to get user's courses
4. Track progress via `lesson_completions` and `quiz_scores`

---

## Video Security Considerations

- Videos stored on secure CDN (e.g., Mux, AWS S3)
- `video_url` contains signed/temporary URLs
- Frontend applies CSS `pointer-events: none` overlay to prevent right-click downloads
- Implement backend checks to verify enrollment before serving video URLs
- Consider DRM solutions for premium content

---

## Future Enhancements

- Certificate table for completed courses
- Progress snapshots for analytics
- Video transcripts and subtitles table
- Discussion/comments system
- Assignment submission tracking
- Instructor analytics dashboard
