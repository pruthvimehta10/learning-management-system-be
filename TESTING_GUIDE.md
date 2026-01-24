# Testing Guide - JWT Authentication

This guide explains how to test the new JWT-based authentication system in your local development environment.

## Quick Start

### Option 1: Using the Dev Token Manager (Easiest) ⭐

1. **Start the dev server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Visit the token manager page**:
   ```
   http://localhost:3000/dev/set-token
   ```

3. **Click one of the quick generate buttons**:
   - **Admin Token** - Full access to everything
   - **Instructor Token** - Access to admin panel
   - **Student Token** - Limited access (no admin)

4. **Click "Set Token"** to apply the token

5. **Navigate to protected pages**:
   - Admin Dashboard: `http://localhost:3000/admin`
   - Courses: `http://localhost:3000/courses/[course-id]`

### Option 2: Using Command Line

1. **Add the test secret to your `.env.local`**:
   ```bash
   EXTERNAL_JWT_SECRET=test-secret-key-change-in-production
   NEXT_PUBLIC_LOGIN_URL=http://localhost:3000/dev/set-token
   ```

2. **Generate a token**:
   ```bash
   # Admin token
   node scripts/generate-test-token.js admin

   # Instructor token
   node scripts/generate-test-token.js instructor

   # Student token
   node scripts/generate-test-token.js student
   ```

3. **Copy the token and set it in browser DevTools**:
   - Open DevTools (F12)
   - Go to Console tab
   - Paste: `document.cookie = "auth_token=YOUR_TOKEN_HERE; path=/"`

4. **Refresh the page** and you should be authenticated!

### Option 3: Using Browser Extensions

Install a cookie manager extension (like EditThisCookie) and manually add:
- **Name**: `auth_token`
- **Value**: Your JWT token
- **Path**: `/`

## Testing Different Scenarios

### 1. Test Admin Access ✅

**Setup**: Generate an admin token
```bash
node scripts/generate-test-token.js admin test_admin lab_123
```

**Expected Behavior**:
- ✅ Can access `/admin`
- ✅ Can access `/course-player`
- ✅ Can view all courses

### 2. Test Instructor Access ✅

**Setup**: Generate an instructor token
```bash
node scripts/generate-test-token.js instructor test_instructor lab_123
```

**Expected Behavior**:
- ✅ Can access `/admin`
- ✅ Can access `/course-player`
- ✅ Can view courses for their lab

### 3. Test Student Access ❌

**Setup**: Generate a student token
```bash
node scripts/generate-test-token.js student test_student lab_123
```

**Expected Behavior**:
- ❌ Cannot access `/admin` (redirected to home)
- ✅ Can access `/course-player`
- ✅ Can view courses for their lab

### 4. Test Lab-Based Access Control 🔒

**Setup**: Create a course with a specific `lab_id`

1. First, run the migration to add the `lab_id` column:
   ```bash
   # Copy the SQL from scripts/add-lab-id-column.sql
   # Run it in Supabase SQL Editor
   ```

2. Update a course in Supabase to have `lab_id = "lab_456"`

3. Generate a token with a different lab:
   ```bash
   node scripts/generate-test-token.js student test_user lab_123
   ```

**Expected Behavior**:
- ❌ User with `lab_123` cannot access course with `lab_id = "lab_456"`
- ✅ Shows "Access Denied" message

### 5. Test Without Token 🚫

**Setup**: Clear your token
```javascript
// In browser console
document.cookie = 'auth_token=; path=/; max-age=0'
```

**Expected Behavior**:
- ❌ Accessing `/admin` redirects to login URL
- ❌ Accessing `/course-player` redirects to login URL
- ✅ Public pages (home) still accessible

## Custom Token Claims

You can create tokens with custom claims:

```bash
node scripts/generate-test-token.js [role] [username] [labid]

# Examples:
node scripts/generate-test-token.js admin alice lab_001
node scripts/generate-test-token.js instructor bob lab_002
node scripts/generate-test-token.js student charlie lab_003
```

## Verifying Token Contents

To decode and verify your token, use [jwt.io](https://jwt.io):

1. Copy your token
2. Paste it into jwt.io
3. Verify the payload contains:
   ```json
   {
     "username": "test_user",
     "labid": "lab_123",
     "role": "admin"
   }
   ```

## Common Issues

### Issue: "Redirected to login URL"
**Solution**: Make sure you've set the token correctly and it hasn't expired (tokens last 24 hours)

### Issue: "Access Denied" on course page
**Solution**: Check that the course's `lab_id` matches your token's `labid` claim

### Issue: Token generation script fails
**Solution**: Make sure you've added `EXTERNAL_JWT_SECRET` to `.env.local`

### Issue: Can't access admin page even with admin token
**Solution**: 
1. Clear browser cache
2. Check browser console for errors
3. Verify token is set: `document.cookie` in console should show `auth_token`

## Production Testing

When testing with the actual "Bigger Project":

1. The external system should send JWTs via:
   - **Header**: `Authorization: Bearer <token>`
   - **OR Cookie**: `auth_token=<token>`

2. Ensure the JWT is signed with the same `EXTERNAL_JWT_SECRET`

3. JWT must include these claims:
   ```json
   {
     "username": "actual_username",
     "labid": "actual_lab_id",
     "role": "admin|instructor|student"
   }
   ```

## Security Notes

⚠️ **Important**: 
- The `/dev/set-token` page should be removed or protected in production
- Change `EXTERNAL_JWT_SECRET` to a secure value in production
- Never commit real JWT secrets to version control
- Tokens expire after 24 hours by default

## Next Steps

After testing locally:
1. ✅ Verify all role-based access controls work
2. ✅ Test lab-based course access
3. ✅ Coordinate with "Bigger Project" team on JWT format
4. ✅ Update production environment variables
5. ✅ Remove/disable dev tools in production
