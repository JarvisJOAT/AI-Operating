# Keys Open Doors Architecture

This document describes the system architecture, data flow, and component design of the Keys Open Doors application.

## System Overview

Keys Open Doors is a real estate automation platform that:
1. Scrapes wholesale property listings from InvestorLift
2. Generates AI-powered Instagram captions
3. Automatically posts to Instagram
4. Tracks engagement analytics

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Keys Open Doors                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Scheduler│───▶│ Scraper  │───▶│ Caption  │───▶│ Poster   │      │
│  │ (Cron)   │    │ Service  │    │ Generator│    │ Service  │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │             │
│       │               ▼               │               ▼             │
│       │         ┌──────────┐         │         ┌──────────┐        │
│       │         │InvestorLift│        │         │ Instagram │        │
│       │         │ Website   │        │         │   API     │        │
│       │         └──────────┘         │         └──────────┘        │
│       │               │               │               │             │
│       ▼               ▼               ▼               ▼             │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                      Supabase                             │      │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ │      │
│  │  │ scraping_ │ │ scraped_  │ │ instagram_│ │   post_   │ │      │
│  │  │   jobs    │ │   deals   │ │   posts   │ │ analytics │ │      │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘ │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Node.js 18+ | Server runtime |
| **Language** | TypeScript | Type safety |
| **Framework** | Express.js | REST API |
| **Scraping** | Selenium WebDriver | Browser automation |
| **Database** | Supabase (PostgreSQL) | Data persistence |
| **AI** | OpenAI GPT-4o | Caption generation |
| **Instagram** | Graph API / instagrapi | Social posting |
| **Scheduling** | node-cron | Task scheduling |

## Directory Structure

```
keys-open-doors/
├── src/
│   ├── index.ts              # Application entry point
│   ├── config/
│   │   └── index.ts          # Configuration management
│   ├── routes/
│   │   ├── scraping.ts       # Scraping endpoints
│   │   ├── deals.ts          # Deal management endpoints
│   │   ├── posts.ts          # Instagram post endpoints
│   │   ├── analytics.ts      # Analytics endpoints
│   │   └── config.ts         # Configuration endpoints
│   ├── services/
│   │   ├── scheduler.ts      # Cron job scheduler
│   │   ├── scraper.ts        # InvestorLift scraping
│   │   ├── poster.ts         # Instagram posting
│   │   └── caption-generator.ts  # AI caption generation
│   ├── utils/
│   │   ├── logger.ts         # Logging middleware
│   │   └── supabase.ts       # Supabase client
│   └── types/
│       └── database.ts       # TypeScript types
├── docs/                     # Documentation
├── temp_images/             # Temporary image storage
├── package.json
├── tsconfig.json
└── .env
```

## Core Components

### 1. Scheduler Service

Manages automated scraping schedules.

```typescript
// src/services/scheduler.ts

// Cron expression: "0 3 * * MON,THU"
// Runs at 3:00 AM on Monday and Thursday

┌───────────── minute (0)
│ ┌─────────── hour (3)
│ │ ┌───────── day of month (*)
│ │ │ ┌─────── month (*)
│ │ │ │ ┌───── day of week (MON,THU)
│ │ │ │ │
0 3 * * MON,THU
```

**Flow:**
```
Scheduler Tick
      │
      ▼
┌─────────────┐
│ Load Config │
└─────────────┘
      │
      ▼
┌─────────────┐
│ Start Scrape│───────────────────┐
└─────────────┘                   │
      │                           │
      ▼                           │
┌─────────────┐                   │
│ Wait for    │                   │
│ Completion  │                   │
└─────────────┘                   │
      │                           │
      ▼                           │
┌─────────────┐    No             │
│ Auto-Post?  │─────────────────┐ │
└─────────────┘                 │ │
      │ Yes                     │ │
      ▼                         │ │
┌─────────────┐                 │ │
│ Post Deals  │                 │ │
└─────────────┘                 │ │
      │                         │ │
      ▼                         ▼ ▼
   [Done]◀──────────────────────┘
```

### 2. Scraper Service

Handles InvestorLift data extraction.

