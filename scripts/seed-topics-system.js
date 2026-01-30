const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedTopicsSystem() {
    console.log('--- Seeding Topics Learning Management System ---');

    try {
        // 1. Get or create a demo instructor
        let instructorId = null;
        const { data: existingUsers, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .limit(1);

        if (userError) {
            console.error('Error fetching users:', userError);
            return;
        }

        if (existingUsers && existingUsers.length > 0) {
            instructorId = existingUsers[0].id;
            console.log('Using existing user as instructor:', existingUsers[0].email);
        } else {
            console.log('No users found. Please create a user first.');
            return;
        }

        // 2. Create Sample Courses
        const courses = [
            {
                title: 'Web Development Fundamentals',
                description: 'Learn HTML, CSS, and JavaScript from scratch. Build modern, responsive websites and understand the core concepts of web development.',
                instructor_id: instructorId,
                thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
                level: 'Beginner',
                duration_minutes: 480,
                is_published: true
            },
            {
                title: 'React.js Advanced Patterns',
                description: 'Master advanced React concepts including hooks, context API, performance optimization, and modern development patterns.',
                instructor_id: instructorId,
                thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
                level: 'Advanced',
                duration_minutes: 360,
                is_published: true
            },
            {
                title: 'Data Science with Python',
                description: 'Explore data analysis, visualization, and machine learning using Python. Work with popular libraries like pandas, numpy, and scikit-learn.',
                instructor_id: instructorId,
                thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
                level: 'Intermediate',
                duration_minutes: 600,
                is_published: true
            }
        ];

        console.log('Inserting courses...');
        const { data: insertedCourses, error: courseError } = await supabase
            .from('courses')
            .insert(courses)
            .select();

        if (courseError) {
            console.error('Error inserting courses:', courseError.message);
            return;
        }

        console.log('Successfully inserted courses:', insertedCourses.map(c => c.title).join(', '));

        // 3. Create Topics for each course
        const topicsData = [];

        // Web Development Fundamentals Topics
        const webDevTopics = [
            {
                course_id: insertedCourses[0].id,
                title: 'Introduction to HTML',
                description: 'Learn the basics of HTML structure, tags, and semantic markup.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                video_duration_seconds: 1200,
                order_index: 1
            },
            {
                course_id: insertedCourses[0].id,
                title: 'CSS Styling and Layout',
                description: 'Master CSS styling, flexbox, grid, and responsive design principles.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                video_duration_seconds: 1500,
                order_index: 2
            },
            {
                course_id: insertedCourses[0].id,
                title: 'JavaScript Basics',
                description: 'Understanding variables, functions, arrays, and basic DOM manipulation.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                video_duration_seconds: 1800,
                order_index: 3
            },
            {
                course_id: insertedCourses[0].id,
                title: 'Building Your First Website',
                description: 'Combine HTML, CSS, and JavaScript to create a complete project.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                video_duration_seconds: 2100,
                order_index: 4
            }
        ];

        // React.js Advanced Patterns Topics
        const reactTopics = [
            {
                course_id: insertedCourses[1].id,
                title: 'Advanced Hooks Patterns',
                description: 'Deep dive into custom hooks, useReducer, and useContext patterns.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                video_duration_seconds: 1600,
                order_index: 1
            },
            {
                course_id: insertedCourses[1].id,
                title: 'Performance Optimization',
                description: 'Learn React.memo, useMemo, useCallback, and code splitting techniques.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                video_duration_seconds: 1400,
                order_index: 2
            },
            {
                course_id: insertedCourses[1].id,
                title: 'State Management with Context',
                description: 'Build scalable state management solutions using Context API.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                video_duration_seconds: 1800,
                order_index: 3
            }
        ];

        // Data Science with Python Topics
        const dataScienceTopics = [
            {
                course_id: insertedCourses[2].id,
                title: 'Python for Data Analysis',
                description: 'Introduction to pandas, numpy, and data manipulation techniques.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                video_duration_seconds: 2000,
                order_index: 1
            },
            {
                course_id: insertedCourses[2].id,
                title: 'Data Visualization',
                description: 'Create compelling visualizations using matplotlib and seaborn.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                video_duration_seconds: 1700,
                order_index: 2
            },
            {
                course_id: insertedCourses[2].id,
                title: 'Machine Learning Fundamentals',
                description: 'Understanding supervised and unsupervised learning with scikit-learn.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                video_duration_seconds: 2400,
                order_index: 3
            },
            {
                course_id: insertedCourses[2].id,
                title: 'Building ML Models',
                description: 'Complete machine learning project from data preprocessing to deployment.',
                video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                video_duration_seconds: 2200,
                order_index: 4
            }
        ];

        topicsData.push(...webDevTopics, ...reactTopics, ...dataScienceTopics);

        console.log('Inserting topics...');
        const { data: insertedTopics, error: topicsError } = await supabase
            .from('topics')
            .insert(topicsData)
            .select();

        if (topicsError) {
            console.error('Error inserting topics:', topicsError.message);
            return;
        }

        console.log(`Successfully inserted ${insertedTopics.length} topics`);

        // 4. Create Quiz Questions and Options for each topic
        const quizQuestions = [];
        const quizOptions = [];

        insertedTopics.forEach((topic, topicIndex) => {
            // Create 3 quiz questions per topic
            for (let i = 1; i <= 3; i++) {
                const questionId = crypto.randomUUID();
                
                quizQuestions.push({
                    id: questionId,
                    topic_id: topic.id,
                    course_id: topic.course_id,
                    is_final_exam: false,
                    question_text: `Question ${i} for ${topic.title}`,
                    question_order: i,
                    question_type: 'multiple_choice'
                });

                // Create 4 options per question
                const correctAnswerIndex = Math.floor(Math.random() * 4);
                for (let j = 0; j < 4; j++) {
                    quizOptions.push({
                        question_id: questionId,
                        option_text: `Option ${j + 1} for Question ${i}`,
                        is_correct: j === correctAnswerIndex,
                        option_order: j + 1
                    });
                }
            }
        });

        console.log('Inserting quiz questions...');
        const { error: quizQuestionsError } = await supabase
            .from('quiz_questions')
            .insert(quizQuestions);

        if (quizQuestionsError) {
            console.error('Error inserting quiz questions:', quizQuestionsError.message);
            return;
        }

        console.log('Inserting quiz options...');
        const { error: quizOptionsError } = await supabase
            .from('quiz_options')
            .insert(quizOptions);

        if (quizOptionsError) {
            console.error('Error inserting quiz options:', quizOptionsError.message);
            return;
        }

        // 5. Create Final Exam for each course
        const finalExams = [];
        const finalExamOptions = [];

        insertedCourses.forEach((course) => {
            // Create 5 final exam questions per course
            for (let i = 1; i <= 5; i++) {
                const questionId = crypto.randomUUID();
                
                finalExams.push({
                    id: questionId,
                    course_id: course.id,
                    is_final_exam: true,
                    question_text: `Final Exam Question ${i} for ${course.title}`,
                    question_order: i,
                    question_type: 'multiple_choice'
                });

                // Create 4 options per final exam question
                const correctAnswerIndex = Math.floor(Math.random() * 4);
                for (let j = 0; j < 4; j++) {
                    finalExamOptions.push({
                        question_id: questionId,
                        option_text: `Final Exam Option ${j + 1} for Question ${i}`,
                        is_correct: j === correctAnswerIndex,
                        option_order: j + 1
                    });
                }
            }
        });

        console.log('Inserting final exam questions...');
        const { error: finalExamError } = await supabase
            .from('quiz_questions')
            .insert(finalExams);

        if (finalExamError) {
            console.error('Error inserting final exam questions:', finalExamError.message);
            return;
        }

        console.log('Inserting final exam options...');
        const { error: finalExamOptionsError } = await supabase
            .from('quiz_options')
            .insert(finalExamOptions);

        if (finalExamOptionsError) {
            console.error('Error inserting final exam options:', finalExamOptionsError.message);
            return;
        }

        console.log('\n✅ Successfully seeded topics learning system!');
        console.log(`📚 Courses: ${insertedCourses.length}`);
        console.log(`📹 Topics: ${insertedTopics.length}`);
        console.log(`📝 Quiz Questions: ${quizQuestions.length + finalExams.length}`);
        console.log(`✅ Quiz Options: ${quizOptions.length + finalExamOptions.length}`);
        console.log('\nYour hierarchy is now: Courses > Topics > Videos & Quizzes');

    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seedTopicsSystem();
