# Gasweb.info API Documentation

This document describes the API endpoints and data structures for Gasweb.info.

## Overview

Gasweb.info uses Supabase as its backend, which provides:
- **REST API**: Auto-generated from database schema
- **Real-time subscriptions**: WebSocket-based live updates
- **Edge Functions**: Custom serverless functions

## Authentication

### Supabase Auth

All authenticated requests require a valid JWT token.

#### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

#### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

#### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

#### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### API Key Authentication

For server-to-server communication, use the service role key:

```typescript
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

## Courses API

### List All Published Courses

```typescript
GET /rest/v1/courses?is_published=eq.true&select=*

// Response
[
  {
    "id": "uuid",
    "title": "AI Automation Fundamentals",
    "description": "Learn the basics...",
    "thumbnail_url": "https://...",
    "price": 99.99,
    "pricing_model": "one_time",
    "is_published": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

**Supabase Client:**
```typescript
const { data: courses, error } = await supabase
  .from('courses')
  .select('*')
  .eq('is_published', true)
  .order('created_at', { ascending: false });
```

### Get Single Course

```typescript
GET /rest/v1/courses?id=eq.{course_id}&select=*

// Response
{
  "id": "uuid",
  "title": "AI Automation Fundamentals",
  ...
}
```

**Supabase Client:**
```typescript
const { data: course, error } = await supabase
  .from('courses')
  .select('*')
  .eq('id', courseId)
  .single();
```

### Get Course with Content

```typescript
GET /rest/v1/courses?id=eq.{course_id}&select=*,course_content(*)

// Response
{
  "id": "uuid",
  "title": "AI Automation Fundamentals",
  "course_content": [
    {
      "id": "uuid",
      "title": "Module 1: Introduction",
      "content_type": "video",
      "content_url": "https://...",
      "order_index": 1,
      "is_preview": true
    }
  ]
}
```

**Supabase Client:**
```typescript
const { data, error } = await supabase
  .from('courses')
  .select(`
    *,
    course_content (
      id,
      title,
      content_type,
      content_url,
      text_content,
      order_index,
      is_preview
    )
  `)
  .eq('id', courseId)
  .single();
```

### Create Course (Admin)

```typescript
POST /rest/v1/courses

// Request Body
{
  "organization_id": "uuid",
  "title": "New Course",
  "description": "Course description...",
  "price": 49.99,
  "pricing_model": "one_time"
}

// Response
{
  "id": "new-uuid",
  ...
}
```

**Supabase Client:**
```typescript
const { data, error } = await supabase
  .from('courses')
  .insert({
    organization_id: orgId,
    title: 'New Course',
    description: 'Course description...',
    price: 49.99,
    pricing_model: 'one_time',
  })
  .select()
  .single();
```

### Update Course (Admin)

```typescript
PATCH /rest/v1/courses?id=eq.{course_id}

// Request Body
{
  "title": "Updated Title",
  "is_published": true
}
```

**Supabase Client:**
```typescript
const { data, error } = await supabase
  .from('courses')
  .update({ title: 'Updated Title', is_published: true })
  .eq('id', courseId)
  .select()
  .single();
```

### Delete Course (Admin)

```typescript
DELETE /rest/v1/courses?id=eq.{course_id}
```

**Supabase Client:**
```typescript
const { error } = await supabase
  .from('courses')
  .delete()
  .eq('id', courseId);
```

## Course Content API

### List Course Content

```typescript
const { data, error } = await supabase
  .from('course_content')
  .select('*')
  .eq('course_id', courseId)
  .order('order_index', { ascending: true });
```

### Add Course Content

```typescript
const { data, error } = await supabase
  .from('course_content')
  .insert({
    course_id: courseId,
    title: 'Module 1',
    content_type: 'video',
    content_url: 'https://youtube.com/embed/...',
    order_index: 1,
    is_preview: false,
  })
  .select()
  .single();
```

### Reorder Content

```typescript
// Update order for multiple items
const updates = contentItems.map((item, index) => ({
  id: item.id,
  order_index: index,
}));

for (const update of updates) {
  await supabase
    .from('course_content')
    .update({ order_index: update.order_index })
    .eq('id', update.id);
}
```

## Enrollments API

### Check Enrollment Status

```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .select('*')
  .eq('course_id', courseId)
  .eq('user_id', userId)
  .single();

const isEnrolled = !!data;
```

### Enroll User (After Payment)

```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .insert({
    user_id: userId,
    course_id: courseId,
  })
  .select()
  .single();
```

### Get User's Enrollments

```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .select(`
    *,
    course:courses (
      id,
      title,
      thumbnail_url
    )
  `)
  .eq('user_id', userId);
```

### Update Progress

```typescript
const { data, error } = await supabase
  .from('course_enrollments')
  .update({
    progress: {
      completedModules: ['module-1', 'module-2'],
      lastAccessed: new Date().toISOString(),
    },
  })
  .eq('course_id', courseId)
  .eq('user_id', userId);
```

## Landing Pages API

### Get Landing Page by Slug

```typescript
const { data, error } = await supabase
  .from('landing_pages')
  .select(`
    *,
    landing_page_links (*),
    landing_page_videos (*)
  `)
  .eq('slug', slug)
  .single();
```

### Create Landing Page

```typescript
const { data, error } = await supabase
  .from('landing_pages')
  .insert({
    organization_id: orgId,
    slug: 'my-links',
    title: 'My Links',
    description: 'All my important links',
    logo_url: 'https://...',
  })
  .select()
  .single();
```

### Add Link to Landing Page

```typescript
const { data, error } = await supabase
  .from('landing_page_links')
  .insert({
    landing_page_id: landingPageId,
    title: 'Instagram',
    url: 'https://instagram.com/...',
    icon_url: '/icons/instagram.svg',
    order: 1,
  })
  .select()
  .single();
```

### Track Analytics Event

```typescript
const { error } = await supabase
  .from('landing_page_analytics')
  .insert({
    landing_page_id: landingPageId,
    event_type: 'page_view', // or 'link_click', 'video_play'
    event_data: { linkId: clickedLinkId },
    user_agent: navigator.userAgent,
    referrer: document.referrer,
  });
```

## Purchases API

### Record Purchase

```typescript
const { data, error } = await supabase
  .from('course_purchases')
  .insert({
    user_id: userId,
    course_id: courseId,
    amount: 99.99,
    currency: 'USD',
    payment_method: 'stripe',
    transaction_id: stripeSessionId,
    status: 'completed',
  })
  .select()
  .single();
```

### Get User's Purchases

```typescript
const { data, error } = await supabase
  .from('course_purchases')
  .select(`
    *,
    course:courses (
      id,
      title
    )
  `)
  .eq('user_id', userId)
  .order('purchased_at', { ascending: false });
```

## Edge Functions

### Create Checkout Session

**Endpoint:** `POST /functions/v1/create-checkout`

**Request:**
```json
{
  "courseId": "uuid",
  "priceId": "price_...",
  "userId": "uuid",
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "url": "https://checkout.stripe.com/..."
}
```

### Stripe Webhook

**Endpoint:** `POST /functions/v1/stripe-webhook`

**Headers:**
```
stripe-signature: t=...,v1=...
```

**Events Handled:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Create Portal Session

**Endpoint:** `POST /functions/v1/create-portal-session`

**Request:**
```json
{
  "returnUrl": "https://..."
}
```

**Response:**
```json
{
  "url": "https://billing.stripe.com/..."
}
```

## Real-time Subscriptions

### Subscribe to Course Updates

```typescript
const subscription = supabase
  .channel('course-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'courses',
      filter: `id=eq.${courseId}`,
    },
    (payload) => {
      console.log('Course updated:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Subscribe to New Enrollments (Admin)

```typescript
const subscription = supabase
  .channel('enrollments')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'course_enrollments',
    },
    (payload) => {
      console.log('New enrollment:', payload.new);
    }
  )
  .subscribe();
