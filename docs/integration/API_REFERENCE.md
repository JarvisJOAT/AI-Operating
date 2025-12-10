# Unified API Reference

Comprehensive API documentation for the AI-Operating platform and all business applications.

## Overview

This document provides a unified view of all APIs across the platform.

| Service | Base URL | Port |
|---------|----------|------|
| AI-Operating API | `/api` | 3000 |
| Keys Open Doors | `/api` | 3001 |
| Food Truck | `/api` | 3002 |
| Construction Mgmt | `/api` | 3003 |

## Authentication

### JWT Authentication

All APIs use JWT tokens from Supabase Auth.

```http
Authorization: Bearer <jwt-token>
```

### API Keys (Service-to-Service)

```http
X-API-Key: <api-key>
```

### Getting a Token

```typescript
// Frontend
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Attach to requests
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

## AI-Operating Platform API

### Organizations

#### List Organizations

```http
GET /api/organizations
```

**Response:**
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "My Company",
      "slug": "my-company",
      "subscription_tier": "pro",
      "member_count": 5
    }
  ]
}
```

#### Get Organization

```http
GET /api/organizations/:id
```

#### Create Organization

```http
POST /api/organizations
```

```json
{
  "name": "New Organization",
  "slug": "new-org"
}
```

---

### App Instances

#### List App Instances

```http
GET /api/app-instances
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `organization_id` | string | Filter by organization |
| `app_id` | string | Filter by app type |
| `status` | string | Filter by status |

**Response:**
```json
{
  "instances": [
    {
      "id": "uuid",
      "app_id": "keys-open-doors",
      "organization_id": "uuid",
      "status": "active",
      "configuration": {},
      "last_sync": "2024-01-15T10:00:00Z",
      "metrics": {
        "orders_today": 15,
        "revenue_today": 450.00
      }
    }
  ]
}
```

#### Create App Instance

```http
POST /api/app-instances
```

```json
{
  "app_id": "food-truck",
  "organization_id": "uuid",
  "configuration": {
    "business_name": "My Food Truck",
    "timezone": "America/Chicago"
  }
}
```

#### Update App Instance

```http
PUT /api/app-instances/:id
```

#### Delete App Instance

```http
DELETE /api/app-instances/:id
```

---

### Data Sync

#### Trigger Sync

```http
POST /api/sync/:instanceId
```

```json
{
  "type": "full",
  "tables": ["orders", "customers"]
}
```

#### Get Sync Status

```http
GET /api/sync/:instanceId/status
```

**Response:**
```json
{
  "last_sync": "2024-01-15T10:00:00Z",
  "status": "completed",
  "next_scheduled": "2024-01-15T10:05:00Z",
  "tables": {
    "orders": {
      "synced": 150,
      "pending": 0
    }
  }
}
```

#### Get Sync History

```http
GET /api/sync/:instanceId/history
```

---

### Analytics

#### Get Dashboard Stats

```http
GET /api/analytics/dashboard
```

**Response:**
```json
{
  "total_organizations": 25,
  "total_app_instances": 48,
  "active_users_today": 156,
  "revenue_today": 12500.00,
  "apps_by_type": {
    "keys-open-doors": 15,
    "food-truck": 18,
    "construction-mgmt": 15
  }
}
```

#### Get Organization Analytics

```http
GET /api/analytics/organizations/:id
```

---

## Keys Open Doors API

### Scraping Jobs

#### Start Scraping Job

```http
POST /api/scraping/start
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "started",
  "message": "Scraping job initiated"
}
```

#### Get Job Status

```http
GET /api/scraping/status/:jobId
```

---

### Deals

#### List Deals

```http
GET /api/deals
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `status` | string | new, approved, posted, rejected |
| `city` | string | Filter by city |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |

#### Update Deal Status

```http
PUT /api/deals/:id/status
```

```json
{
  "status": "approved"
}
```

---

### Instagram Posts

#### Trigger Post

```http
POST /api/posts/trigger/:dealId
```

#### List Posts

```http
GET /api/posts
```

#### Get Post Analytics

```http
GET /api/posts/:id/analytics
```

---

## Food Truck API

### Menu

#### List Categories

```http
GET /api/menu/categories
```

#### List Items

```http
GET /api/menu/items
```

#### Update Item Availability

```http
PATCH /api/menu/items/:id/availability
```

```json
{
  "is_available": false
}
```

---

### Orders

#### Create Order

