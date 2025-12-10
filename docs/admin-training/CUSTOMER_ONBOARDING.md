# Customer Onboarding Guide

Complete guide for onboarding new customers to the AI-Operating platform.

## Overview

This guide covers the end-to-end process of bringing a new customer onto the platform, from initial contact through successful deployment.

## Onboarding Timeline

```
Week 1              Week 2              Week 3              Week 4
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Discovery &    │  Setup &        │  Training &     │  Go-Live &      │
│  Planning       │  Configuration  │  Testing        │  Support        │
│                 │                 │                 │                 │
│ • Discovery     │ • Create org    │ • Training      │ • Go live       │
│ • Requirements  │ • Deploy apps   │ • User testing  │ • Monitor       │
│ • Proposal      │ • Configure     │ • Adjustments   │ • Check-ins     │
│ • Agreement     │ • Data import   │ • Documentation │ • Feedback      │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

## Phase 1: Discovery & Planning

### Initial Discovery Call

**Agenda:**
1. Introduction and overview
2. Understand customer business
3. Identify pain points
4. Discuss potential solutions
5. Outline next steps

**Questions to Ask:**
- What is your business/industry?
- What problems are you trying to solve?
- What tools do you currently use?
- How many team members?
- What's your budget?
- What's your timeline?

### Requirements Gathering

#### For Keys Open Doors

```
Customer: _____________________
Date: _____________________

Business Details:
[ ] Investment type: [ ] Wholesale [ ] Fix & Flip [ ] Both
[ ] Target markets (cities): _____________________
[ ] Price range: $_____ to $_____
[ ] Property types: [ ] SFH [ ] Multi [ ] Commercial

InvestorLift:
[ ] Has account: [ ] Yes [ ] No
[ ] Credentials available: [ ] Yes [ ] Need to create

Instagram:
[ ] Account exists: [ ] Yes [ ] No
[ ] Account type: [ ] Personal [ ] Business [ ] Creator
[ ] Facebook Page linked: [ ] Yes [ ] No
[ ] Graph API preferred: [ ] Yes [ ] No

Schedule Preferences:
[ ] Scraping frequency: _____________________
[ ] Posting times: _____________________
[ ] Auto-post or manual review: _____________________
```

#### For Food Truck

```
Customer: _____________________
Date: _____________________

Business Details:
[ ] Business name: _____________________
[ ] Business phone: _____________________
[ ] Address/Location: _____________________
[ ] Operating hours: _____________________

Menu:
[ ] Menu available: [ ] Yes [ ] Need to create
[ ] Number of items: _____
[ ] Special options/modifiers: [ ] Yes [ ] No

Voice Agent:
[ ] Need voice ordering: [ ] Yes [ ] No
[ ] Preferred area code: _____
[ ] Fallback number: _____________________

Payments:
[ ] Stripe account: [ ] Existing [ ] Need to create
[ ] Payment methods needed:
    [ ] Credit/Debit
    [ ] Apple Pay
    [ ] Google Pay
    [ ] Cash
    [ ] Crypto

Notifications:
[ ] SMS notifications: [ ] Yes [ ] No
[ ] Email notifications: [ ] Yes [ ] No
[ ] In-app only: [ ] Yes [ ] No
```

#### For Construction Management

```
Customer: _____________________
Date: _____________________

Business Details:
[ ] Company name: _____________________
[ ] Number of team members: _____
[ ] Primary languages: _____________________

Team Languages:
[ ] English
[ ] Spanish
[ ] Portuguese
[ ] Chinese
[ ] Vietnamese
[ ] Other: _____________________

Features Needed:
[ ] Project management: [ ] Yes [ ] No
[ ] Task tracking: [ ] Yes [ ] No
[ ] Receipt scanning: [ ] Yes [ ] No
[ ] Expense tracking: [ ] Yes [ ] No
[ ] Team messaging: [ ] Yes [ ] No
[ ] Translation: [ ] Yes [ ] No
[ ] Document storage: [ ] Yes [ ] No

Data Migration:
[ ] Existing projects to import: [ ] Yes [ ] No
[ ] Existing team data: [ ] Yes [ ] No
[ ] Historical expenses: [ ] Yes [ ] No
```

### Proposal & Agreement

1. Prepare customized proposal:
   - Recommended apps
   - Features included
   - Pricing
   - Timeline
   - Support included

2. Review with customer

3. Sign service agreement:
   - Terms of service
   - Data processing agreement
   - SLA commitment

## Phase 2: Setup & Configuration

### Create Organization

1. Log into Admin Dashboard
2. Create new organization:
   ```
   Name: [Customer Company Name]
   Slug: [customer-slug]
   Owner Email: [customer@email.com]
   Subscription: [Selected Tier]
   ```
3. Send owner invitation

### Deploy Applications

Follow [App Deployment Guide](./APP_DEPLOYMENT_GUIDE.md) for each app:

1. **Keys Open Doors** (if selected)
   - [ ] InvestorLift configured
   - [ ] Instagram connected
   - [ ] Filters set
   - [ ] Schedule configured
   - [ ] Test scrape successful
   - [ ] Test post successful

2. **Food Truck** (if selected)
   - [ ] Business info entered
   - [ ] Menu imported
   - [ ] Voice agent configured
   - [ ] Payments connected
   - [ ] Notifications set up
   - [ ] Test order successful

3. **Construction Management** (if selected)
   - [ ] Translation configured
   - [ ] OCR configured
   - [ ] Storage set up
   - [ ] Team members invited
   - [ ] Test project created
   - [ ] Test translation successful

### Data Import

If customer has existing data:

1. Request data export from old system
2. Review data format
3. Create import scripts if needed
4. Validate imported data
5. Confirm with customer

## Phase 3: Training & Testing

### Training Schedule

#### Session 1: Platform Overview (1 hour)
- Dashboard navigation
- User management
- Settings overview
- Support resources

#### Session 2: App-Specific Training (1-2 hours per app)

**Keys Open Doors:**
- Dashboard overview
- Viewing scraped deals
- Approving/rejecting posts
- Manual posting
- Analytics review
- Configuration changes

**Food Truck:**
- Order dashboard
- Menu management
- Voice agent overview
- Payment processing
- Notifications
- Analytics

**Construction Management:**
- Project creation
- Task management
- Receipt upload
- Expense tracking
- Team messaging
- Translation features

#### Session 3: Advanced Features (1 hour)
- Reporting
- Integrations
- Troubleshooting
- Best practices

### Training Materials

Provide customer with:
- [ ] User manual links
- [ ] Video tutorials (if available)
- [ ] Quick reference guides
- [ ] FAQ document
- [ ] Support contact info

### User Acceptance Testing

#### Test Checklist

```
Application: _____________________
Tester: _____________________
Date: _____________________