```

## Error Handling

### Error Response Format

```json
{
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details",
  "hint": "Suggestion to fix"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `PGRST116` | Row not found (single query returned no results) |
| `23505` | Unique constraint violation |
| `42501` | Permission denied (RLS policy) |
| `22P02` | Invalid input syntax |

### Error Handling Example

```typescript
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('id', courseId)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    // Course not found
    return notFound();
  }
  if (error.code === '42501') {
    // Permission denied
    return forbidden();
  }
  // Generic error
  console.error('API Error:', error);
  throw new Error('Failed to fetch course');
}
```

## Rate Limiting

Supabase applies default rate limits:

| Plan | Requests/second |
|------|-----------------|
| Free | 500 |
| Pro | 1000 |
| Enterprise | Custom |

### Handling Rate Limits

```typescript
try {
  const { data, error } = await supabase.from('courses').select('*');
  // ...
} catch (error) {
  if (error.status === 429) {
    // Rate limited - implement exponential backoff
    await delay(1000);
    // Retry
  }
}
```

## Pagination

### Offset-based Pagination

```typescript
const page = 1;
const pageSize = 10;

const { data, error, count } = await supabase
  .from('courses')
  .select('*', { count: 'exact' })
  .range((page - 1) * pageSize, page * pageSize - 1);

const totalPages = Math.ceil(count / pageSize);
```

### Cursor-based Pagination

```typescript
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .order('created_at', { ascending: false })
  .lt('created_at', lastCursor)
  .limit(10);

const nextCursor = data[data.length - 1]?.created_at;
```

## Filtering & Sorting

### Filter Operators

```typescript
// Equals
.eq('status', 'published')

// Not equals
.neq('status', 'draft')

// Greater than
.gt('price', 50)

// Greater than or equal
.gte('price', 50)

// Less than
.lt('price', 100)

// Less than or equal
.lte('price', 100)

// Pattern matching (LIKE)
.like('title', '%automation%')

// Case-insensitive pattern matching
.ilike('title', '%AI%')

// In array
.in('category', ['ai', 'automation'])

// Contains (array column)
.contains('tags', ['beginner'])

// Full-text search
.textSearch('title', 'ai automation')
```

### Sorting

```typescript
// Single column
.order('created_at', { ascending: false })

// Multiple columns
.order('price', { ascending: true })
.order('created_at', { ascending: false })
```

---

## API Versioning

The current API version is **v1**. All endpoints are prefixed with `/rest/v1/`.

## Support

For API support:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review error logs in Supabase Dashboard
- Contact the development team

