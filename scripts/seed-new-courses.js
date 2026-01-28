const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    console.log('--- Seeding New Courses ---');

    // 1. Get an existing instructor
    const { data: existingCourses, error: courseError } = await supabase
        .from('courses')
        .select('instructor_id')
        .limit(1);

    if (courseError || !existingCourses.length) {
        console.error('Error fetching instructor:', courseError || 'No existing courses found');
        return;
    }

    const instructorId = existingCourses[0].instructor_id;
    console.log('Using Instructor ID:', instructorId);

    // 2. Define New Courses
    const newCourses = [
        {
            title: 'Data Science & Analysis 101',
            description: 'Learn the core principles of data science, including statistical analysis, data visualization, and predictive modeling using modern tools.',
            instructor_id: instructorId,
            thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
            level: 'Beginner',
            duration_minutes: 120,
            is_published: true
        },
        {
            title: 'Business Strategy & Growth',
            description: 'Master the art of business scaling, competitive analysis, and strategic decision-making to drive organizational success.',
            instructor_id: instructorId,
            thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
            level: 'Intermediate',
            duration_minutes: 150,
            is_published: true
        }
    ];

    // 3. Insert Courses
    console.log('Inserting courses...');
    const { data, error } = await supabase
        .from('courses')
        .insert(newCourses)
        .select();

    if (error) {
        console.error('Error inserting courses:', error.message);
    } else {
        console.log('Successfully inserted courses:', data.map(c => c.title).join(', '));
    }
}

seed();