Core Functions:
[ ] Login works correctly
[ ] Dashboard loads
[ ] Data displays correctly
[ ] Actions complete successfully
[ ] Notifications received
[ ] Reports generate

Integration Tests:
[ ] External services connected
[ ] Data syncs properly
[ ] Payments process
[ ] Files upload

Edge Cases:
[ ] Error handling works
[ ] Invalid input rejected
[ ] Timeouts handled
[ ] Fallbacks work

Notes/Issues:
_____________________
_____________________
_____________________
```

### Adjustments

Based on testing feedback:
1. Document all issues
2. Prioritize fixes
3. Implement changes
4. Re-test affected areas
5. Get customer sign-off

## Phase 4: Go-Live & Support

### Go-Live Checklist

```
Pre-Launch:
[ ] All tests passed
[ ] Customer training complete
[ ] Documentation provided
[ ] Support plan confirmed
[ ] Billing active

Launch Day:
[ ] Disable test mode
[ ] Enable production features
[ ] Monitor first transactions
[ ] Check for errors
[ ] Stand by for support

Post-Launch:
[ ] Confirm everything working
[ ] Address any issues
[ ] Schedule check-in call
[ ] Send welcome package
```

### Monitoring Period

**Week 1:** Daily check-ins
- Review logs
- Check sync status
- Monitor errors
- Proactive outreach

**Week 2-4:** Weekly check-ins
- Usage review
- Performance check
- Feature adoption
- Gather feedback

**After Month 1:** Monthly reviews
- Analytics review
- Feature requests
- Satisfaction check
- Renewal discussion

### Support Tiers

| Tier | Response Time | Channels | Hours |
|------|---------------|----------|-------|
| Basic | 24 hours | Email | Business hours |
| Standard | 8 hours | Email, Chat | Business hours |
| Premium | 4 hours | Email, Chat, Phone | Extended |
| Enterprise | 1 hour | All + Dedicated | 24/7 |

### Escalation Path

```
Level 1: Support Team
    │
    ▼ (If unresolved in 4 hours)
Level 2: Technical Lead
    │
    ▼ (If unresolved in 8 hours)
Level 3: Engineering Team
    │
    ▼ (If critical issue)
Level 4: Management
```

## Communication Templates

### Welcome Email

```
Subject: Welcome to AI-Operating! 🎉

Hi [Name],

Welcome to AI-Operating! We're excited to have [Company] on board.

Your account is now set up and ready to go. Here's what you need to know:

📱 Login URL: https://app.your-domain.com
📚 Documentation: https://docs.your-domain.com
💬 Support: support@your-domain.com

Your deployed applications:
- [App 1]
- [App 2]

Next steps:
1. Complete your profile
2. Invite team members
3. Review the quick start guide
4. Schedule your training session

We're here to help you succeed. Don't hesitate to reach out!

Best regards,
[Your Name]
AI-Operating Team
```

### Training Confirmation

```
Subject: Training Session Confirmed - [Date]

Hi [Name],

Your training session is confirmed:

📅 Date: [Date]
🕐 Time: [Time] [Timezone]
📍 Location: [Video call link]
⏱️ Duration: [Duration]

Topics we'll cover:
- [Topic 1]
- [Topic 2]
- [Topic 3]

Please have the following ready:
- Access to your account
- Questions you'd like answered
- Any team members who should attend

See you there!

[Your Name]
```

### Go-Live Confirmation

```
Subject: You're Live! 🚀

Hi [Name],

Congratulations! [Company] is now live on AI-Operating.

✅ All systems are operational
✅ Your apps are running
✅ We're monitoring everything

Quick reminders:
- Dashboard: https://app.your-domain.com
- Support: support@your-domain.com
- Emergency: [Phone number]

I'll check in with you [tomorrow/next week] to see how everything is going.

To your success!

[Your Name]
```

## Success Metrics

Track onboarding success with:

| Metric | Target |
|--------|--------|
| Time to first value | < 7 days |
| Training completion | 100% |
| First week activity | Daily login |
| Support tickets | < 3 |
| Customer satisfaction | > 4.5/5 |

---

## Related Documentation

- [Admin Dashboard Guide](./ADMIN_DASHBOARD_GUIDE.md)
- [App Deployment Guide](./APP_DEPLOYMENT_GUIDE.md)
- [Integration Guide](../integration/AI_OPERATING_INTEGRATION.md)

