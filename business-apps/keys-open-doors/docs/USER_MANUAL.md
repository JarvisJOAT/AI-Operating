# Keys Open Doors User Manual

A comprehensive guide for using the Keys Open Doors real estate automation platform.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [Scraping Management](#scraping-management)
5. [Deal Management](#deal-management)
6. [Instagram Posting](#instagram-posting)
7. [Analytics](#analytics)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Keys Open Doors automates the process of finding and promoting wholesale real estate deals:

1. **Scrapes** property listings from InvestorLift
2. **Generates** AI-powered Instagram captions
3. **Posts** deals to your Instagram Business account
4. **Tracks** engagement and performance

### Key Features

- ✅ Automated twice-weekly scraping
- ✅ AI-generated Instagram captions
- ✅ Manual approval workflow
- ✅ Face detection filtering
- ✅ Engagement analytics
- ✅ Integration with AI-Operating dashboard

---

## Getting Started

### Prerequisites

Before using Keys Open Doors, ensure you have:

1. **InvestorLift Account** - Active wholesale buyer account
2. **Instagram Business Account** - Connected to Facebook Business
3. **AI-Operating Account** - With your organization set up

### Initial Setup

1. **Configure Credentials**
   - Set up InvestorLift login
   - Connect Instagram Business account
   - Add OpenAI API key for captions

2. **Set Location Filters**
   - Specify target cities/markets
   - Set price range filters

3. **Configure Posting Settings**
   - Choose posting method (Graph API recommended)
   - Set delay between posts
   - Enable/disable face filtering

---

## Dashboard

### Accessing the Dashboard

Navigate to the Keys Open Doors dashboard from:
- AI-Operating Platform → Business Apps → Keys Open Doors
- Direct URL: `https://your-domain/keys-open-doors`

### Dashboard Overview

```
┌────────────────────────────────────────────────────────┐
│                Keys Open Doors Dashboard                │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  New Deals  │  │   Posted    │  │  Engagement │    │
│  │     24      │  │     156     │  │   +12.5%    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Recent Scraping Jobs                 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │  • Mon Jan 15 03:00 - Completed (24 deals)       │  │
│  │  • Thu Jan 11 03:00 - Completed (18 deals)       │  │
│  │  • Mon Jan 08 03:00 - Completed (21 deals)       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Quick Stats

| Metric | Description |
|--------|-------------|
| **New Deals** | Unreviewed deals from recent scrapes |
| **Posted** | Total deals posted to Instagram |
| **Engagement** | Average engagement rate trend |

---

## Scraping Management

### Automatic Scraping

By default, scraping runs automatically:
- **Monday** at 3:00 AM (local time)
- **Thursday** at 3:00 AM (local time)

### Manual Scraping

To start a manual scrape:

1. Go to **Dashboard** → **Scraping**
2. Click **"Start New Scrape"**
3. Monitor progress in the job list

```
┌──────────────────────────────────────────────────┐
│              Start Manual Scrape                  │
├──────────────────────────────────────────────────┤
│                                                   │
│  Location Filters:                                │
│  ☑ Houston, TX                                   │
│  ☑ Dallas, TX                                    │
│  ☑ Austin, TX                                    │
│  ☑ San Antonio, TX                               │
│                                                   │
│  Price Range:                                     │
│  Min: $50,000    Max: $500,000                   │
│                                                   │
│  [        Start Scraping        ]                │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Viewing Scraping History

The **Scraping Jobs** table shows:
- Job start/end time
- Status (pending, in progress, completed, failed)
- Number of deals found
- Error messages (if any)

### Scraping Status Indicators

| Status | Icon | Description |
|--------|------|-------------|
| Pending | ⏳ | Queued for execution |
| In Progress | 🔄 | Currently running |
| Completed | ✅ | Successfully finished |
| Failed | ❌ | Error occurred |

---

## Deal Management

### Viewing Deals

Access deals at **Dashboard** → **Deals**

```
┌────────────────────────────────────────────────────────┐
│                    Deal Management                      │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Filters: [All ▼] [New ▼] [Approved ▼] [Posted ▼]     │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ [IMAGE]  3BR/2BA Single Family - Houston        │    │
│  │          $125,000 | Scraped: Jan 15, 2024       │    │
│  │          Status: NEW                            │    │
│  │          [ Approve ] [ Reject ] [ Preview ]     │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │ [IMAGE]  4BR/3BA Investment Property - Dallas   │    │
│  │          $189,000 | Scraped: Jan 15, 2024       │    │
│  │          Status: APPROVED                       │    │
│  │          [ Post Now ] [ Edit Caption ] [ View ] │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Deal Status Workflow

```
┌─────────┐     ┌─────────────┐     ┌──────────┐     ┌────────┐
│   NEW   │────▶│   REVIEW    │────▶│ APPROVED │────▶│ POSTED │
└─────────┘     └─────────────┘     └──────────┘     └────────┘
                      │
                      ▼
                ┌──────────┐
                │ REJECTED │
                └──────────┘
```

### Status Definitions

| Status | Description | Next Actions |
|--------|-------------|--------------|
| **New** | Just scraped | Approve or Reject |
| **Pending Review** | Marked for review | Approve or Reject |
| **Approved** | Ready to post | Post Now or Schedule |
| **Rejected** | Won't be posted | Can re-approve |
| **Posted** | Published to Instagram | View Analytics |
| **Post Failed** | Posting error | Retry or Reject |

### Approving Deals

1. Click **"Approve"** on a deal card
2. Optionally edit the generated caption
3. Deal moves to "Approved" status

### Rejecting Deals

1. Click **"Reject"** on a deal card
2. Optionally add rejection reason
3. Deal won't be posted

### Bulk Actions

Select multiple deals and:
- Approve All Selected
- Reject All Selected
- Export to CSV

---

## Instagram Posting

### Automatic Posting

If enabled, approved deals post automatically:
- After each scraping job
- Respects delay settings
- Limited by `max_posts_per_run`

### Manual Posting

To post a specific deal:

1. Go to **Deals** → Find an **Approved** deal
2. Click **"Post Now"**
3. Confirm the caption and image
4. Click **"Publish"**

### Caption Preview

```
┌────────────────────────────────────────────────────────┐
│                  Instagram Post Preview                 │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────┐                │
│  │                                    │                │
│  │          [DEAL IMAGE]              │                │
│  │                                    │                │
│  └────────────────────────────────────┘                │
│                                                         │
│  Caption:                                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🏠 NEW WHOLESALE DEAL ALERT! 🚨                   │  │
│  │                                                    │  │
│  │ 📍 Houston, TX                                     │  │
│  │ 💰 $125,000                                        │  │
│  │ 🛏️ 3 BR | 🛁 2 BA                                  │  │
│  │                                                    │  │
│  │ This single family home is perfect for...         │  │
│  │                                                    │  │
│  │ 🔗 Link in bio for details!                       │  │
│  │                                                    │  │
│  │ #wholesalerealestate #investmentproperty          │  │
│  │ #houstonrealestate #realestateinvestor            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  [ Edit Caption ]        [ Cancel ] [ Post ]           │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Editing Captions

1. Click **"Edit Caption"** before posting
2. Modify the AI-generated text
3. Add or remove hashtags
4. Save changes

### Posting Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Use AI Captions | On | Generate captions with GPT-4 |
| Post Type | Post | Post or Story |
| Delay Between Posts | 60s | Rate limit protection |
| Auto-Post All Deals | Off | Post after scraping |
| Max Posts Per Run | 10 | Safety limit |
| Filter Faces | On | Skip images with faces |

---

## Analytics

### Viewing Analytics

Access analytics at **Dashboard** → **Analytics**

### Metrics Tracked

| Metric | Description |
|--------|-------------|
| **Likes** | Number of likes on post |
| **Comments** | Number of comments |
| **Reach** | Unique accounts reached |
| **Impressions** | Total times viewed |
| **Engagement Rate** | (Likes + Comments) / Reach |

### Analytics Dashboard

```
┌────────────────────────────────────────────────────────┐
│                    Post Analytics                       │
├────────────────────────────────────────────────────────┤
│                                                         │
│  Time Period: [Last 7 Days ▼]                          │
│                                                         │
│  Total Reach: 45,230                                    │
│  Total Impressions: 78,450                              │
│  Avg Engagement: 4.2%                                   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │     [ENGAGEMENT CHART OVER TIME]                  │  │
│  │                                                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  Top Performing Posts:                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 1. Houston 3BR - 324 likes, 45 comments          │  │
│  │ 2. Dallas 4BR - 287 likes, 38 comments           │  │
│  │ 3. Austin Duplex - 256 likes, 32 comments        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Best Practices

Based on analytics insights:

1. **Optimal Posting Times** - Review when posts perform best
2. **Caption Length** - Shorter vs longer captions
3. **Hashtag Performance** - Which hashtags drive engagement
4. **Image Quality** - Impact of image quality on reach

---

## Configuration

### Accessing Settings

Go to **Dashboard** → **Settings**

### Location Filters

```
┌──────────────────────────────────────────────────┐
│              Location Configuration               │
├──────────────────────────────────────────────────┤
│                                                   │
│  Target Markets:                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ Houston, TX                          [✕]   │  │
│  │ Dallas, TX                           [✕]   │  │
│  │ Austin, TX                           [✕]   │  │
│  │ San Antonio, TX                      [✕]   │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
│  [ + Add City ]                                  │
│                                                   │
│  Price Range:                                     │
│  Min: [$50,000    ]  Max: [$500,000    ]        │
│                                                   │
│  [          Save Changes          ]              │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Instagram Settings

```
┌──────────────────────────────────────────────────┐
│            Instagram Configuration                │
├──────────────────────────────────────────────────┤
│                                                   │
│  Posting Method:                                  │
│  ○ Instagram Graph API (Recommended)              │
│  ○ Instagrapi (Personal Account)                  │
│                                                   │
│  Caption Settings:                                │
│  ☑ Use AI-Generated Captions                     │
│  ☑ Include Hashtags                              │
│  ☑ Include Call-to-Action                        │
│                                                   │
│  Safety Settings:                                 │
│  ☑ Filter Images with Faces                      │
│  Max Posts per Day: [10    ]                     │
│  Delay Between Posts: [60   ] seconds            │
│                                                   │
│  [          Save Changes          ]              │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Schedule Settings

```
┌──────────────────────────────────────────────────┐
│             Schedule Configuration                │
├──────────────────────────────────────────────────┤
│                                                   │
│  Scraping Schedule:                               │
│  ☑ Monday    Time: [03:00 ▼]                    │
│  ☐ Tuesday   Time: [03:00 ▼]                    │
│  ☐ Wednesday Time: [03:00 ▼]                    │
│  ☑ Thursday  Time: [03:00 ▼]                    │
│  ☐ Friday    Time: [03:00 ▼]                    │
│  ☐ Saturday  Time: [03:00 ▼]                    │
│  ☐ Sunday    Time: [03:00 ▼]                    │
│                                                   │
│  Auto-Posting:                                    │
│  ☐ Automatically post after scraping             │
│                                                   │
│  [          Save Changes          ]              │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Common Issues

#### Scraping Failed

**Symptoms:** Job shows "Failed" status

**Solutions:**
1. Check InvestorLift credentials
2. Verify account is active
3. Check for CAPTCHA challenges
4. Try manual login to InvestorLift first

#### Posts Not Publishing

**Symptoms:** Posts stuck in "Pending" or "Failed"

**Solutions:**
1. Verify Instagram connection
2. Check access token validity
3. Review rate limiting settings
4. Check for Instagram API errors in logs

#### No Deals Found

**Symptoms:** Scraping completes with 0 deals

**Solutions:**
1. Expand location filters
2. Adjust price range
3. Verify InvestorLift has listings
4. Check filter configuration

#### Caption Generation Failed

**Symptoms:** Posts have template captions instead of AI

**Solutions:**
1. Verify OpenAI API key
2. Check API usage limits
3. Review OpenAI account billing

### Getting Help

1. **Check Logs** - View system logs in the dashboard
2. **API Documentation** - See [API Reference](./API_REFERENCE.md)
3. **Contact Support** - Reach out to the development team

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `LOGIN_FAILED` | InvestorLift login error | Check credentials |
| `RATE_LIMITED` | Too many requests | Wait and retry |
| `POSTING_FAILED` | Instagram error | Check connection |
| `CAPTION_ERROR` | OpenAI API error | Check API key |

---

## Best Practices

### Optimal Workflow

1. **Review Daily** - Check new deals each day
2. **Curate Quality** - Reject low-quality listings
3. **Monitor Analytics** - Track what performs best
4. **Adjust Filters** - Refine based on results

### Content Tips

1. **Quality Images** - Better images get more engagement
2. **Relevant Hashtags** - Use local and niche tags
3. **Consistent Posting** - Regular schedule builds following
4. **Engage Comments** - Respond to comments promptly

### Safety Tips

1. **Rate Limits** - Don't exceed Instagram limits
2. **Authentic Content** - Avoid spam-like behavior
3. **Regular Audits** - Review posted content regularly
4. **Backup Credentials** - Keep credentials secure

---

For technical setup, see [Setup Guide](./SETUP_GUIDE.md).
For API details, see [API Reference](./API_REFERENCE.md).

