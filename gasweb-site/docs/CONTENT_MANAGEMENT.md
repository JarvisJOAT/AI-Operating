# Gasweb.info Content Management Guide

This guide covers how to manage courses, educational content, services, and other content on Gasweb.info.

## Table of Contents

1. [Course Management](#course-management)
2. [Content Types](#content-types)
3. [Pricing Configuration](#pricing-configuration)
4. [Service Pages](#service-pages)
5. [Landing Page Management](#landing-page-management)
6. [SEO Optimization](#seo-optimization)
7. [Media Management](#media-management)

## Course Management

### Creating a New Course

#### Via Admin Panel

1. Navigate to `/admin/courses`
2. Click "Create New Course"
3. Fill in course details:
   - **Title**: Clear, descriptive course name
   - **Description**: Compelling course overview (supports Markdown)
   - **Category**: Select from predefined categories
   - **Thumbnail**: Upload course image (1280x720 recommended)
   - **Pricing Model**: Free, One-time, or Subscription
   - **Price**: If applicable

#### Via Supabase Dashboard

```sql
INSERT INTO courses (
  organization_id,
  title,
  description,
  thumbnail_url,
  price,
  pricing_model,
  is_published
) VALUES (
  'your-org-id',
  'Introduction to AI Automation',
  'Learn the fundamentals of AI automation for small businesses...',
  'https://storage.example.com/courses/ai-intro-thumb.jpg',
  49.99,
  'one_time',
  false  -- Keep unpublished until content is added
);
```

### Adding Course Content

Course content supports multiple formats:

#### Video Content

```sql
INSERT INTO course_content (
  course_id,
  title,
  content_type,
  content_url,
  order_index,
  is_preview
) VALUES (
  'course-uuid',
  'Module 1: Introduction to AI',
  'video',
  'https://vimeo.com/123456789',  -- Or YouTube, uploaded video URL
  1,
  true  -- Available as preview
);
```

#### Text/Article Content

```sql
INSERT INTO course_content (
  course_id,
  title,
  content_type,
  text_content,
  order_index,
  is_preview
) VALUES (
  'course-uuid',
  'Setting Up Your Environment',
  'text',
  '# Getting Started\n\nIn this module, you will learn...',
  2,
  false
);
```

#### PDF/Document Content

```sql
INSERT INTO course_content (
  course_id,
  title,
  content_type,
  content_url,
  order_index,
  is_preview
) VALUES (
  'course-uuid',
  'AI Automation Workbook',
  'pdf',
  'https://storage.example.com/courses/workbook.pdf',
  3,
  false
);
```

### Publishing a Course

1. Ensure all content is added and ordered correctly
2. Review course preview
3. Set `is_published = true`:

```sql
UPDATE courses 
SET is_published = true, updated_at = NOW() 
WHERE id = 'course-uuid';
```

Or via Admin Panel: Toggle the "Published" switch on the course edit page.

## Content Types

### Supported Content Types

| Type | Description | File Format | Max Size |
|------|-------------|-------------|----------|
| `video` | Video lessons | MP4, WebM, or embed URL | 2GB |
| `text` | Text/Markdown content | Markdown | Unlimited |
| `pdf` | Downloadable documents | PDF | 50MB |
| `quiz` | Interactive quizzes | JSON definition | N/A |

### Video Hosting Options

#### Option 1: Self-Hosted (Supabase Storage)

```typescript
// Upload video to Supabase Storage
const { data, error } = await supabase.storage
  .from('course-content')
  .upload(`courses/${courseId}/videos/${fileName}`, file, {
    contentType: 'video/mp4',
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('course-content')
  .getPublicUrl(`courses/${courseId}/videos/${fileName}`);
```

#### Option 2: YouTube/Vimeo Embed

```typescript
// Store embed URL directly
const embedUrl = 'https://www.youtube.com/embed/VIDEO_ID';
// Or: 'https://player.vimeo.com/video/VIDEO_ID'
```

### Quiz Content Structure

```json
{
  "title": "Module 1 Quiz",
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "What is AI automation?",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" }
      ],
      "correctAnswer": "b",
      "explanation": "AI automation is..."
    },
    {
      "id": "q2",
      "type": "true_false",
      "question": "AI can replace all human tasks.",
      "correctAnswer": false
    }
  ]
}
```

## Pricing Configuration

### Pricing Models

#### Free Course

```sql
INSERT INTO courses (title, pricing_model, price, is_published)
VALUES ('Free Intro Course', 'free', NULL, true);
```

#### One-Time Purchase

```sql
INSERT INTO courses (title, pricing_model, price, is_published)
VALUES ('AI Fundamentals', 'one_time', 99.99, true);
```

#### Subscription

```sql
INSERT INTO courses (title, pricing_model, price, is_published)
VALUES ('AI Pro Masterclass', 'subscription', 19.99, true);
-- Note: price represents monthly subscription amount
```

### Setting Up Stripe Products

1. **Create Product in Stripe Dashboard**
   - Go to Products → Add Product
   - Set name, description, and images

2. **Create Prices**
   - One-time: Set as single payment
   - Subscription: Set as recurring (monthly/yearly)

3. **Link to Course**
   ```sql
   UPDATE courses 
   SET metadata = jsonb_set(
     COALESCE(metadata, '{}'::jsonb),
     '{stripe_price_id}',
     '"price_1ABC123"'
   )
   WHERE id = 'course-uuid';
   ```

### Discount/Promotion Codes

```sql
-- Create promotion in Stripe first, then store reference
INSERT INTO promotions (
  code,
  stripe_coupon_id,
  discount_percent,
  valid_from,
  valid_until,
  max_uses
) VALUES (
  'LAUNCH50',
  'coupon_123',
  50,
  '2024-01-01',
  '2024-12-31',
  100
);
```

## Service Pages

### Updating Service Information

Services are managed through the Services page component and can be customized:

```typescript
// src/data/services.ts
export const services: Service[] = [
  {
    id: 'email-automation',
    title: 'Email Automation',
    description: 'Automate your email marketing with AI-powered campaigns...',
    icon: 'mail',
    features: [
      'AI-powered subject line generation',
      'Automated A/B testing',
      'Smart segmentation',
      'Performance analytics',
    ],
    pricing: {
      starter: 99,
      professional: 299,
      enterprise: 'Contact us',
    },
    cta: 'Get Started',
    link: '/contact?service=email-automation',
  },
  // Add more services...
];
```

### Adding a New Service

1. Add service data to `src/data/services.ts`
2. Create service detail page if needed
3. Add to navigation
4. Update sitemap

## Landing Page Management

### Creating a New Landing Page

Via Admin Panel (`/admin/landing-page`):

1. Click "Create New Landing Page"
2. Fill in details:
   - **Title**: Page heading
   - **Slug**: URL path (e.g., `my-links` → `/l/my-links`)
   - **Description**: Brief description
   - **Logo URL**: Profile/logo image

### Adding Links

```sql
INSERT INTO landing_page_links (
  landing_page_id,
  title,
  url,
  icon_url,
  "order"
) VALUES 
  ('lp-uuid', 'Instagram', 'https://instagram.com/gasweb', '/icons/instagram.svg', 1),
  ('lp-uuid', 'YouTube', 'https://youtube.com/@gasweb', '/icons/youtube.svg', 2),
  ('lp-uuid', 'Website', 'https://gasweb.info', '/icons/globe.svg', 3);
```

### Adding Videos

```sql
INSERT INTO landing_page_videos (
  landing_page_id,
  title,
  youtube_url,
  "order"
) VALUES 
  ('lp-uuid', 'Welcome to Gasweb', 'https://www.youtube.com/embed/VIDEO_ID', 1),
  ('lp-uuid', 'Latest Tutorial', 'https://www.youtube.com/embed/VIDEO_ID2', 2);
```

### Theme Customization

```sql
UPDATE landing_pages
SET theme = '{
  "backgroundColor": "#1a1a2e",
  "textColor": "#ffffff",
  "accentColor": "#4f46e5",
  "buttonStyle": "rounded",
  "fontFamily": "Inter"
}'::jsonb
WHERE id = 'lp-uuid';
```

## SEO Optimization

### Page-Level SEO

Each page should include proper meta tags:

```tsx
// components/SEO.tsx
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => (
  <Helmet>
    <title>{title} | Gasweb.info</title>
    <meta name="description" content={description} />
    
    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {image && <meta property="og:image" content={image} />}
    {url && <meta property="og:url" content={url} />}
    
    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image && <meta name="twitter:image" content={image} />}
  </Helmet>
);
```

### Course SEO

```typescript
// On course page
<SEO
  title={course.title}
  description={course.description.substring(0, 160)}
  image={course.thumbnail_url}
  url={`https://gasweb.info/education/${course.id}`}
/>
```

### Structured Data

Add JSON-LD for courses:

```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": course.title,
  "description": course.description,
  "provider": {
    "@type": "Organization",
    "name": "Gasweb.info",
    "sameAs": "https://gasweb.info"
  },
  "offers": {
    "@type": "Offer",
    "price": course.price,
    "priceCurrency": "USD"
  }
})}
</script>
```

### Sitemap Generation

Create `public/sitemap.xml` or generate dynamically:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gasweb.info/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gasweb.info/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://gasweb.info/education</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Add course URLs dynamically -->
</urlset>
```

## Media Management

### Image Guidelines

| Usage | Dimensions | Format | Max Size |
|-------|------------|--------|----------|
| Course thumbnail | 1280x720 | WebP, JPEG | 500KB |
| Landing page logo | 400x400 | PNG, SVG | 100KB |
| Service icons | 64x64 | SVG | 10KB |
| Blog post images | 1200x630 | WebP, JPEG | 300KB |

### Uploading to Supabase Storage

```typescript
// lib/storage.ts
export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = `${path}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('public-assets')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year cache
    });
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('public-assets')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
```

### Image Optimization

Before uploading, optimize images:

1. **Compress**: Use tools like TinyPNG or Squoosh
2. **Resize**: Scale to appropriate dimensions
3. **Format**: Convert to WebP for web use
4. **Alt Text**: Always provide descriptive alt text

```tsx
<img
  src={imageUrl}
  alt="AI automation workflow diagram showing email triggers"
  loading="lazy"
  width={1280}
  height={720}
/>
```

---

## Quick Reference

### Content Management URLs

- Courses Admin: `/admin/courses`
- Landing Pages Admin: `/admin/landing-page`
- Media Library: `/admin/media`

### Database Tables

- `courses` - Course definitions
- `course_content` - Course lessons/modules
- `course_enrollments` - User enrollments
- `course_purchases` - Payment records
- `landing_pages` - Custom link pages
- `landing_page_links` - Links on landing pages
- `landing_page_videos` - Videos on landing pages

### Support

For content management issues, contact the development team or refer to [DEVELOPMENT.md](./DEVELOPMENT.md).

