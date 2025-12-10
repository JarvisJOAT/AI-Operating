# App Deployment Guide

Step-by-step guide for deploying business application instances to customer organizations.

## Overview

This guide covers deploying:
- Keys Open Doors (Real Estate Automation)
- Food Truck (Mobile Ordering + Voice Agent)
- Construction Management (Project Management + Translation)

## Pre-Deployment Checklist

Before deploying any app:

- [ ] Organization created and verified
- [ ] Customer billing set up
- [ ] Owner account active
- [ ] Required API keys obtained from customer
- [ ] Service agreements signed
- [ ] Data migration plan (if applicable)

## Keys Open Doors Deployment

### Requirements from Customer

| Item | Required | Notes |
|------|----------|-------|
| InvestorLift credentials | ✅ | Email and password |
| Instagram account | ✅ | Business or Creator account |
| Facebook Page (for Graph API) | Optional | For Graph API method |
| Target cities | ✅ | List of cities to scrape |
| Price range | ✅ | Min and max price filters |

### Step 1: Create Instance

1. Go to **Apps → Deploy New**
2. Select **Keys Open Doors**
3. Choose organization
4. Click **Create Instance**

### Step 2: Configure InvestorLift

1. Enter credentials:
   ```
   Email: customer-email@example.com
   Password: ••••••••
   ```
2. Click **Test Login**
3. Verify successful connection

### Step 3: Configure Filters

1. Add target cities:
   - Type city name
   - Click Add
   - Repeat for all cities
2. Set price range:
   - Minimum: $50,000
   - Maximum: $300,000
3. Set property types (optional)

### Step 4: Configure Instagram

**Option A: Instagram Graph API (Recommended)**

1. Customer must have:
   - Facebook Business Page
   - Instagram Business Account linked
2. Generate access token via Facebook Developer portal
3. Enter credentials:
   ```
   Access Token: ••••••••
   Page ID: 123456789
   Instagram Account ID: 987654321
   ```
4. Click **Verify Connection**

**Option B: Instagrapi (Password Auth)**

1. Enter Instagram credentials:
   ```
   Username: @accountname
   Password: ••••••••
   ```
2. Handle 2FA if prompted
3. Save session data

### Step 5: Configure AI Captions

1. Enable AI captions: **Yes**
2. Select model: **GPT-4o**
3. Customize prompt (optional)
4. Test caption generation

### Step 6: Set Schedule

1. Choose scraping frequency:
   - Default: Monday and Thursday at 3 AM
   - Custom: Select specific days/times
2. Set post delay (seconds between posts)
3. Enable/disable auto-posting

### Step 7: Initial Test

1. Click **Run Test Scrape**
2. Verify:
   - Login successful
   - Deals found
   - Images downloaded
   - Captions generated
3. Post one test deal manually
4. Confirm post appears on Instagram

### Step 8: Go Live

1. Enable scheduled scraping
2. Enable auto-posting
3. Monitor first automated run
4. Confirm with customer

---

## Food Truck Deployment

### Requirements from Customer

| Item | Required | Notes |
|------|----------|-------|
| Business name | ✅ | For greetings |
| Business phone | ✅ | Fallback number |
| Menu (items, prices) | ✅ | For order-taking |
| Twilio number | ✅ | We can provision |
| Stripe account | ✅ | For payments |
| Business hours | ✅ | When orders accepted |

### Step 1: Create Instance

1. Go to **Apps → Deploy New**
2. Select **Food Truck**
3. Choose organization
4. Click **Create Instance**

### Step 2: Configure Business Info

1. Enter business details:
   ```
   Name: This What I Do BBQ
   Phone: +1 (555) 123-4567
   Address: Houston, TX
   Timezone: America/Chicago
   ```
2. Set business hours
3. Save

### Step 3: Import Menu

**Manual Entry:**
1. Go to **Menu Management**
2. Create categories:
   - Plates
   - Sandwiches
   - Sides
   - Drinks
3. Add items with:
   - Name
   - Description
   - Price
   - Options (if any)

**Import from File:**
1. Prepare CSV with columns:
   ```csv
   category,name,description,price,options
   Plates,Brisket Plate,"Sliced brisket with 2 sides",18.99,"Side 1|Side 2"
   ```
2. Click **Import Menu**
3. Upload CSV
4. Review and confirm

### Step 4: Configure Voice Agent

1. Provision Twilio number:
   - Click **Provision Number**
   - Select area code
   - Confirm purchase
2. Configure webhooks (automatic)
3. Set greeting message
4. Configure fallback number
5. Test voice agent:
   - Click **Test Call**
   - Place test order
   - Verify order appears in dashboard

### Step 5: Configure Payments

