# AI-Operating Admin Dashboard Guide

Complete guide for administrators managing the AI-Operating platform.

## Overview

The Admin Dashboard provides centralized control over:
- Organizations and users
- Business app instances
- System health monitoring
- Analytics and reporting
- Configuration management

## Accessing the Dashboard

1. Log in at `https://admin.your-domain.com`
2. Use admin credentials
3. Complete 2FA verification (if enabled)

## Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  🏠 AI-Operating Admin                    👤 Admin User   ⚙️  🔔  📤   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────┐                                                           │
│  │ 📊      │   ┌─────────────────────────────────────────────────────┐│
│  │Dashboard│   │                   Overview                          ││
│  │         │   ├─────────────────────────────────────────────────────┤│
│  │ 🏢      │   │                                                     ││
│  │ Orgs    │   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       ││
│  │         │   │  │  25    │ │  48    │ │  156   │ │ $12.5K │       ││
│  │ 📱      │   │  │  Orgs  │ │  Apps  │ │ Users  │ │Revenue │       ││
│  │ Apps    │   │  └────────┘ └────────┘ └────────┘ └────────┘       ││
│  │         │   │                                                     ││
│  │ 👥      │   │  ┌───────────────────────────────────────────────┐ ││
│  │ Users   │   │  │           App Health Status                   │ ││
│  │         │   │  ├───────────────────────────────────────────────┤ ││
│  │ 📈      │   │  │ ✅ Keys Open Doors (15)     All healthy       │ ││
│  │Analytics│   │  │ ⚠️ Food Truck (18)          2 warnings        │ ││
│  │         │   │  │ ✅ Construction Mgmt (15)   All healthy       │ ││
│  │ ⚙️      │   │  └───────────────────────────────────────────────┘ ││
│  │Settings │   │                                                     ││
│  │         │   │  ┌───────────────────────────────────────────────┐ ││
│  │ 📋      │   │  │              Recent Activity                  │ ││
│  │ Logs    │   │  ├───────────────────────────────────────────────┤ ││
│  └─────────┘   │  │ • New org created: ABC Corp (2 min ago)       │ ││
│                │  │ • App deployed: Food Truck #47 (15 min ago)   │ ││
│                │  │ • User invited: john@xyz.com (1 hr ago)       │ ││
│                │  └───────────────────────────────────────────────┘ ││
│                └─────────────────────────────────────────────────────┘│
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## Organizations

### Viewing Organizations

1. Click **Organizations** in sidebar
2. View list with:
   - Name and slug
   - Subscription tier
   - Member count
   - App instances
   - Created date

### Creating an Organization

1. Click **"+ New Organization"**
2. Enter details:
   - **Name**: Company name
   - **Slug**: URL-friendly identifier
   - **Owner Email**: Primary admin email
   - **Subscription**: Free, Starter, Pro, Enterprise
3. Click **Create**
4. Owner receives invitation email

### Managing Organizations

#### Edit Organization

1. Click organization row
2. Update details
3. Click **Save**

#### Change Subscription

1. Open organization
2. Go to **Subscription** tab
3. Select new tier
4. Confirm changes
5. Billing adjusts automatically

#### Suspend Organization

1. Open organization
2. Click **Actions → Suspend**
3. Enter reason
4. Confirm suspension
5. All app instances pause

#### Delete Organization

1. Open organization
2. Click **Actions → Delete**
3. Type organization name to confirm
4. **Warning**: This is irreversible

### Organization Details View

