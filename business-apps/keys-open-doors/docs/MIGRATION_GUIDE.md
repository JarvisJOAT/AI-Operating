# Keys Open Doors Migration Guide

Guide for migrating from the original InvestorLift scraper to the new Keys Open Doors platform.

## Overview

This guide covers migrating from:
- **Source**: `MISC-OTHER-ALLBUCKET/InvestorLife-scrapper/`
- **Target**: `AI-Operating/business-apps/keys-open-doors/`

## What's Changing

### Architecture Comparison

| Aspect | Old Scraper | New Platform |
|--------|-------------|--------------|
| Language | Python | TypeScript/Node.js |
| Storage | Local JSON/Files | Supabase PostgreSQL |
| Scheduling | Manual/Cron | Built-in node-cron |
| API | None | REST API |
| Dashboard | None | Integrated UI |
| Multi-tenant | No | Yes |

### Key Improvements

1. **Database Storage** - Deals stored in PostgreSQL, not JSON files
2. **API Access** - Programmatic access to all functions
3. **Dashboard** - Visual management interface
4. **Integration** - Connects to AI-Operating platform
5. **Multi-tenant** - Support multiple organizations

## Migration Steps

### Step 1: Export Existing Data

First, export any data you want to preserve from the old scraper.

```python
# Old scraper - export deals to JSON
import json
from pathlib import Path

# Load existing deals
deals_file = Path("output/deals.json")
if deals_file.exists():
    with open(deals_file) as f:
        deals = json.load(f)
    
    # Export for migration
    with open("migration_export.json", "w") as f:
        json.dump(deals, f, indent=2)
    
    print(f"Exported {len(deals)} deals")
```

### Step 2: Set Up New Environment

1. **Navigate to new project**
   ```bash
   cd AI-Operating/business-apps/keys-open-doors
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

### Step 3: Convert Configuration

Convert your old `config.yaml` to environment variables.

#### Old Configuration (config.yaml)

```yaml
investorlift:
  email: "your@email.com"
  password: "your-password"

location_filter:
  cities:
    - "Houston"
    - "Dallas"
  
  price_range:
    min: 50000
    max: 500000

instagram:
  method: "graph_api"
  use_ai_captions: true
  graph_api:
    access_token: "your-token"
    page_id: "your-page-id"
```

#### New Configuration (.env)

```env
# InvestorLift
INVESTORLIFT_EMAIL=your@email.com
INVESTORLIFT_PASSWORD=your-password
INVESTORLIFT_CITIES=Houston,Dallas
INVESTORLIFT_MIN_PRICE=50000
INVESTORLIFT_MAX_PRICE=500000

# Instagram
INSTAGRAM_METHOD=graph_api
INSTAGRAM_USE_AI_CAPTIONS=true
INSTAGRAM_GRAPH_ACCESS_TOKEN=your-token
INSTAGRAM_GRAPH_PAGE_ID=your-page-id
```

### Configuration Mapping Table

| Old (config.yaml) | New (.env) |
|-------------------|------------|
| `investorlift.email` | `INVESTORLIFT_EMAIL` |
| `investorlift.password` | `INVESTORLIFT_PASSWORD` |
| `location_filter.cities` | `INVESTORLIFT_CITIES` (comma-separated) |
| `location_filter.price_range.min` | `INVESTORLIFT_MIN_PRICE` |
| `location_filter.price_range.max` | `INVESTORLIFT_MAX_PRICE` |
| `instagram.method` | `INSTAGRAM_METHOD` |
| `instagram.username` | `INSTAGRAM_USERNAME` |
| `instagram.password` | `INSTAGRAM_PASSWORD` |
| `instagram.graph_api.access_token` | `INSTAGRAM_GRAPH_ACCESS_TOKEN` |
| `instagram.graph_api.page_id` | `INSTAGRAM_GRAPH_PAGE_ID` |
| `instagram.use_ai_captions` | `INSTAGRAM_USE_AI_CAPTIONS` |
| `ai.openai_api_key` | `OPENAI_API_KEY` |
| `output.images_folder` | Not needed (temp storage) |
| `output.captions_folder` | Not needed (database) |

### Step 4: Import Historical Data

Create a migration script to import old deals:

```typescript
// scripts/migrate-deals.ts
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OldDeal {
  url: string;
  title: string;
  price: string;
  address: string;
  images: string[];
  scraped_at: string;
}

async function migrateDeal() {
  // Read exported deals
  const data = fs.readFileSync('migration_export.json', 'utf-8');
  const oldDeals: OldDeal[] = JSON.parse(data);

  console.log(`Migrating ${oldDeals.length} deals...`);

  for (const oldDeal of oldDeals) {
    // Transform to new format
    const newDeal = {
      organization_id: process.env.ORGANIZATION_ID,
      title: oldDeal.title,
      price: oldDeal.price,
      location: oldDeal.address,
      image_url: oldDeal.images[0] || null,
      deal_url: oldDeal.url,
      scraped_at: oldDeal.scraped_at || new Date().toISOString(),
      status: 'new',
      metadata: {
        migrated: true,
        original_images: oldDeal.images,
      },
    };

    // Insert into new database
    const { error } = await supabase
      .from('scraped_deals')
      .insert(newDeal);

    if (error) {
      console.error(`Failed to migrate: ${oldDeal.title}`, error);
    } else {
      console.log(`Migrated: ${oldDeal.title}`);
    }
  }

  console.log('Migration complete!');
}