**Stripe:**
1. Customer connects Stripe:
   - Click **Connect Stripe**
   - Customer authorizes
   - Verify connection
2. Enable desired payment methods:
   - Credit/Debit cards
   - Apple Pay
   - Google Pay

**Cash:**
1. Enable cash payments: **Yes**
2. Set cash handling instructions

### Step 6: Configure Notifications

**SMS (Twilio):**
1. Verify Twilio credentials
2. Customize message templates:
   - Order confirmation
   - Order ready
   - Pickup reminder
3. Test notifications

**Email:**
1. Configure SMTP or connect SendGrid
2. Customize email templates
3. Test email delivery

### Step 7: Initial Test

1. Place test order through:
   - Web interface
   - Voice agent
2. Verify:
   - Order created correctly
   - Payment processed
   - Notifications sent
   - Order appears in dashboard

### Step 8: Go Live

1. Share phone number with customer
2. Enable web ordering (if applicable)
3. Monitor first real orders
4. Confirm with customer

---

## Construction Management Deployment

### Requirements from Customer

| Item | Required | Notes |
|------|----------|-------|
| Team members list | ✅ | Names, emails, languages |
| Initial projects | Optional | To seed data |
| Expense categories | Optional | Or use defaults |

### Step 1: Create Instance

1. Go to **Apps → Deploy New**
2. Select **Construction Management**
3. Choose organization
4. Click **Create Instance**

### Step 2: Configure Translation

1. Verify translation service:
   ```
   Primary: Google Cloud Translation
   Fallback: DeepL
   ```
2. Test translation:
   - Enter test text
   - Select target language
   - Verify accurate translation
3. Configure caching:
   - TTL: 24 hours
   - Enable/disable

### Step 3: Configure OCR

1. Verify OCR service:
   ```
   Provider: Google Vision
   ```
2. Set confidence threshold:
   - Auto-approve: 95%
   - Review required: 80%
   - Reject below: 50%
3. Test OCR:
   - Upload sample receipt
   - Verify data extraction
   - Check structured output

### Step 4: Configure Storage

1. Storage settings:
   ```
   Provider: Supabase Storage
   Bucket: construction-docs-{org-id}
   Max file size: 50 MB
   ```
2. Create storage bucket
3. Set retention policy

### Step 5: Set Up Team

1. Import team members:
   ```csv
   name,email,role,language
   John Smith,john@example.com,manager,en
   Carlos Martinez,carlos@example.com,worker,es
   Nguyen Tran,nguyen@example.com,worker,vi
   ```
2. Send invitations
3. Verify accounts created
4. Set language preferences

### Step 6: Create Initial Project (Optional)

1. Create sample project:
   ```
   Name: Demo Project
   Budget: $100,000
   Start: Today
   End: +30 days
   ```
2. Add sample tasks
3. Assign team members
4. Test messaging with translation

### Step 7: Initial Test

1. Test translation:
   - Send message in English
   - Verify Spanish user sees translation
   - Test toggle to original
2. Test OCR:
   - Upload receipt photo
   - Verify extraction
   - Test manual correction
3. Test expense tracking:
   - Approve extracted receipt
   - Verify expense created
   - Check reports

### Step 8: Go Live

1. Invite all team members
2. Create real projects
3. Provide training (see Training section)
4. Monitor usage
5. Confirm with customer

---

## Post-Deployment

### Verification Checklist

- [ ] All features working
- [ ] Data sync enabled
- [ ] Notifications delivering
- [ ] Payments processing
- [ ] Logs showing normal activity

### Customer Handoff

1. Schedule training call
2. Share documentation links
3. Provide support contacts
4. Set up check-in schedule

### Monitoring First Week

- Check daily for errors
- Review sync status
- Monitor API usage
- Address any issues quickly

---

## Troubleshooting Common Issues

### Keys Open Doors

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails | Credentials wrong | Verify with customer |
| No deals found | Filters too strict | Expand filters |
| Post fails | Token expired | Regenerate token |

### Food Truck

| Issue | Cause | Solution |
|-------|-------|----------|
| Voice agent unresponsive | Webhook wrong | Check Twilio config |
| Orders not appearing | Sync issue | Manual sync |
| Payment fails | Stripe disconnected | Reconnect Stripe |

### Construction Management

| Issue | Cause | Solution |
|-------|-------|----------|
| Translation wrong | Technical term | Add to glossary |
| OCR inaccurate | Low quality image | Retake photo |
| Files not uploading | Size too large | Compress file |

---

## Related Documentation

- [Admin Dashboard Guide](./ADMIN_DASHBOARD_GUIDE.md)
- [Customer Onboarding](./CUSTOMER_ONBOARDING.md)
- [Integration Guide](../integration/AI_OPERATING_INTEGRATION.md)

