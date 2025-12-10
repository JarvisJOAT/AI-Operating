# Construction Management API Reference

Complete API documentation for the Construction Management backend service.

## Base URL

```
Development: http://localhost:3003
Production:  https://your-construction-api.com
```

## Authentication

All endpoints require JWT authentication unless marked as public.

```http
Authorization: Bearer <your-jwt-token>
```

---

## Project Endpoints

### List Projects

```http
GET /api/projects
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | Filter by status (active, completed, on_hold) |
| `limit` | number | Max results (default: 50) |
| `offset` | number | Pagination offset |

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Office Renovation",
    "description": "Main floor renovation project",
    "status": "active",
    "start_date": "2024-01-15",
    "end_date": "2024-04-15",
    "budget": 150000.00,
    "spent": 45230.50,
    "members_count": 8,
    "tasks_count": 24,
    "created_at": "2024-01-10T10:00:00Z"
  }
]
```

### Create Project

```http
POST /api/projects
```

**Request:**
```json
{
  "name": "New Construction Project",
  "description": "Project description",
  "start_date": "2024-02-01",
  "end_date": "2024-06-30",
  "budget": 200000.00,
  "client_name": "ABC Corporation",
  "address": "123 Main St, Houston, TX"
}
```

### Get Project

```http
GET /api/projects/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Office Renovation",
  "description": "Main floor renovation project",
  "status": "active",
  "start_date": "2024-01-15",
  "end_date": "2024-04-15",
  "budget": 150000.00,
  "spent": 45230.50,
  "members": [...],
  "recent_tasks": [...],
  "recent_expenses": [...],
  "expense_breakdown": {
    "Materials": 25000.00,
    "Labor": 15000.00,
    "Equipment": 5230.50
  }
}
```

### Update Project

```http
PUT /api/projects/:id
```

**Request:**
```json
{
  "status": "completed",
  "actual_end_date": "2024-04-10"
}
```

### Delete Project

```http
DELETE /api/projects/:id
```

---

## Task Endpoints

### List Project Tasks

```http
GET /api/projects/:projectId/tasks
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | Filter by status |
| `assignee` | string | Filter by assignee ID |
| `priority` | string | Filter by priority |

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Install drywall Section A",
    "description": "Complete drywall installation",
    "status": "in_progress",
    "priority": "high",
    "assignee_id": "uuid",
    "assignee_name": "Carlos M.",
    "due_date": "2024-02-20",
    "estimated_hours": 16,
    "logged_hours": 8.5,
    "created_at": "2024-02-10T09:00:00Z"
  }
]
```

### Create Task

```http
POST /api/projects/:projectId/tasks
```

**Request:**
```json
{
  "title": "Paint walls Section B",
  "description": "Apply primer and two coats of paint",
  "assignee_id": "uuid",
  "priority": "medium",
  "due_date": "2024-02-25",
  "estimated_hours": 24,
  "tags": ["painting", "interior"]
}
```

### Update Task

```http
PUT /api/tasks/:id
```

**Request:**
```json
{
  "status": "completed",
  "logged_hours": 22.5
}
```

### Update Task Status (Quick Update)

```http
PATCH /api/tasks/:id/status
```

**Request:**
```json
{
  "status": "in_progress"
}
```

**Valid Statuses:**
- `backlog`
- `todo`
- `in_progress`
- `review`
- `completed`
- `blocked`

### Log Time

```http
POST /api/tasks/:id/time
```

**Request:**
```json
{
  "hours": 4.5,
  "description": "Completed first coat of paint",
  "date": "2024-02-18"
}
```

---

## Team Member Endpoints

### List Project Members

```http
GET /api/projects/:projectId/members
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Carlos Martinez",
    "email": "carlos@example.com",
    "role": "worker",
    "preferred_language": "es",
    "joined_at": "2024-01-15T10:00:00Z",
    "tasks_assigned": 5,
    "tasks_completed": 3
  }
]
```

### Add Project Member

```http
POST /api/projects/:projectId/members
```

**Request:**
```json
{
  "email": "newmember@example.com",
  "role": "worker",
  "preferred_language": "es"
}
```

**Valid Roles:**
- `owner` - Full access
- `manager` - Manage project, assign tasks
- `worker` - Complete tasks, submit receipts
- `viewer` - Read-only access

### Update Member Role

```http
PUT /api/projects/:projectId/members/:memberId
```

**Request:**
```json
{
  "role": "manager"
}
```

### Remove Member

```http
DELETE /api/projects/:projectId/members/:memberId
```

---

## Receipt Endpoints

### Upload Receipt

