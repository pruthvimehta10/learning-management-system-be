// scripts/force-fix-schema.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// NOTE: Running DDL like CREATE TABLE via standard client requires Service Role key and typically not supported via standard RPC unless exposed.
// However, we can try to use raw SQL if enabled or just check availability. 
// If the user hasn't run the SQL script, we can't magically run it without service access or a configured RPC.
// WE WILL ASSUME THIS SCRIPT IS MAINLY FOR DIAGNOSIS if we can't run DDL.

console.log('Connecting to:', url);
const supabase = createClient(url, key);

async function checkAndAttemptFix() {
    console.log('--- Checking Labs Table ---');
    const { data, error } = await supabase.from('labs').select('count').limit(1);

    if (error && error.code === '42P01') { // undefined_table
        console.error('CRITICAL: Table "labs" does not exist!');
        console.log('The user MUST run scripts/setup_labs_schema.sql in the Supabase Dashboard.');
    } else if (error) {
        console.error('Error checking labs table:', error);
    } else {
        console.log('Labs table exists. Count result:', data);
    }

    console.log('--- Checking Lessons FK ---');
    // We can't easily check FK constraints via standard API without inspecting information_schema, which might be blocked.
    // But we know the JOIN failed.
}

checkAndAttemptFix();