```typescript
// Scraping workflow
┌─────────────────────────────────────────────────────────┐
│                  Scraper Service                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Initialize Browser                                   │
│     └─▶ Chrome with undetected-chromedriver              │
│                                                          │
│  2. Login to InvestorLift                                │
│     └─▶ Enter credentials                                │
│     └─▶ Handle 2FA if needed                             │
│                                                          │
│  3. Navigate to Marketplace                              │
│     └─▶ Apply location filters                           │
│     └─▶ Apply price filters                              │
│                                                          │
│  4. Scrape Deal Cards                                    │
│     └─▶ Scroll to load more                              │
│     └─▶ Extract: title, price, location, images, URL     │
│                                                          │
│  5. Download Images                                      │
│     └─▶ Save to temp directory                           │
│     └─▶ Run face detection filter                        │
│                                                          │
│  6. Save to Database                                     │
│     └─▶ Insert/update scraped_deals table                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Anti-Detection Measures:**
- Random delays between actions
- Human-like scroll patterns
- Realistic user agent strings
- Headless browser evasion techniques

### 3. Caption Generator Service

Uses OpenAI to create engaging captions.

```typescript
// Caption generation flow
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Deal    │────▶│  Prompt  │────▶│  OpenAI  │
│  Data    │     │ Builder  │     │   API    │
└──────────┘     └──────────┘     └──────────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │ Caption  │
                                 │  +       │
                                 │ Hashtags │
                                 └──────────┘
```

**Prompt Structure:**
```
Generate a compelling Instagram caption for a real estate deal:

Deal Details:
- Title: {title}
- Price: {price}
- Location: {location}
- Link: {url}

Requirements:
- Include relevant hashtags
- Add call to action
- Keep under 2200 characters
- Make it engaging for investors
```

### 4. Poster Service

Handles Instagram publishing.

```typescript
// Posting flow
┌─────────────────────────────────────────────────────────┐
│                   Poster Service                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Fetch Deal from Database                             │
│     └─▶ Get deal by ID                                   │
│     └─▶ Verify status = 'approved' or 'new'              │
│                                                          │
│  2. Generate Caption                                     │
│     └─▶ AI caption OR template fallback                  │
│                                                          │
│  3. Download Image                                       │
│     └─▶ Save to temp directory                           │
│     └─▶ Validate format and size                         │
│                                                          │
│  4. Upload to Instagram                                  │
│     ├─▶ Graph API: Upload → Publish                      │
│     └─▶ Instagrapi: Direct upload                        │
│                                                          │
│  5. Record in Database                                   │
│     └─▶ Create instagram_posts record                    │
│     └─▶ Update deal status = 'posted'                    │
│                                                          │
│  6. Cleanup                                              │
│     └─▶ Delete temp image                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌───────────────────┐       ┌───────────────────┐
│   scraping_jobs   │       │   scraped_deals   │
├───────────────────┤       ├───────────────────┤
│ id (PK)           │◀──┐   │ id (PK)           │
│ organization_id   │   │   │ organization_id   │
│ status            │   └───│ scraping_job_id   │
│ started_at        │       │ title             │
│ completed_at      │       │ description       │
│ error_message     │       │ price             │
│ created_at        │       │ location          │
│ updated_at        │       │ image_url         │
└───────────────────┘       │ deal_url          │
                            │ scraped_at        │
                            │ status            │
                            │ metadata          │
                            │ created_at        │
                            │ updated_at        │
                            └───────────────────┘
                                    │
                                    │ 1:N
                                    ▼
                            ┌───────────────────┐
                            │  instagram_posts  │
                            ├───────────────────┤
                            │ id (PK)           │
                            │ organization_id   │
                            │ deal_id (FK)      │
                            │ caption           │
                            │ image_url         │
                            │ instagram_post_id │
                            │ posted_at         │
                            │ status            │
                            │ created_at        │
                            │ updated_at        │
                            └───────────────────┘
                                    │
                                    │ 1:N
                                    ▼
                            ┌───────────────────┐
                            │  post_analytics   │
                            ├───────────────────┤
                            │ id (PK)           │
                            │ organization_id   │
                            │ instagram_post_id │
                            │ likes             │
                            │ comments          │
                            │ reach             │
                            │ impressions       │
                            │ collected_at      │
                            │ created_at        │
                            │ updated_at        │
                            └───────────────────┘
