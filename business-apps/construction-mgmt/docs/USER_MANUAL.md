# Construction Management User Manual

Complete guide for using the Construction Management application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Projects](#projects)
3. [Tasks](#tasks)
4. [Team Management](#team-management)
5. [Receipts & Expenses](#receipts--expenses)
6. [Messages & Translation](#messages--translation)
7. [Documents](#documents)
8. [Reports](#reports)
9. [Mobile App](#mobile-app)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Logging In

1. Go to the Construction Management app URL
2. Enter your email and password
3. Select your organization (if multiple)
4. You'll land on the Projects dashboard

### Dashboard Overview

```
┌────────────────────────────────────────────────────────────────┐
│                  Construction Dashboard                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐│
│  │ Projects  │  │   Tasks   │  │  Budget   │  │   Messages   ││
│  │     5     │  │   Active  │  │  $45,230  │  │  3 Unread    ││
│  │   Active  │  │    12     │  │  of $150K │  │              ││
│  └───────────┘  └───────────┘  └───────────┘  └──────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    Active Projects                          ││
│  ├────────────────────────────────────────────────────────────┤│
│  │  🏗️ Office Renovation    │ 65% │ $45K/$150K │ 12 tasks    ││
│  │  🏠 Residential Build     │ 30% │ $85K/$300K │ 24 tasks    ││
│  │  🏢 Commercial Retrofit  │ 10% │ $12K/$200K │ 8 tasks     ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Setting Your Language

1. Click your profile icon (top right)
2. Go to **Settings**
3. Select **Preferred Language**
4. All messages will be translated to your language

---

## Projects

### Creating a Project

1. Click **"+ New Project"**
2. Fill in details:
   - **Name**: Project title
   - **Description**: Overview and notes
   - **Start Date**: When work begins
   - **End Date**: Target completion
   - **Budget**: Total budget amount
   - **Client**: Client name (optional)
   - **Address**: Project location
3. Click **Create Project**

### Project Dashboard

Each project has its own dashboard showing:
- Progress percentage
- Budget status (spent vs. remaining)
- Task summary
- Team members
- Recent activity

### Project Status

| Status | Meaning |
|--------|---------|
| 🟢 Active | Work in progress |
| 🟡 On Hold | Temporarily paused |
| ✅ Completed | Work finished |
| 🔴 Cancelled | Project cancelled |

### Editing a Project

1. Open the project
2. Click **Settings** (gear icon)
3. Update details
4. Click **Save Changes**

---

## Tasks

### Task Board (Kanban)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Task Board                                │
├───────────┬───────────┬───────────┬───────────┬────────────────┤
│  BACKLOG  │   TO DO   │IN PROGRESS│  REVIEW   │   COMPLETED    │
├───────────┼───────────┼───────────┼───────────┼────────────────┤
│ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌───────┐ │ ┌────────────┐ │
│ │ Frame │ │ │ Wire  │ │ │ Paint │ │ │ Tile  │ │ │ Foundation │ │
│ │ roof  │ │ │ elec. │ │ │ walls │ │ │ bath  │ │ │ complete   │ │
│ │       │ │ │       │ │ │       │ │ │       │ │ │            │ │
│ │ 🔵 Low │ │ │ 🟠 Med │ │ │ 🔴 Hi │ │ │ 🟠 Med │ │ │            │ │
│ └───────┘ │ └───────┘ │ └───────┘ │ └───────┘ │ └────────────┘ │
│           │           │           │           │                │
│ ┌───────┐ │           │ ┌───────┐ │           │ ┌────────────┐ │
│ │ HVAC  │ │           │ │ Dry   │ │           │ │ Framing    │ │
│ │ plan  │ │           │ │ wall  │ │           │ │ done       │ │
│ └───────┘ │           │ └───────┘ │           │ └────────────┘ │
└───────────┴───────────┴───────────┴───────────┴────────────────┘
```

### Creating a Task

1. Click **"+ Add Task"** in any column
2. Enter task details:
   - **Title**: Short description
   - **Description**: Full details
   - **Assignee**: Who's responsible
   - **Priority**: Low, Medium, High
   - **Due Date**: Deadline
   - **Estimated Hours**: Time estimate
   - **Tags**: For filtering
3. Click **Create**

### Moving Tasks

- **Drag and drop** cards between columns
- Or open task and change status from dropdown

### Task Details

Click on any task card to see:
- Full description
- Assignee
- Time logged
- Comments
- Attached files
- Activity history

### Logging Time

1. Open a task
2. Click **"Log Time"**
3. Enter:
   - Hours worked
   - What you did
   - Date
4. Click **Save**

### Task Priority Colors

| Color | Priority |
|-------|----------|
| 🔴 Red | High - Urgent |
| 🟠 Orange | Medium - Normal |
| 🔵 Blue | Low - When available |

---

## Team Management

### Adding Team Members

1. Go to Project → **Team**
2. Click **"+ Invite Member"**
3. Enter their email
4. Select their role:
   - **Manager** - Can manage everything
   - **Worker** - Can complete tasks and submit expenses
   - **Viewer** - Read-only access
5. Select their language preference
6. Click **Send Invite**

### Team Roles

| Role | Permissions |
|------|------------|
| Owner | Full access, can delete project |
| Manager | Manage tasks, expenses, team |
| Worker | Complete tasks, submit receipts |
| Viewer | View only, no changes |

### Removing Members

1. Go to Team tab
2. Find the member
3. Click **Remove** (trash icon)
4. Confirm removal

---

## Receipts & Expenses

### Uploading a Receipt

1. Go to Project → **Expenses**
2. Click **"+ Upload Receipt"**
3. Select or drag your file:
   - Take a photo (mobile)
   - Upload image file
   - Upload PDF
4. The system automatically extracts:
   - Vendor name
   - Date
   - Line items
   - Tax
   - Total

### Receipt Processing

```
┌─────────────────────────────────────────────────────────────────┐
│                    Receipt Processing                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📸 Receipt Image          │  📋 Extracted Data                 │
│  ┌───────────────────┐     │                                    │
│  │                   │     │  Vendor: Home Depot         ✓ 95% │
│  │   [Receipt Image] │     │  Date: 02/15/2024          ✓ 92% │
│  │                   │     │  ──────────────────────────────── │
│  │                   │     │  Items:                           │
│  │                   │     │  • 2x4 Lumber x20    $99.80  ✓    │
│  │                   │     │  • Screws Box        $12.99  ✓    │
│  │                   │     │  • Wood Glue         $8.49   ✓    │
│  │                   │     │  ──────────────────────────────── │
│  │                   │     │  Subtotal: $121.28                │
│  │                   │     │  Tax: $10.00                      │
│  └───────────────────┘     │  Total: $131.28             ✓ 98% │
│                            │                                    │
│  [Edit Data]  [Approve]  [Reject]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Reviewing Receipts

If confidence is low or review is needed:

1. Go to **Receipts → Review Queue**
2. Compare image with extracted data
3. Correct any errors
4. Click **Approve** to create expense
5. Or **Reject** with reason

### Manual Expense Entry

For expenses without receipts:

1. Click **"+ Add Expense"**
2. Enter:
   - Vendor
   - Description
   - Amount
   - Category
   - Date
3. Optionally attach receipt later
4. Click **Save**

### Expense Categories

| Category | Examples |
|----------|----------|
| Materials | Lumber, concrete, fixtures |
| Tools | Power tools, hand tools |
| Equipment | Rentals, machinery |
| Labor | Subcontractors, temp workers |
| Services | Permits, inspections |
| Other | Miscellaneous |

### Expense Reports

1. Go to **Reports → Expenses**
2. Select date range
3. Choose filters (category, project)
4. View breakdown:
   - By category
   - By month
   - By vendor
5. Export to Excel/PDF

---

## Messages & Translation

### Sending Messages

1. Go to Project → **Messages**
2. Type your message
3. Press Enter or click Send
4. Message is automatically translated for teammates

### How Translation Works

```
┌────────────────────────────────────────────────────────────────┐
│                    Team Chat (Your view: English)               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Carlos (10:30 AM)                                             │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ We need more concrete for section B.                       ││
│  │ Can you order 20 more bags?                                ││
│  └────────────────────────────────────────────────────────────┘│
│                                    [🇪🇸 View Original: Spanish] │
│                                                                 │
│  You (10:32 AM)                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Got it! I'll place the order now.                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Nguyen (10:35 AM)                                             │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ The delivery truck arrived.                                ││
│  │ Where should we unload?                                    ││
│  └────────────────────────────────────────────────────────────┘│
│                                 [🇻🇳 View Original: Vietnamese] │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Type a message...                              [Send]      ││
│  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

### Viewing Original Messages

- Click **"View Original: [Language]"** to see the original text
- Click again to see translation

### Supported Languages

🇺🇸 English | 🇪🇸 Spanish | 🇧🇷 Portuguese | 🇨🇳 Chinese | 🇻🇳 Vietnamese | 🇵🇭 Tagalog

And many more!

---

## Documents

### Uploading Documents

1. Go to Project → **Documents**
2. Click **"+ Upload"**
3. Select files (blueprints, permits, contracts)
4. Add description (optional)
5. Choose folder (optional)
6. Click **Upload**

### Document Organization

Create folders to organize:
- `/blueprints`
- `/permits`
- `/contracts`
- `/photos`

### Version History

When you update a document:

1. Click on the document
2. Click **"Upload New Version"**
3. Select the updated file
4. Add change notes
5. Previous versions are saved

### Comparing Versions

1. Open document
2. Go to **Versions** tab
3. Select two versions
4. Click **Compare**

### Downloading

- Click document → **Download**
- Download specific version from Versions tab

---

## Reports

### Available Reports

| Report | Description |
|--------|-------------|
| **Project Summary** | Overall progress, budget, timeline |
| **Expense Report** | Spending breakdown |
| **Task Report** | Task completion, time logged |
| **Team Report** | Work by team member |
| **Budget vs Actual** | Planned vs actual spending |

### Generating Reports

1. Go to **Reports**
2. Select report type
3. Choose project(s)
4. Set date range
5. Apply filters
6. Click **Generate**

### Exporting

- **PDF** - For sharing, printing
- **Excel** - For further analysis
- **CSV** - For data import

---

## Mobile App

### Taking Receipt Photos

1. Open mobile app
2. Go to project → **Add Receipt**
3. Tap camera icon
4. Take clear photo:
   - Flat surface
   - Good lighting
   - Full receipt visible
5. Review and submit

### Quick Task Updates

1. Open task
2. Tap status to change
3. Or tap **"Log Time"** to record hours

### Offline Mode

- View projects and tasks offline
- Queue receipts for upload
- Sync when connected

---

## Troubleshooting

### Common Issues

#### "Receipt not processing"

1. Check image quality
2. Ensure receipt is clearly visible
3. Try taking a new photo
4. Use manual entry if needed

#### "Translation incorrect"

1. Check if technical term
2. View original message
3. Report incorrect translations

#### "Can't see project"

1. Verify you're on the team
2. Check your role permissions
3. Contact project owner

#### "Upload failing"

1. Check file size (max 50MB)
2. Verify file format
3. Check internet connection

### Getting Help

1. Click **Help** (? icon)
2. Search help articles
3. Contact support
4. Include:
   - Project name
   - What you tried
   - Error message (if any)

---

## Quick Reference

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `T` | New task |
| `M` | New message |
| `/` | Search |
| `Esc` | Close modal |

### Mobile Gestures

| Gesture | Action |
|---------|--------|
| Swipe right | Complete task |
| Swipe left | Delete |
| Long press | More options |

---

For technical documentation, see [API Reference](./API_REFERENCE.md).