```
┌────────────────────────────────────────────────────────────────────────┐
│  ABC Corporation                                    [Edit] [Actions ▼] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Subscription: Pro          │  Members: 12          │  Status: Active  │
│  Created: Jan 1, 2024       │  Apps: 3              │  MRR: $299/mo    │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│  [Overview]  [Members]  [Apps]  [Billing]  [Settings]  [Audit Log]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  App Instances:                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🏠 Keys Open Doors    │ Active │ Last sync: 5 min ago │ Config │  │
│  │ 🍔 Food Truck          │ Active │ Last sync: 2 min ago │ Config │  │
│  │ 🔨 Construction Mgmt   │ Active │ Last sync: 1 min ago │ Config │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Recent Activity:                                                       │
│  • User 'john@abc.com' created task (2 min ago)                        │
│  • Order #123 completed (15 min ago)                                   │
│  • New team member added (1 hr ago)                                    │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

## App Instances

### Viewing All Instances

1. Click **Apps** in sidebar
2. View all instances across organizations
3. Filter by:
   - App type
   - Status
   - Organization
   - Date created

### Instance Status

| Status | Icon | Meaning |
|--------|------|---------|
| Active | ✅ | Running normally |
| Warning | ⚠️ | Issues detected |
| Error | ❌ | Needs attention |
| Paused | ⏸️ | Manually paused |
| Provisioning | 🔄 | Being set up |

### Creating App Instance

1. Click **"+ Deploy App"**
2. Select organization
3. Choose app type
4. Configure settings
5. Click **Deploy**

### Instance Configuration

#### Keys Open Doors

```
┌──────────────────────────────────────────────────────────────────┐
│  Keys Open Doors Configuration                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  InvestorLift Credentials:                                        │
│  Email: ********@example.com                [Edit]               │
│  Password: ••••••••                         [Change]             │
│                                                                   │
│  Scraping Settings:                                               │
│  Cities: Houston, Dallas, San Antonio       [Edit]               │
│  Min Price: $50,000                                              │
│  Max Price: $300,000                                             │
│  Schedule: Mon/Thu 3:00 AM                  [Modify]             │
│                                                                   │
│  Instagram:                                                       │
│  Account: @keysopendoors                    [Reconnect]          │
│  Auth Method: Graph API                                          │
│  AI Captions: Enabled                                            │
│                                                                   │
│  [Save Changes]  [Test Connection]  [Run Now]                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### Food Truck

```
┌──────────────────────────────────────────────────────────────────┐
│  Food Truck Configuration                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Business Info:                                                   │
│  Name: This What I Do BBQ                                        │
│  Phone: +1 (555) 123-4567                                        │
│  Address: Houston, TX                                            │
│                                                                   │
│  Voice Agent:                                                     │
│  Enabled: Yes                               [Configure]          │
│  Twilio Number: +1 (555) 987-6543                               │
│  Fallback: +1 (555) 123-4567                                    │
│                                                                   │
│  Payments:                                                        │
│  Stripe: Connected ✅                       [Manage]             │
│  PayPal: Not connected                      [Connect]            │
│  Cash: Enabled                                                   │
│                                                                   │
│  Notifications:                                                   │
│  SMS: Enabled (Twilio)                                          │
│  Email: Enabled (SendGrid)                                      │
│                                                                   │
│  [Save Changes]  [Test Voice]  [View Menu]                       │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

#### Construction Management

```
┌──────────────────────────────────────────────────────────────────┐
│  Construction Management Configuration                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Translation Service:                                             │
│  Provider: Google Cloud Translation                              │
│  Fallback: DeepL                                                 │
│  Cache TTL: 24 hours                                             │
│                                                                   │
│  OCR Service:                                                     │
│  Provider: Google Vision                                         │
│  Auto-categorize: Enabled                                        │
│  Review threshold: 80%                                           │
│                                                                   │
│  Storage:                                                         │
│  Provider: Supabase Storage                                      │
│  Max file size: 50 MB                                            │
│  Retention: 1 year                                               │
│                                                                   │
│  [Save Changes]  [Test Translation]  [Test OCR]                  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Instance Actions

- **Pause** - Temporarily stop the app
- **Resume** - Resume paused app
- **Restart** - Restart the app
- **Reset** - Clear data and reset
- **Delete** - Remove instance entirely

## User Management

### Viewing Users