```

### Status Enumerations

**Scraping Job Status:**
| Status | Description |
|--------|-------------|
| `pending` | Job created, not started |
| `in_progress` | Currently scraping |
| `completed` | Successfully finished |
| `failed` | Error occurred |

**Deal Status:**
| Status | Description |
|--------|-------------|
| `new` | Just scraped |
| `pending_review` | Awaiting manual approval |
| `approved` | Ready to post |
| `rejected` | Won't be posted |
| `posted` | Successfully posted |
| `post_failed` | Posting failed |

**Post Status:**
| Status | Description |
|--------|-------------|
| `pending` | Scheduled for posting |
| `posted` | Successfully published |
| `failed` | Posting failed |

## API Architecture

### REST Endpoints

```
┌─────────────────────────────────────────────────────────┐
│                    Express Server                        │
│                   (localhost:3001)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  /api/scraping                                           │
│  ├── POST /start         - Start scraping job            │
│  └── GET  /status/:id    - Get job status                │
│                                                          │
│  /api/deals                                              │
│  ├── GET  /              - List all deals                │
│  ├── GET  /:id           - Get single deal               │
│  └── PUT  /:id/status    - Update deal status            │
│                                                          │
│  /api/posts                                              │
│  ├── GET  /              - List all posts                │
│  └── POST /trigger/:id   - Trigger manual post           │
│                                                          │
│  /api/analytics                                          │
│  └── GET  /              - Get post analytics            │
│                                                          │
│  /api/config                                             │
│  └── GET  /              - Get current config            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Request/Response Flow

```
Client Request
      │
      ▼
┌──────────┐
│  Express │
│  Router  │
└──────────┘
      │
      ▼
┌──────────┐     ┌──────────┐
│  Logger  │────▶│  Route   │
│Middleware│     │ Handler  │
└──────────┘     └──────────┘
                      │
                      ▼
                ┌──────────┐
                │ Service  │
                │  Layer   │
                └──────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌─────────┐ ┌──────────┐ ┌──────────┐
    │Supabase │ │ External │ │  OpenAI  │
    │   DB    │ │   APIs   │ │   API    │
    └─────────┘ └──────────┘ └──────────┘
         │            │            │
         └────────────┼────────────┘
                      ▼
                ┌──────────┐
                │ Response │
                └──────────┘
```

## Integration with AI-Operating

### Data Synchronization

```
┌──────────────────┐         ┌──────────────────┐
│  Keys Open Doors │         │   AI-Operating   │
│      (App)       │         │    (Platform)    │
├──────────────────┤         ├──────────────────┤
│                  │         │                  │
│  scraped_deals   │────────▶│   sync_logs      │
│  instagram_posts │────────▶│   app_data       │
│  post_analytics  │────────▶│   analytics      │
│                  │         │                  │
└──────────────────┘         └──────────────────┘
        │                            │
        └────────────────────────────┘
              Periodic Sync (5-15 min)
```

### Agent Integration

The Keys Open Doors app integrates with the AI-Operating agent system:

```typescript
// Agent: Real Estate Scraping Agent
{
  id: 'real-estate-scraping-agent',
  name: 'Real Estate Scraping Agent',
  type: 'task',
  app: 'keys-open-doors',
  capabilities: [
    'trigger-scraping',
    'manage-deals',
    'trigger-posting',
    'view-analytics'
  ]
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  SCRAPING_ERROR = 'SCRAPING_ERROR',
  LOGIN_FAILED = 'LOGIN_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  POSTING_FAILED = 'POSTING_FAILED',
  CAPTION_GENERATION_FAILED = 'CAPTION_GENERATION_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```

### Retry Strategy

```
Initial Request
      │
      ▼
┌──────────┐
│ Execute  │
└──────────┘
      │
      ├── Success ──────────────────▶ Done
      │
      ▼ Failure
┌──────────┐
│ Attempt 1│─── Wait 1s ───▶ Retry
└──────────┘
      │
      ├── Success ──────────────────▶ Done
      │
      ▼ Failure
┌──────────┐
│ Attempt 2│─── Wait 2s ───▶ Retry
└──────────┘
      │
      ├── Success ──────────────────▶ Done
      │
      ▼ Failure
┌──────────┐
│ Attempt 3│─── Wait 4s ───▶ Retry
└──────────┘
      │
      ├── Success ──────────────────▶ Done
      │
      ▼ Failure
┌──────────┐
│ Log Error│──────────────────────▶ Alert
└──────────┘
```

## Security Considerations

### Credential Management

- All credentials stored in environment variables
- Never logged or exposed in responses
- Rotated regularly

### API Security

- Service role key used for backend operations
- RLS policies enforce data isolation
- Rate limiting on all endpoints

### Scraping Ethics

- Respect robots.txt
- Implement reasonable delays
- Don't overload target servers

---

## Related Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [User Manual](./USER_MANUAL.md)

