# Smart Email Assistant API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```
#### Request Body
```json
{
    "username": "string (3-50 chars)",
    "email": "string (valid email)",
    "password": "string (min 6 chars)",
    "firstName": "string (optional)",
    "lastName": "string (optional)"
}
```
#### Response
```json
{
    "token": "string (JWT token)",
    "username": "string",
    "email": "string"
}
```

### Login
```http
POST /api/auth/login
```
#### Request Body
```json
{
    "username": "string",
    "password": "string"
}
```
#### Response
```json
{
    "token": "string (JWT token)",
    "username": "string",
    "email": "string"
}
```

### Test Authentication
```http
GET /api/auth/test
```
#### Headers
- Authorization: Bearer {token}
#### Response
```json
{
    "message": "Auth service running"
}
```

## Email Generation Endpoints

### Generate Multiple Email Replies
```http
POST /api/email/generate
```
#### Headers
- Authorization: Bearer {token}
#### Request Body
```json
{
    "subject": "string (required)",
    "emailContent": "string (required)",
    "tone": "string (optional, e.g., 'professional', 'casual')",
    "language": "string (optional, e.g., 'en', 'fr')"
}
```
#### Response
```json
{
    "replies": ["string", "string", "string"],
    "summary": "string"
}
```

### Regenerate Email Replies
```http
POST /api/email/regenerate
```
#### Headers
- Authorization: Bearer {token}
#### Request Body
```json
{
    "subject": "string (required)",
    "emailContent": "string (required)",
    "tone": "string (optional)",
    "language": "string (optional)"
}
```
#### Response
```json
{
    "replies": ["string", "string", "string"],
    "summary": "string"
}
```

### Generate Single Email Reply
```http
POST /api/email/generate-single
```
#### Headers
- Authorization: Bearer {token}
#### Request Body
```json
{
    "subject": "string (required)",
    "emailContent": "string (required)",
    "tone": "string (optional)",
    "language": "string (optional)"
}
```
#### Response
```json
{
    "reply": "string"
}
```

### Test Email Generation
```http
GET /api/email/test
```
#### Response
```json
{
    "status": "ok",
    "sample": "string"
}
```

## Saved Replies Endpoints

### Save Reply
```http
POST /api/replies/save
```
#### Headers
- Authorization: Bearer {token}
#### Request Body
```json
{
    "emailSubject": "string (required)",
    "emailContent": "string (required)",
    "tone": "string (optional)",
    "replyText": "string (required)",
    "summary": "string (optional)"
}
```
#### Response
```json
{
    "message": "Reply saved successfully",
    "id": "number",
    "createdAt": "string (timestamp)"
}
```

### Get Reply History
```http
GET /api/replies/history
```
#### Headers
- Authorization: Bearer {token}
#### Query Parameters
- page (optional, default: 0)
- size (optional, default: 20)
- tone (optional)
- fromDate (optional, ISO date-time)
- toDate (optional, ISO date-time)
#### Response
```json
{
    "content": ["SavedReply objects"],
    "totalPages": "number",
    "totalElements": "number",
    "currentPage": "number",
    "size": "number"
}
```

### Search Replies
```http
GET /api/replies/search
```
#### Headers
- Authorization: Bearer {token}
#### Query Parameters
- q (required): Search query
- tone (optional): Filter by tone
#### Response
```json
{
    "results": ["SavedReply objects"],
    "query": "string",
    "tone": "string",
    "total": "number"
}
```

### Get Favorite Replies
```http
GET /api/replies/favorites
```
#### Headers
- Authorization: Bearer {token}
#### Response
```json
{
    "favorites": ["SavedReply objects"],
    "total": "number"
}
```

### Toggle Favorite Status
```http
PUT /api/replies/{id}/favorite
```
#### Headers
- Authorization: Bearer {token}
#### Response
```json
{
    "message": "Added to favorites/Removed from favorites",
    "isFavorite": "boolean"
}
```

### Delete Reply
```http
DELETE /api/replies/{id}
```
#### Headers
- Authorization: Bearer {token}
#### Response
```json
{
    "message": "Reply deleted successfully"
}
```

### Get Reply Statistics
```http
GET /api/replies/stats
```
#### Headers
- Authorization: Bearer {token}
#### Response
```json
{
    "username": "string",
    "totalReplies": "number",
    "favoriteCount": "number",
    "toneDistribution": {"professional": "number", "casual": "number"},
    "recentActivity": ["timestamps"]
}
```

### Export Replies
```http
GET /api/replies/export
```
#### Headers
- Authorization: Bearer {token}
#### Response
- Content-Type: text/csv
- Content-Disposition: attachment; filename=saved_replies_{username}.csv

## Error Responses
All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "error": "string",
    "message": "string",
    "reason": "string"
}
```

### 401 Unauthorized
```json
{
    "error": "unauthorized",
    "message": "Authentication required"
}
```

### 500 Internal Server Error
```json
{
    "error": "string",
    "details": "string"
}
```