```http
POST /api/receipts/upload
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Receipt image or PDF |
| `projectId` | string | Yes | Project UUID |
| `category` | string | No | Expense category |
| `notes` | string | No | Additional notes |

**Response:**
```json
{
  "receiptId": "uuid",
  "status": "processing",
  "message": "Receipt uploaded successfully"
}
```

### Get Receipt Status

```http
GET /api/receipts/:id/status
```

**Response:**
```json
{
  "id": "uuid",
  "status": "needs_review",
  "confidence": 0.78,
  "extractedData": {
    "vendor": { "value": "Home Depot", "confidence": 0.95 },
    "date": { "value": "2024-02-15", "confidence": 0.92 },
    "total": { "value": 156.78, "confidence": 0.88 },
    "items": [...]
  },
  "processingTime": 3.2
}
```

### Get Receipt

```http
GET /api/receipts/:id
```

### List Project Receipts

```http
GET /api/projects/:projectId/receipts
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | Filter by status (processing, needs_review, approved, rejected) |
| `dateFrom` | string | Filter from date |
| `dateTo` | string | Filter to date |

### Update Receipt Data

```http
PUT /api/receipts/:id
```

**Request:**
```json
{
  "vendor": "Home Depot",
  "date": "2024-02-15",
  "total": 156.78,
  "tax": 12.95,
  "category": "Materials",
  "items": [
    {
      "description": "2x4 Lumber 8ft",
      "quantity": 20,
      "unitPrice": 4.99,
      "total": 99.80
    }
  ]
}
```

### Approve Receipt

```http
POST /api/receipts/:id/approve
```

Creates expense from receipt data.

### Reject Receipt

```http
POST /api/receipts/:id/reject
```

**Request:**
```json
{
  "reason": "Duplicate receipt"
}
```

---

## Expense Endpoints

### List Project Expenses

