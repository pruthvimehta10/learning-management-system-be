# LMS Integration Guide

## Overview
This document explains how to integrate your application with the Learning Management System (LMS) API.

## Base URL
- **Production:** `https://your-lms-domain.com`
- **Development:** `http://localhost:3000`

## Authentication

### JWT Token Requirements
All API requests must include a valid JWT token in one of two ways:

1. **Authorization Header** (Recommended):
   ```
   Authorization: Bearer <your-jwt-token>
   ```

2. **Cookie**:
   ```
   Cookie: auth_token=<your-jwt-token>
   ```

### Token Payload Structure
Your JWT tokens must be signed with the shared `EXTERNAL_JWT_SECRET` and include the following claims:

```json
{
  "sub": "user-unique-id",        // Required: User's unique identifier
  "role": "client",               // Required: "admin", "client", or "student"
  "lab_id": "lab-001"            // Optional: Lab identifier for multi-tenant access
}
```

### Supported Roles
- **admin**: Full access to all resources including admin panel
- **client**: Standard user access to courses and content
- **student**: Same as client (for compatibility)

## Quick Start

### 1. Import Postman Collection
Import the `postman_collection.json` file into Postman to see all available endpoints with examples.

### 2. Generate Test Token (Development Only)
```bash
POST {{base_url}}/api/dev/generate-token
Content-Type: application/json

{
  "role": "client",
  "sub": "test_user_123",
  "lab_id": "lab_001"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Verify Token Works
```bash
GET {{base_url}}/api/auth/me
Authorization: Bearer <token>
```

Response:
```json
{
  "authenticated": true,
  "user": {
    "userId": "test_user_123",
    "role": "client"
  },
  "claims": {
    "sub": "test_user_123",
    "role": "client",
    "lab_id": "lab_001"
  }
}
```

## Common Integration Flows

### Flow 1: Display Course Catalog
1. Call `GET /api/courses` to retrieve all published courses
2. Display courses in your UI
3. When user clicks a course, call `GET /api/courses/{id}` for details

### Flow 2: Enroll User in Course
1. User clicks "Enroll" or "Start Learning"
2. Call `POST /api/enrollments` with the course ID
3. Redirect user to the course player page

### Flow 3: Track Quiz Progress
1. User completes quiz in the LMS
2. LMS calls `POST /api/quiz/submit` with answers
3. Score is saved and returned (passing score is 70%)
4. Parent system can query `quiz_scores` table for reporting

### Flow 4: Stream Course Videos
1. Get video details from course/topic data
2. Use `GET /api/video?url={videoUrl}&topicId={topicId}` 
3. This endpoint validates access and streams the video securely
4. Supports byte-range requests for seeking

## API Endpoints Reference

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/me` | GET | Verify JWT token and get user info |
| `/api/dev/generate-token` | POST | Generate test token (dev only) |

### Courses
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/courses` | GET | Get all published courses |
| `/api/courses/{id}` | GET | Get course details with topics and quizzes |

### Enrollments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/enrollments` | POST | Enroll authenticated user in a course |

### Categories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET | Get all course categories |
| `/api/categories` | POST | Create new category (admin only) |

### Labs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/labs` | GET | Get all labs |
| `/api/labs/{id}` | GET | Get specific lab details |
| `/api/labs` | POST | Create new lab (admin only) |

### Quizzes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/quiz/submit` | POST | Submit quiz answers and get score |

### Video Streaming
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/video` | GET | Secure video streaming proxy with range support |

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Not authenticated"
}
```
**Solution:** Ensure you're sending a valid JWT token

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```
**Solution:** User role doesn't have access to this resource

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```
**Solution:** Check that the ID in the URL is correct

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
**Solution:** Contact LMS administrator

## Database Schema Access

If you need direct database access for reporting, these are the key tables:

- **courses**: Course catalog
- **topics**: Individual lessons/topics within courses
- **enrollments**: User-course relationships
- **quiz_scores**: Quiz attempt history with scores
- **quiz_questions**: Question bank
- **topic_completions**: Track which topics users have completed

## Security Considerations

1. **Never expose the JWT secret** in client-side code
2. **Always use HTTPS** in production
3. **Validate tokens** on every request
4. **Set appropriate token expiration** (recommended: 24 hours)
5. **Rotate secrets** periodically

## Support

For technical support or questions about this integration:
- Review the Postman collection for request/response examples
- Check server logs for detailed error messages
- Verify environment variables are set correctly

## Environment Variables Required

The LMS requires these environment variables:

```env
EXTERNAL_JWT_SECRET=<shared-secret-key>
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<supabase-key>
NEXT_PUBLIC_APP_URL=<your-app-url>
```

**Note:** The `EXTERNAL_JWT_SECRET` must match between your system and the parent project.