1. Click **Users** in sidebar
2. View all platform users
3. Filter by:
   - Organization
   - Role
   - Status
   - Last active

### User Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full platform access |
| **Admin** | Manage organizations assigned |
| **Support** | View-only, limited actions |
| **Developer** | API access, logs |

### Managing Users

#### Reset Password

1. Find user
2. Click **Actions → Reset Password**
3. User receives reset email

#### Disable Account

1. Find user
2. Click **Actions → Disable**
3. User cannot log in

#### Impersonate User

1. Find user
2. Click **Actions → Impersonate**
3. Log in as that user
4. Click banner to exit

## Analytics

### Dashboard Metrics

- **Total Organizations** - Active organizations
- **App Instances** - Total deployed apps
- **Active Users** - Users active in last 30 days
- **Monthly Revenue** - MRR breakdown

### Reports

#### Organization Report

- Growth over time
- Churn rate
- Average apps per org

#### App Usage Report

- Usage by app type
- Feature adoption
- Error rates

#### Revenue Report

- MRR by tier
- Revenue by app
- Growth trends

### Exporting Data

1. Go to **Analytics**
2. Select report type
3. Choose date range
4. Click **Export**
5. Download CSV/Excel

## System Health

### Monitoring Dashboard

```
┌────────────────────────────────────────────────────────────────────────┐
│                          System Health                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Services:                                                              │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ ✅ API Server          │ Healthy │ 45ms avg │ 99.9% uptime    │    │
│  │ ✅ Database             │ Healthy │ 12ms avg │ 99.99% uptime   │    │
│  │ ✅ Auth Service         │ Healthy │ 28ms avg │ 100% uptime     │    │
│  │ ⚠️ Translation API     │ Degraded│ 250ms avg│ 99.5% uptime    │    │
│  │ ✅ OCR Service          │ Healthy │ 2.5s avg │ 99.8% uptime    │    │
│  │ ✅ Storage              │ Healthy │ 85ms avg │ 100% uptime     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  Recent Incidents:                                                      │
│  • ⚠️ Translation API slow (15 min ago) - Investigating               │
│  • ✅ API maintenance completed (2 days ago)                           │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Alerts

Configure alerts for:
- Service downtime
- High error rates
- Unusual activity
- Resource limits

### Logs

Access logs for:
- API requests
- Authentication events
- Sync operations
- Error traces

## Settings

### Platform Settings

- **Branding** - Logo, colors, favicon
- **Email Templates** - Customize notifications
- **Feature Flags** - Enable/disable features
- **API Keys** - Manage platform API keys

### Security Settings

- **2FA Requirement** - Force 2FA for admins
- **Session Timeout** - Auto-logout time
- **IP Whitelist** - Restrict admin access
- **Audit Logging** - Track all changes

### Billing Settings

- **Stripe Account** - Payment processor
- **Pricing Tiers** - Subscription plans
- **Invoicing** - Invoice settings
- **Coupons** - Discount codes

## Common Workflows

### Onboarding New Organization

1. Create organization
2. Invite owner
3. Set up billing
4. Deploy requested apps
5. Configure integrations
6. Run initial sync
7. Verify everything works

### Troubleshooting App Issues

1. Check instance status
2. Review recent logs
3. Test connections
4. Check external services
5. Contact customer if needed
6. Document resolution

### Handling Support Requests

1. Identify organization
2. Impersonate user if needed
3. Investigate issue
4. Apply fix or escalate
5. Update ticket
6. Follow up with customer

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` then `D` | Go to Dashboard |
| `G` then `O` | Go to Organizations |
| `G` then `A` | Go to Apps |
| `G` then `U` | Go to Users |
| `/` | Global search |
| `?` | Show shortcuts |

---

## Related Documentation

- [App Deployment Guide](./APP_DEPLOYMENT_GUIDE.md)
- [Customer Onboarding](./CUSTOMER_ONBOARDING.md)
- [Integration Guide](../integration/AI_OPERATING_INTEGRATION.md)