```http
GET /api/projects/:projectId/expenses
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `category` | string | Filter by category |
| `dateFrom` | string | Start date |
| `dateTo` | string | End date |
| `minAmount` | number | Minimum amount |
| `maxAmount` | number | Maximum amount |

**Response:**
```json
[
  {
    "id": "uuid",
    "vendor": "Home Depot",
    "description": "Materials for Section A",
    "amount": 156.78,
    "category": "Materials",
    "date": "2024-02-15",
    "receipt_id": "uuid",
    "receipt_url": "https://...",
    "created_by": "Carlos M.",
    "created_at": "2024-02-15T14:30:00Z"
  }
]
```

### Create Manual Expense

```http
POST /api/projects/:projectId/expenses
```

**Request:**
```json
{
  "vendor": "Joe's Tool Rental",
  "description": "Concrete mixer rental",
  "amount": 150.00,
  "category": "Equipment",
  "date": "2024-02-16"
}
```

### Update Expense

```http
PUT /api/expenses/:id
```

### Delete Expense

```http
DELETE /api/expenses/:id
```

### Get Expense Summary

```http
GET /api/projects/:projectId/expenses/summary
```

**Response:**
```json
{
  "total": 45230.50,
  "budget": 150000.00,
  "remaining": 104769.50,
  "percentage_used": 30.15,
  "by_category": {
    "Materials": 25000.00,
    "Labor": 15000.00,
    "Equipment": 5230.50
  },
  "by_month": {
    "2024-01": 12500.00,
    "2024-02": 32730.50
  }
}
```

---

## Translation Endpoints

### Translate Text

```http
POST /api/translation/translate
```

**Request:**
```json
{
  "text": "We need more materials",
  "targetLanguage": "es",
  "sourceLanguage": "en"  // Optional, auto-detected if not provided
}
```

**Response:**
```json
{
  "translatedText": "Necesitamos más materiales",
  "sourceLanguage": "en",
  "targetLanguage": "es",
  "confidence": 0.98,
  "cached": false
}
```

### Batch Translate

```http
POST /api/translation/batch
```

**Request:**
```json
{
  "texts": [
    "Hello team",
    "Meeting at 3pm",
    "Bring the blueprints"
  ],
  "targetLanguage": "es"
}
```

**Response:**
```json
{
  "translations": [
    { "original": "Hello team", "translated": "Hola equipo" },
    { "original": "Meeting at 3pm", "translated": "Reunión a las 3pm" },
    { "original": "Bring the blueprints", "translated": "Trae los planos" }
  ],
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

### Detect Language

```http
POST /api/translation/detect
```

**Request:**
```json
{
  "text": "Necesitamos más materiales"
}
```

**Response:**
```json
{
  "language": "es",
  "confidence": 0.98,
  "alternatives": [
    { "language": "pt", "confidence": 0.12 }
  ]
}
```

### Get Supported Languages

```http
GET /api/translation/languages
```

**Response:**
```json
{
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "es", "name": "Spanish" },
    { "code": "pt", "name": "Portuguese" },
    { "code": "zh", "name": "Chinese" },
    { "code": "vi", "name": "Vietnamese" },
    { "code": "tl", "name": "Tagalog" }
  ]
}
```

---

## Message Endpoints

### Get Project Messages

```http
GET /api/projects/:projectId/messages
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `limit` | number | Messages to return (default: 50) |
| `before` | string | Get messages before timestamp |
| `language` | string | Translate to language code |

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "sender_name": "Carlos M.",
      "original_text": "Necesitamos más concreto",
      "original_language": "es",
      "translated_text": "We need more concrete",
      "translated_to": "en",
      "created_at": "2024-02-18T10:30:00Z"
    }
  ],
  "hasMore": true
}
```

### Send Message

```http
POST /api/projects/:projectId/messages
```

**Request:**
```json
{
  "text": "The materials arrived"
}
```

### Get Message Translations

```http
GET /api/messages/:id/translations
```

**Response:**
```json
{
  "original": {
    "text": "We need more concrete",
    "language": "en"
  },
  "translations": [
    { "language": "es", "text": "Necesitamos más concreto" },
    { "language": "pt", "text": "Precisamos de mais concreto" }
  ]
}
```

---

## Document Endpoints

### Upload Document

```http
POST /api/projects/:projectId/documents/upload
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Document file |
| `name` | string | No | Custom name |
| `folder` | string | No | Folder path |
| `description` | string | No | Description |

### List Documents

```http
GET /api/projects/:projectId/documents
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `folder` | string | Filter by folder |
| `type` | string | Filter by type (pdf, image, etc.) |

### Get Document

```http
GET /api/documents/:id
```

### Get Document Versions

```http
GET /api/documents/:id/versions
```

**Response:**
```json
{
  "current_version": 3,
  "versions": [
    {
      "version": 3,
      "url": "https://...",
      "uploaded_by": "John D.",
      "uploaded_at": "2024-02-18T14:00:00Z",
      "size": 1234567,
      "changes": "Updated floor plan"
    },
    {
      "version": 2,
      "url": "https://...",
      "uploaded_by": "John D.",
      "uploaded_at": "2024-02-15T10:00:00Z"
    }
  ]
}
```

### Upload New Version

```http
POST /api/documents/:id/versions
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | New version |
| `changes` | string | No | Change description |

### Download Specific Version

```http
GET /api/documents/:id/versions/:version/download
```

---

## OCR Endpoints

### Process Receipt OCR

```http
POST /api/ocr/process
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | file | Receipt image/PDF |

**Response:**
```json
{
  "text": "HOME DEPOT\n#1234\nDate: 02/15/2024\n...",
  "confidence": 0.92,
  "structuredData": {
    "vendor": "Home Depot",
    "date": "2024-02-15",
    "items": [...],
    "subtotal": 143.83,
    "tax": 12.95,
    "total": 156.78
  },
  "processingTime": 2.8
}
```

### Re-process Receipt

```http
POST /api/ocr/reprocess/:receiptId
```

Forces re-processing with updated OCR settings.

---

## User Settings Endpoints

### Get User Settings

```http
GET /api/users/me/settings
```

**Response:**
```json
{
  "preferred_language": "es",
  "notifications": {
    "email": true,
    "push": true,
    "sms": false
  },
  "timezone": "America/Chicago"
}
```

### Update User Settings

```http
PUT /api/users/me/settings
```

**Request:**
```json
{
  "preferred_language": "en",
  "notifications": {
    "email": true
  }
}
```

---

## Error Responses

### Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "requestId": "uuid"
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_INPUT` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE` | 409 | Duplicate entry |
| `FILE_TOO_LARGE` | 413 | File exceeds limit |
| `UNSUPPORTED_TYPE` | 415 | Unsupported file type |
| `QUOTA_EXCEEDED` | 429 | Rate limit reached |
| `OCR_FAILED` | 500 | OCR processing failed |
| `TRANSLATION_FAILED` | 500 | Translation failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Translation | 100/minute |
| OCR Processing | 20/minute |
| File Upload | 30/minute |
| API General | 1000/hour |

---

## Webhooks

### Real-time Updates

Use Supabase Realtime for live updates:

```typescript
const channel = supabase
  .channel('project-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: `project_id=eq.${projectId}`,
    },
    (payload) => {
      console.log('New message:', payload);
    }
  )
  .subscribe();
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ConstructionAPI } from './construction-api';

const api = new ConstructionAPI({
  baseUrl: 'http://localhost:3003',
  token: 'your-jwt-token',
});

// Create project
const project = await api.projects.create({
  name: 'New Project',
  budget: 100000,
});

// Upload receipt
const receipt = await api.receipts.upload(
  project.id,
  file,
  { category: 'Materials' }
);

// Send translated message
const message = await api.messages.send(project.id, 'Hello team');
```

### cURL

```bash
# Upload receipt
curl -X POST http://localhost:3003/api/receipts/upload \
  -H "Authorization: Bearer token" \
  -F "file=@receipt.jpg" \
  -F "projectId=uuid"

# Translate text
curl -X POST http://localhost:3003/api/translation/translate \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","targetLanguage":"es"}'
```