```http
POST /api/orders
```

```json
{
  "customer_name": "John",
  "customer_phone": "+1234567890",
  "items": [
    { "menu_item_id": "uuid", "quantity": 2 }
  ]
}
```

#### Get Order

```http
GET /api/orders/:id
```

#### Update Order Status

```http
PUT /api/orders/:id/status
```

```json
{
  "status": "ready"
}
```

---

### Voice Agent

#### Incoming Call Webhook

```http
POST /api/voice/incoming
```

TwiML response for Twilio.

#### Process Speech

```http
POST /api/voice/process
```

---

### Payments

#### Create Payment Intent

```http
POST /api/payments/create-intent
```

```json
{
  "order_id": "uuid"
}
```

#### Stripe Webhook

```http
POST /api/payments/webhook
```

---

## Construction Management API

### Projects

#### List Projects

```http
GET /api/projects
```

#### Create Project

```http
POST /api/projects
```

```json
{
  "name": "Office Renovation",
  "budget": 150000,
  "start_date": "2024-02-01",
  "end_date": "2024-06-30"
}
```

---

### Tasks

#### List Tasks

```http
GET /api/projects/:projectId/tasks
```

#### Create Task

```http
POST /api/projects/:projectId/tasks
```

```json
{
  "title": "Install drywall",
  "assignee_id": "uuid",
  "priority": "high",
  "due_date": "2024-02-15"
}
```

#### Update Task Status

```http
PATCH /api/tasks/:id/status
```

```json
{
  "status": "in_progress"
}
```

---

### Receipts & OCR

#### Upload Receipt

```http
POST /api/receipts/upload
Content-Type: multipart/form-data
```

| Field | Type | Required |
|-------|------|----------|
| file | file | Yes |
| projectId | string | Yes |

#### Get Receipt Data

```http
GET /api/receipts/:id
```

---

### Translation

#### Translate Text

```http
POST /api/translation/translate
```

```json
{
  "text": "Hello team",
  "targetLanguage": "es"
}
```

**Response:**
```json
{
  "translatedText": "Hola equipo",
  "sourceLanguage": "en"
}
```

#### Detect Language

```http
POST /api/translation/detect
```

---

### Messages

#### Get Messages

```http
GET /api/projects/:projectId/messages
```

**Query Parameters:**
| Name | Type | Description |
|------|------|-------------|
| limit | number | Messages to return |
| language | string | Target translation language |

#### Send Message

```http
POST /api/projects/:projectId/messages
```

```json
{
  "text": "Meeting in 5 minutes"
}
```

---

## Webhooks

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `order.created` | New order placed | Order object |
| `order.updated` | Order status changed | Order object |
| `sync.completed` | Data sync finished | Sync result |
| `config.updated` | App config changed | Config object |

### Webhook Signature Verification

```typescript
import crypto from 'crypto';

const verifySignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
};
```

---

## Rate Limiting

| Endpoint Type | Limit |
|---------------|-------|
| General API | 1000/hour |
| Authentication | 20/minute |
| File Upload | 50/hour |
| Webhooks | Unlimited |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "requestId": "uuid"
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## SDK Usage

### TypeScript/JavaScript

```typescript
import { AIOperatingClient } from '@ai-operating/sdk';

const client = new AIOperatingClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.your-domain.com',
});

// Get app instances
const instances = await client.appInstances.list();

// Create order (Food Truck)
const order = await client.foodTruck.orders.create({
  customer_name: 'John',
  items: [{ menu_item_id: 'uuid', quantity: 1 }],
});

// Translate text (Construction)
const translation = await client.construction.translate({
  text: 'Hello',
  targetLanguage: 'es',
});
```

### cURL Examples

```bash
# Get auth token
TOKEN=$(curl -X POST 'https://your-supabase.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# List app instances
curl 'https://api.your-domain.com/api/app-instances' \
  -H "Authorization: Bearer $TOKEN"

# Create order
curl -X POST 'https://food.your-domain.com/api/orders' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"customer_name":"John","items":[{"menu_item_id":"uuid","quantity":1}]}'
```

---

For app-specific details, see:
- [Keys Open Doors API](../../business-apps/keys-open-doors/docs/API_REFERENCE.md)
- [Food Truck API](../../business-apps/food-truck/docs/API_REFERENCE.md)
- [Construction Management API](../../business-apps/construction-mgmt/docs/API_REFERENCE.md)

