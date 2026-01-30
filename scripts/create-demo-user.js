const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDemoUser() {
    console.log('--- Creating Demo User ---');

    try {
        // Create a demo user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: 'demo@instructor.com',
            password: 'demo123456',
            email_confirm: true,
            user_metadata: {
                full_name: 'Demo Instructor',
                role: 'instructor'
            }
        });

        if (authError) {
            console.error('Error creating auth user:', authError.message);
            return null;
        }

        console.log('Auth user created:', authData.user.email);

        // Create corresponding user profile
        const { data: profileData, error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: 'Demo Instructor',
                bio: 'Experienced instructor teaching web development, React, and data science courses.'
            })
            .select()
            .single();

        if (profileError) {
            console.error('Error creating user profile:', profileError.message);
            return null;
        }

        console.log('User profile created successfully!');
        console.log('Email: demo@instructor.com');
        console.log('Password: demo123456');
        
        return profileData;

    } catch (error) {
        console.error('User creation failed:', error);
        return null;
    }
}

createDemoUser();