migrateDeal();
```

Run the migration:

```bash
npx ts-node scripts/migrate-deals.ts
```

### Step 5: Migrate Posted History

If you have a record of posted deals:

```typescript
// scripts/migrate-posts.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PostRecord {
  deal_url: string;
  caption: string;
  posted_at: string;
  instagram_id?: string;
}

async function migratePosts(postRecords: PostRecord[]) {
  for (const post of postRecords) {
    // Find corresponding deal
    const { data: deal } = await supabase
      .from('scraped_deals')
      .select('id')
      .eq('deal_url', post.deal_url)
      .single();

    if (!deal) {
      console.log(`Deal not found for: ${post.deal_url}`);
      continue;
    }

    // Create post record
    const { error } = await supabase
      .from('instagram_posts')
      .insert({
        organization_id: process.env.ORGANIZATION_ID,
        deal_id: deal.id,
        caption: post.caption,
        image_url: '', // Historical - no image stored
        instagram_post_id: post.instagram_id,
        posted_at: post.posted_at,
        status: 'posted',
      });

    if (error) {
      console.error(`Failed to migrate post`, error);
    }

    // Update deal status
    await supabase
      .from('scraped_deals')
      .update({ status: 'posted' })
      .eq('id', deal.id);
  }
}
```

### Step 6: Verify Migration

Run verification checks:

```bash
# Start the new server
npm run dev

# Test API endpoints
curl http://localhost:3001/api/deals
curl http://localhost:3001/api/posts

# Verify counts
curl http://localhost:3001/api/deals | jq 'length'
```

### Step 7: Update Cron Jobs

If you had external cron jobs running the old scraper:

**Remove old cron:**
```bash
crontab -e
# Remove lines like:
# 0 3 * * 1,4 cd /path/to/InvestorLife-scrapper && python scraper.py
```

**New scheduling is automatic:**
The new platform handles scheduling internally. Just start the server:

```bash
npm start
```

### Step 8: Retire Old Scraper

Once migration is verified:

1. **Stop old scraper** if running
2. **Archive old directory** for reference
3. **Update documentation** to point to new system

```bash
# Archive old scraper
tar -czvf investorlife-scrapper-backup.tar.gz \
  /path/to/MISC-OTHER-ALLBUCKET/InvestorLife-scrapper/
```

## Data Migration Details

### Deal Field Mapping

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `url` | `deal_url` | Direct mapping |
| `title` | `title` | Direct mapping |
| `price` | `price` | Keep as string |
| `address` | `location` | Renamed |
| `images[0]` | `image_url` | First image only |
| `images` | `metadata.original_images` | All images |
| `scraped_at` | `scraped_at` | ISO format |
| N/A | `status` | Default: 'new' |
| N/A | `organization_id` | Required for multi-tenant |

### Status Migration

Map posting status from old system:

```typescript
function migrateStatus(oldDeal: any): string {
  // If deal was posted to Instagram
  if (oldDeal.posted_to_instagram) {
    return 'posted';
  }
  // If deal was rejected
  if (oldDeal.rejected) {
    return 'rejected';
  }
  // Default
  return 'new';
}
```

## Troubleshooting Migration

### Common Issues

#### "Organization ID not found"

Ensure `ORGANIZATION_ID` is set in `.env` and matches your AI-Operating organization.

#### "Duplicate deal URLs"

The new system enforces uniqueness on deal URLs per organization:

```sql
-- Check for duplicates before migration
SELECT deal_url, COUNT(*) 
FROM scraped_deals 
GROUP BY deal_url 
HAVING COUNT(*) > 1;
```

#### "Missing required fields"

Ensure all required fields are mapped:
- `organization_id` (required)
- `title` (required)
- `deal_url` (required)

### Rollback Plan

If migration fails:

1. **Keep old system** running as backup
2. **Don't delete** original data
3. **Clear new database** if needed:

```sql
-- CAUTION: This deletes all migrated data
DELETE FROM scraped_deals WHERE metadata->>'migrated' = 'true';
```

## Post-Migration

### Verification Checklist

- [ ] All deals imported
- [ ] Status values correct
- [ ] Posted history preserved
- [ ] New scraping works
- [ ] Instagram posting works
- [ ] Analytics collecting
- [ ] Dashboard accessible

### Monitoring

Watch for issues in the first week:
- Check logs daily
- Verify scheduled scrapes run
- Monitor Instagram posting success rate
- Review analytics data

### Support

If you encounter issues:

1. Check [Troubleshooting](./USER_MANUAL.md#troubleshooting) guide
2. Review server logs
3. Contact development team

---

## Quick Reference

### File Locations

| Old | New |
|-----|-----|
| `InvestorLife-scrapper/` | `business-apps/keys-open-doors/` |
| `config.yaml` | `.env` |
| `output/deals.json` | Supabase `scraped_deals` table |
| `output/images/` | Temporary storage (auto-cleaned) |
| `scraper.py` | `src/services/scraper.ts` |
| `instagram_poster.py` | `src/services/poster.ts` |

### Commands

| Old | New |
|-----|-----|
| `python scraper.py` | `curl -X POST localhost:3001/api/scraping/start` |
| `python instagram_poster.py` | `curl -X POST localhost:3001/api/posts/trigger/:id` |
| Manual cron | Automatic (built-in scheduler) |

