#!/usr/bin/env node

/**
 * Generate a test JWT token for local development
 * Usage: node scripts/generate-test-token.js [role] [username] [labid]
 */

const { SignJWT } = require('jose');

async function generateToken() {
    const role = process.argv[2] || 'admin';
    const username = process.argv[3] || 'test_user';
    const labid = process.argv[4] || 'lab_123';

    // Use the secret from .env.local or a default test secret
    const secret = process.env.EXTERNAL_JWT_SECRET || 'test-secret-key-change-in-production';
    const secretKey = new TextEncoder().encode(secret);

    const token = await new SignJWT({
        username,
        labid,
        role,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secretKey);

    console.log('\n🔐 Test JWT Token Generated!\n');
    console.log('Claims:');
    console.log(`  - username: ${username}`);
    console.log(`  - labid: ${labid}`);
    console.log(`  - role: ${role}`);
    console.log('\nToken:');
    console.log(token);
    console.log('\n📋 Copy this token and use it in one of these ways:\n');
    console.log('1. Browser DevTools:');
    console.log('   document.cookie = "auth_token=' + token + '; path=/"');
    console.log('\n2. API Request Header:');
    console.log('   Authorization: Bearer ' + token);
    console.log('\n3. Using the test page:');
    console.log('   Visit http://localhost:3000/dev/set-token and paste the token\n');
}

generateToken().catch(console.error);
