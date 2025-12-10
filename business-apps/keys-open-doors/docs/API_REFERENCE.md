# Keys Open Doors API Reference

Complete API documentation for the Keys Open Doors backend service.

## Base URL

```
Development: http://localhost:3001
Production:  https://your-deployment-url.com
```

## Authentication

Currently, the API uses organization-based access controlled through the `ORGANIZATION_ID` environment variable. All endpoints operate within the context of this organization.

For future multi-tenant support, authentication will use JWT tokens from the AI-Operating platform.

---

## Scraping Endpoints

### Start Scraping Job

Initiates a new scraping job for InvestorLift.

```http
POST /api/scraping/start
```

**Request Body:** None required (uses environment configuration)

**Response:**
```json
{
  "message": "Scraping job started in the background.",
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 202 | Job started successfully |
| 400 | Organization ID not configured |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3001/api/scraping/start
```

---

### Get Scraping Job Status

Retrieves the status of a specific scraping job.

```http
GET /api/scraping/status/:jobId
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `jobId` | string (UUID) | The scraping job ID |

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "organization_id": "org-uuid",
  "status": "completed",
  "started_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T10:15:00Z",
  "error_message": null,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:15:00Z"
}
```

**Status Values:**
- `pending` - Job created, not started
- `in_progress` - Currently scraping
- `completed` - Successfully finished
- `failed` - Error occurred

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Organization ID not configured |
| 404 | Job not found |
| 500 | Internal server error |

**Example:**
```bash
curl http://localhost:3001/api/scraping/status/550e8400-e29b-41d4-a716-446655440000
```

---

## Deals Endpoints

### List All Deals

Retrieves all scraped deals for the organization.

```http
GET /api/deals
```

**Query Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `status` | string | - | Filter by deal status |
| `limit` | number | 100 | Maximum results |
| `offset` | number | 0 | Pagination offset |

**Response:**
```json
[
  {
    "id": "deal-uuid-1",
    "organization_id": "org-uuid",
    "scraping_job_id": "job-uuid",
    "title": "3BR/2BA Single Family Home",
    "description": "Great investment opportunity...",
    "price": "$125,000",
    "location": "Houston, TX",
    "image_url": "https://investorlift.com/images/deal1.jpg",
    "deal_url": "https://investorlift.com/deals/123",
    "scraped_at": "2024-01-15T10:05:00Z",
    "status": "new",
    "metadata": {},
    "created_at": "2024-01-15T10:05:00Z",
    "updated_at": "2024-01-15T10:05:00Z"
  }
]
```

**Example:**
```bash
# All deals
curl http://localhost:3001/api/deals

# Filter by status
curl "http://localhost:3001/api/deals?status=approved"

# Pagination
curl "http://localhost:3001/api/deals?limit=10&offset=20"
```

---

### Get Single Deal

Retrieves a specific deal by ID.

