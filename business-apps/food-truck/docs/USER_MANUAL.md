# Food Truck User Manual

Complete guide for operating the Food Truck ordering system and AI voice agent.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Menu Management](#menu-management)
4. [Order Management](#order-management)
5. [Voice Agent](#voice-agent)
6. [Payments](#payments)
7. [Notifications](#notifications)
8. [Analytics](#analytics)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the System

1. Log in to AI-Operating platform
2. Navigate to Business Apps → Food Truck
3. Or access directly at your deployed URL

### Quick Actions

From the dashboard, you can:
- View incoming orders
- Update order status
- Toggle menu item availability
- Monitor voice agent calls
- View daily sales

---

## Dashboard Overview

```
┌────────────────────────────────────────────────────────────┐
│                   Food Truck Dashboard                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐│
│  │  Orders   │  │  Revenue  │  │   Calls   │  │ Avg Wait ││
│  │    12     │  │  $485.50  │  │     8     │  │  12 min  ││
│  │  Pending  │  │   Today   │  │   Today   │  │          ││
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘│
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Active Orders                            │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  #001 - John D.     │ Preparing  │ 2 items │ $27.50 │  │
│  │  #002 - Sarah M.    │ Ready      │ 1 item  │ $18.99 │  │
│  │  #003 - Mike T.     │ Pending    │ 3 items │ $45.00 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Menu Management

### Viewing the Menu

Navigate to **Menu** to see all categories and items.

### Adding a Category

1. Click **"Add Category"**
2. Enter:
   - Name (e.g., "Plates")
   - Description
   - Display Order
3. Click **Save**

### Adding Menu Items

1. Select a category
2. Click **"Add Item"**
3. Fill in:
   - Name
   - Description
   - Price
   - Image (optional)
   - Options (e.g., sizes, modifications)
4. Click **Save**

### Managing Item Availability

Toggle availability with the switch:
- **Green** = Available
- **Red** = Sold Out

When an item is unavailable:
- It won't appear for online orders
- Voice agent won't offer it
- Existing orders are unaffected

### Item Options

Add customization options:

```
Option Group: "Side Choice"
Required: Yes
Choices:
  - Mac and Cheese ($0)
  - Coleslaw ($0)
  - Baked Beans ($0)
  - Extra Side (+$3.50)
```

### Pricing Updates

1. Click on an item
2. Update the price
3. Changes take effect immediately

---

## Order Management

### Order Flow

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐
│ PENDING │───▶│ CONFIRMED │───▶│ PREPARING │───▶│   READY   │
└─────────┘    └───────────┘    └───────────┘    └───────────┘
                                                       │
                                                       ▼
                                                ┌───────────┐
                                                │ COMPLETED │
                                                └───────────┘
```

### Processing Orders

1. **New orders** appear with PENDING status
2. Review order details
3. Click **"Confirm"** to accept
4. Click **"Start Preparing"** when cooking begins
5. Click **"Ready"** when order is ready for pickup
6. Click **"Complete"** when customer picks up

### Order Details View

```
┌──────────────────────────────────────────────────┐
│  Order #001                     Status: PREPARING │
├──────────────────────────────────────────────────┤
│  Customer: John Doe                               │
│  Phone: (123) 456-7890                           │
│  Placed: 12:30 PM                                 │
│  Est. Ready: 12:45 PM                             │
├──────────────────────────────────────────────────┤
│  Items:                                           │
│  • 1x Brisket Plate          $18.99              │
│    - Side: Mac and Cheese                        │
│    - Side: Coleslaw                              │
│  • 1x Pulled Pork Sandwich   $12.99              │
│    - Special: Extra sauce                        │
├──────────────────────────────────────────────────┤
│  Subtotal:  $31.98                               │
│  Tax:       $2.64                                │
│  Total:     $34.62                               │
│  Payment:   Card (Paid)                          │
├──────────────────────────────────────────────────┤
│  Notes: Will call when arriving                  │
├──────────────────────────────────────────────────┤
│  [Confirm] [Start Preparing] [Ready] [Cancel]    │
└──────────────────────────────────────────────────┘
```

### Cancelling Orders

1. Click **"Cancel Order"**
2. Select reason:
   - Customer requested
   - Item unavailable
   - Store closing
   - Other
3. If paid, refund is processed automatically

### Order Modifications

After confirmation, you can:
- Add items
- Remove items
- Adjust prices (with manager approval)
- Change pickup time

---

## Voice Agent

### How It Works

1. Customer calls your business number
2. AI agent greets and takes order
3. Order appears in dashboard
4. Customer receives confirmation SMS

### Monitoring Calls

View active and recent calls:

```
┌──────────────────────────────────────────────────┐
│              Voice Agent Activity                 │
├──────────────────────────────────────────────────┤
│  Active Calls: 2                                  │
│                                                   │
│  📞 (555) 123-4567 - Taking order (1:30)        │
│  📞 (555) 987-6543 - Confirming (0:45)          │
│                                                   │
│  Recent:                                          │
│  ✓ (555) 111-2222 - Order #004 created (2 min)  │
│  ✓ (555) 333-4444 - Order #003 created (5 min)  │
│  ✗ (555) 555-6666 - Transferred to human (8 min)│
└──────────────────────────────────────────────────┘
```

### Call Transcript

View conversation history:

```
┌──────────────────────────────────────────────────┐
│  Call Transcript - (555) 123-4567                │
├──────────────────────────────────────────────────┤
│  AI: Thank you for calling! What can I get you? │
│                                                   │
│  Customer: I'd like a brisket plate             │
│                                                   │
│  AI: Great choice! What sides would you like?   │
│                                                   │
│  Customer: Mac and cheese and coleslaw          │
│                                                   │
│  AI: Perfect! That's one brisket plate with     │
│      mac and cheese and coleslaw. Total $21.63. │
│      Can I get a name?                          │
│                                                   │
│  Customer: John                                  │
│                                                   │
│  AI: Thanks John! Ready in 15 minutes.          │
└──────────────────────────────────────────────────┘
```

### Fallback Handling

When AI transfers to human:
1. You'll see a notification
2. Answer the transferred call
3. Complete the order manually

### Voice Agent Settings

Configure in **Settings → Voice Agent**:
- Business hours
- Greeting message
- Estimated prep times
- Maximum order value
- Special instructions handling

---

## Payments

### Accepted Payment Methods

| Method | When |
|--------|------|
| **Card** | Online/phone orders |
| **Cash** | Pickup only |
| **Apple/Google Pay** | Online orders |
| **Crypto** | If enabled |

### Processing Card Payments

Card payments are processed automatically:
1. Customer enters card info
2. Payment is captured
3. Order is confirmed

### Processing Cash Payments

1. Order shows "Pay at Pickup"
2. When customer arrives, click **"Process Cash"**
3. Enter amount received
4. System shows change due

### Refunds

1. Find the order
2. Click **"Refund"**
3. Enter refund amount (partial or full)
4. Add reason
5. Confirm

Refund timing:
- Card: 5-10 business days
- Cash: Immediate

### End of Day

1. Go to **Reports → Daily Summary**
2. Review totals:
   - Card sales
   - Cash sales
   - Refunds
3. Export for accounting

---

## Notifications

### Customer Notifications

Customers receive:
- Order confirmation (SMS + Email)
- Order ready notification (SMS)
- Pickup reminder (if enabled)

### Notification Templates

Customize in **Settings → Notifications**:

```
Order Confirmation:
"Thanks for your order from {business_name}! 
Order #{order_number} will be ready at {ready_time}."

Order Ready:
"Your order #{order_number} is ready for pickup! 
See you soon at {business_name}."
```

### Staff Notifications

Enable alerts for:
- New orders
- Large orders (over $X)
- Voice agent fallbacks
- Payment issues

---

## Analytics

### Daily Dashboard

View key metrics:
- Total orders
- Revenue
- Average order value
- Popular items
- Peak hours

### Reports

Generate reports for:
- Daily/weekly/monthly sales
- Item popularity
- Customer data
- Voice agent performance

### Export Data

Export to CSV/Excel:
1. Go to **Reports**
2. Select date range
3. Choose data type
4. Click **Export**

---

## Troubleshooting

### Common Issues

#### "Orders not appearing"

1. Check internet connection
2. Refresh dashboard
3. Verify Supabase connection

#### "Voice agent not working"

1. Check Twilio status
2. Verify webhook URLs
3. Test with manual call
4. Check OpenAI API quota

#### "Payments failing"

1. Verify Stripe credentials
2. Check for declined cards
3. Review Stripe logs

#### "Notifications not sending"

1. Check Twilio SMS balance
2. Verify phone number format
3. Check email SMTP settings

### Getting Help

1. Check system status
2. Review error logs
3. Contact support

### Emergency Procedures

**If voice agent fails:**
1. Calls will transfer to backup number
2. Take orders manually
3. Enter into system later

**If payment system fails:**
1. Accept cash only
2. Record orders manually
3. Process cards later

---

## Quick Reference

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | New order |
| `R` | Refresh |
| `1-5` | Quick status update |
| `Esc` | Close modal |

### Status Colors

| Color | Status |
|-------|--------|
| 🟡 Yellow | Pending |
| 🔵 Blue | Confirmed |
| 🟠 Orange | Preparing |
| 🟢 Green | Ready |
| ⚪ Gray | Completed |
| 🔴 Red | Cancelled |

---

For technical documentation, see [API Reference](./API_REFERENCE.md).