```http
GET /api/deals/:dealId
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `dealId` | string (UUID) | The deal ID |

**Response:**
```json
{
  "id": "deal-uuid-1",
  "organization_id": "org-uuid",
  "scraping_job_id": "job-uuid",
  "title": "3BR/2BA Single Family Home",
  "description": "Great investment opportunity...",
  "price": "$125,000",
  "location": "Houston, TX",
  "image_url": "https://investorlift.com/images/deal1.jpg",
  "deal_url": "https://investorlift.com/deals/123",
  "scraped_at": "2024-01-15T10:05:00Z",
  "status": "new",
  "metadata": {
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 1500
  },
  "created_at": "2024-01-15T10:05:00Z",
  "updated_at": "2024-01-15T10:05:00Z"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 404 | Deal not found |
| 500 | Internal server error |

---

### Update Deal Status

Updates the status of a deal (for approval workflow).

```http
PUT /api/deals/:dealId/status
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `dealId` | string (UUID) | The deal ID |

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:**
- `new` - Default status after scraping
- `pending_review` - Marked for review
- `approved` - Ready to post
- `rejected` - Won't be posted
- `posted` - Already posted
- `post_failed` - Posting failed

**Response:**
```json
{
  "id": "deal-uuid-1",
  "status": "approved",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Invalid status value |
| 404 | Deal not found |
| 500 | Internal server error |

**Example:**
```bash
curl -X PUT http://localhost:3001/api/deals/deal-uuid-1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

---

## Posts Endpoints

### List All Instagram Posts

Retrieves all Instagram posts for the organization.

```http
GET /api/posts
```

**Response:**
```json
[
  {
    "id": "post-uuid-1",
    "organization_id": "org-uuid",
    "deal_id": "deal-uuid-1",
    "caption": "🏠 NEW DEAL ALERT! 3BR/2BA in Houston...",
    "image_url": "https://investorlift.com/images/deal1.jpg",
    "instagram_post_id": "17895695668004550",
    "posted_at": "2024-01-15T12:00:00Z",
    "status": "posted",
    "created_at": "2024-01-15T12:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
]
```

---

### Trigger Instagram Post

Manually triggers an Instagram post for a specific deal.

```http
POST /api/posts/trigger/:dealId
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `dealId` | string (UUID) | The deal ID to post |

**Response:**
```json
{
  "message": "Instagram post for deal deal-uuid-1 triggered."
}
```

**Notes:**
- Post runs in background
- Deal must have `image_url`
- Respects rate limiting configuration

**Status Codes:**
| Code | Description |
|------|-------------|
| 202 | Post triggered |
| 400 | Missing deal ID or image |
| 404 | Deal not found |
| 500 | Internal server error |

**Example:**
```bash
curl -X POST http://localhost:3001/api/posts/trigger/deal-uuid-1
```

---

## Analytics Endpoints

### Get Post Analytics

Retrieves analytics for all Instagram posts.

```http
GET /api/analytics
```

**Response:**
```json
[
  {
    "id": "analytics-uuid-1",
    "organization_id": "org-uuid",
    "instagram_post_id": "post-uuid-1",
    "likes": 150,
    "comments": 23,
    "reach": 5420,
    "impressions": 8900,
    "collected_at": "2024-01-16T10:00:00Z",
    "created_at": "2024-01-16T10:00:00Z",
    "updated_at": "2024-01-16T10:00:00Z"
  }
]
```

---

## Configuration Endpoints

### Get Current Configuration

Retrieves the current application configuration (with sensitive data masked).

```http
GET /api/config
```

**Response:**
```json
{
  "organizationId": "org-uuid",
  "investorlift": {
    "login_url": "https://investorlift.com/login",
    "marketplace_url": "https://investorlift.com/marketplace",
    "email": "********",
    "password": "********",
    "filters": {
      "cities": ["Houston", "Dallas", "Austin"],
      "min_price": 50000,
      "max_price": 500000
    }
  },
  "instagram": {
    "method": "graph_api",
    "username": "********",
    "password": "********",
    "graph_api": {
      "access_token": "********",
      "page_id": "123456789",
      "app_id": "987654321",
      "app_secret": "********"
    },
    "use_ai_captions": true,
    "post_type": "post",
    "delay_between_posts": 60,
    "post_all_deals": false,
    "max_posts_per_run": 10,
    "filter_faces": true
  },
  "openai": {
    "api_key": "********",
    "model": "gpt-4o"
  },
  "supabase": {
    "url": "********",
    "anon_key": "********",
    "service_role_key": "********"
  }
}
```

---

## Error Responses

All endpoints may return error responses in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or missing data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

---

## Rate Limiting

Current rate limits (configurable):

| Endpoint | Limit |
|----------|-------|
| POST /api/scraping/start | 1/hour |
| POST /api/posts/trigger/* | 10/hour |
| GET endpoints | 100/minute |

When rate limited, you'll receive:
```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600
}
```

---

## Webhooks (Future)

Webhook endpoints for integration with AI-Operating platform (planned):

```http
POST /api/webhooks/ai-operating
```

Events:
- `scraping.started`
- `scraping.completed`
- `deal.created`
- `post.published`
- `analytics.updated`

---

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
// Using fetch
const startScraping = async () => {
  const response = await fetch('http://localhost:3001/api/scraping/start', {
    method: 'POST',
  });
  return response.json();
};

const getDeals = async (status?: string) => {
  const url = new URL('http://localhost:3001/api/deals');
  if (status) url.searchParams.set('status', status);
  const response = await fetch(url);
  return response.json();
};

const triggerPost = async (dealId: string) => {
  const response = await fetch(`http://localhost:3001/api/posts/trigger/${dealId}`, {
    method: 'POST',
  });
  return response.json();
};
```

### Python

```python
import requests

BASE_URL = "http://localhost:3001"

def start_scraping():
    response = requests.post(f"{BASE_URL}/api/scraping/start")
    return response.json()

def get_deals(status=None):
    params = {"status": status} if status else {}
    response = requests.get(f"{BASE_URL}/api/deals", params=params)
    return response.json()

def trigger_post(deal_id):
    response = requests.post(f"{BASE_URL}/api/posts/trigger/{deal_id}")
    return response.json()
```

### cURL

```bash
# Start scraping
curl -X POST http://localhost:3001/api/scraping/start

# Get all approved deals
curl "http://localhost:3001/api/deals?status=approved"

# Trigger a post
curl -X POST http://localhost:3001/api/posts/trigger/deal-uuid

# Update deal status
curl -X PUT http://localhost:3001/api/deals/deal-uuid/status \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
```

---

## Versioning

Current API version: **v1** (implicit)

Future versions will use URL prefix:
- `/api/v1/...`
- `/api/v2/...`

---

## Support

For API issues:
1. Check error response messages
2. Review [Setup Guide](./SETUP_GUIDE.md)
3. Check server logs
4. Contact development team

