# API Summary - Today's New Features
**Date**: November 18, 2024

---

## 📋 Quick Reference

### New API Endpoints Added: **12**
### New Database Tables: **4**
### Modified Tables: **4**
### Total Additional API Calls: **25+** (including variations)

---

## 🎯 API Endpoint Overview

| # | Method | Endpoint | Role Access | Purpose |
|---|--------|----------|-------------|---------|
| 1 | GET | `/api/finance/dashboard` | Finance, Admin | Get finance dashboard summary |
| 2 | GET | `/api/finance/approvals` | Finance, Admin | List pending approvals |
| 3 | POST | `/api/finance/approvals/:id/approve` | Finance, Admin | Approve financial item |
| 4 | POST | `/api/finance/approvals/:id/reject` | Finance, Admin | Reject financial item |
| 5 | GET | `/api/finance/metrics` | Finance, Admin, Accounts | Get financial metrics & trends |
| 6 | GET | `/api/accounts/dashboard` | Accounts, Finance, Admin | Get accounts dashboard summary |
| 7 | POST | `/api/accounts/payroll/initiate` | Accounts, Admin | Initiate payroll for approval |
| 8 | GET | `/api/accounts/payroll/queue` | Accounts, Finance, Admin | Get payroll processing queue |
| 9 | POST | `/api/accounts/expenses` | Accounts, Finance, Manager, Admin | Record new expense |
| 10 | GET | `/api/companies/:id/features` | Admin | Get company feature configuration |
| 11 | PUT/PATCH | `/api/companies/:id/features` | Super Admin | Update company features |
| 12 | GET | `/api/features/recommendations` | Super Admin | Get feature recommendations by industry |

---

## 🔥 Core API Details

### 1️⃣ Finance Dashboard API

#### GET `/api/finance/dashboard`

**Purpose**: Retrieve complete finance dashboard data in one call

**Authentication**: Required (Finance, Admin roles)

**Headers**:
```http
Authorization: Bearer {jwt_token}
X-Company-ID: {company_uuid}
```

**Query Parameters**:
```
?period=month          // Options: month, quarter, year
&start_date=2024-11-01 // Optional: ISO date
&end_date=2024-11-30   // Optional: ISO date
```

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_revenue": 450000,
      "revenue_growth": 12.5,
      "total_expenses": 280000,
      "expense_growth": 8.3,
      "net_income": 170000,
      "profit_margin": 37.8,
      "cash_balance": 325000
    },
    "financial_position": {
      "accounts_receivable": 125000,
      "accounts_payable": 85000,
      "working_capital": 40000
    },
    "pending_approvals": {
      "count": 3,
      "total_amount": 342000,
      "items": [...]
    },
    "recent_transactions": [...],
    "outstanding_invoices": [...]
  },
  "meta": {
    "period": "month",
    "start_date": "2024-11-01",
    "end_date": "2024-11-30",
    "currency": "USD"
  }
}
```

**Performance**:
- Target response time: < 500ms
- Caching: 15 minutes
- Data freshness: Real-time for approvals, cached for metrics

**Error Codes**:
```
403 - Forbidden (insufficient permissions)
404 - Company not found
500 - Server error
```

---

### 2️⃣ Approvals API

#### GET `/api/finance/approvals`

**Purpose**: List all items requiring Finance approval

**Authentication**: Required (Finance, Admin roles)

**Query Parameters**:
```
?status=pending           // Options: pending, approved, rejected, all
&type=payroll            // Options: payroll, expense, refund, invoice, budget
&priority=high           // Options: low, normal, high, urgent
&page=1                  // Pagination
&limit=20                // Results per page
&sort=requested_at       // Sort field
&order=desc              // Sort order: asc, desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "type": "payroll",
        "reference_id": "payroll-uuid",
        "reference_number": "November 2024",
        "amount": 285000,
        "currency": "USD",
        "description": "Monthly payroll for 125 employees",
        "category": "Payroll",
        "status": "pending",
        "priority": "high",
        "requested_by": {
          "id": "user-uuid",
          "name": "Emily Rodriguez",
          "email": "accounts@company.com",
          "role": "accounts"
        },
        "requested_at": "2024-11-15T10:00:00Z",
        "metadata": {
          "employee_count": 125,
          "payroll_period": "2024-11"
        }
      }
    ],
    "summary": {
      "total": 3,
      "total_amount": 342000,
      "by_type": {
        "payroll": 1,
        "expense": 2
      },
      "by_priority": {
        "high": 2,
        "normal": 1
      }
    },
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 1,
      "total_count": 3
    }
  }
}
```

---

#### POST `/api/finance/approvals/:approval_id/approve`

**Purpose**: Approve a financial item

**Authentication**: Required (Finance, Admin roles)

**URL Parameters**:
```
:approval_id - UUID of the approval record
```

**Request Body**:
```json
{
  "notes": "Approved for November processing"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "Approval processed successfully",
  "data": {
    "approval_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "approved_by": "finance-user-uuid",
    "approved_at": "2024-11-18T14:30:00Z",
    "reference_updated": true,
    "next_steps": "Payroll queued for processing"
  }
}
```

**Side Effects**:
1. Updates `financial_approvals.status` to 'approved'
2. Updates referenced record (e.g., `payroll_queue.status` to 'approved')
3. Triggers background processing job
4. Sends notification to requester
5. Creates audit log entry

**Idempotency**: Approving already-approved item returns success with warning

---

#### POST `/api/finance/approvals/:approval_id/reject`

**Purpose**: Reject a financial item

**Request Body**:
```json
{
  "rejection_reason": "Insufficient budget allocation for this period"  // Required
}
```

**Response**:
```json
{
  "success": true,
  "message": "Approval rejected",
  "data": {
    "approval_id": "uuid",
    "status": "rejected",
    "rejected_by": "finance-user-uuid",
    "rejected_at": "2024-11-18T14:30:00Z",
    "rejection_reason": "Insufficient budget allocation for this period"
  }
}
```

---

### 3️⃣ Accounts Dashboard API

#### GET `/api/accounts/dashboard`

**Purpose**: Retrieve accounts operations dashboard data

**Authentication**: Required (Accounts, Finance, Admin roles)

**Response**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "invoices_sent": 42,
      "invoices_paid": 35,
      "invoices_pending": 7,
      "total_collected": 675000,
      "pending_collection": 175000,
      "collection_rate": 79.4,
      "payroll_processed": 12,
      "expenses_recorded": 145
    },
    "monthly_activity": {
      "period": "2024-11",
      "invoices_created": 12,
      "payments_received": 8,
      "payroll_runs": 1,
      "expenses_recorded": 24,
      "journal_entries": 35
    },
    "recent_invoices": [
      {
        "id": "inv-uuid",
        "invoice_number": "INV-2024-005",
        "client": "Acme Corp",
        "client_id": "client-uuid",
        "amount": 45000,
        "status": "sent",
        "issue_date": "2024-11-10",
        "due_date": "2024-12-10",
        "days_until_due": 22
      }
    ],
    "payroll_queue": [
      {
        "id": "payroll-uuid",
        "period": "November 2024",
        "period_month": 11,
        "period_year": 2024,
        "employee_count": 125,
        "total_amount": 285000,
        "status": "pending_approval",
        "approval_id": "approval-uuid",
        "initiated_by": {
          "id": "user-uuid",
          "name": "Emily Rodriguez"
        },
        "initiated_at": "2024-11-15T10:00:00Z"
      }
    ],
    "recent_expenses": [
      {
        "id": "expense-uuid",
        "date": "2024-11-15",
        "description": "Office Equipment",
        "amount": 2500,
        "category": "Operating Expenses",
        "vendor": "Office Depot",
        "status": "recorded",
        "requires_approval": false
      }
    ]
  }
}
```

**Caching**: 5 minutes

---

#### POST `/api/accounts/payroll/initiate`

**Purpose**: Create new payroll and submit for Finance approval

**Authentication**: Required (Accounts, Admin roles)

**Request Body**:
```json
{
  "period_month": 11,          // Required: 1-12
  "period_year": 2024,         // Required: Current or future year
  "period_label": "November 2024",  // Optional: Auto-generated if not provided
  "employee_count": 125,       // Required
  "total_amount": 285000,      // Required
  "currency": "USD",           // Optional: Default from company settings
  "notes": "Regular monthly payroll",  // Optional
  "breakdown": {               // Optional: Detailed breakdown
    "gross_salary": 320000,
    "deductions": 35000,
    "net_salary": 285000
  }
}
```

**Validation Rules**:
- Cannot create duplicate payroll for same period
- Total amount must be > 0
- Employee count must be > 0
- Period must not be in the past (more than 3 months)

**Response**:
```json
{
  "success": true,
  "message": "Payroll initiated and submitted for approval",
  "data": {
    "payroll_id": "payroll-uuid",
    "approval_id": "approval-uuid",
    "status": "pending_approval",
    "period": "November 2024",
    "total_amount": 285000,
    "employee_count": 125,
    "submitted_for_approval_at": "2024-11-18T14:30:00Z",
    "estimated_approval_by": "2024-11-19T14:30:00Z"  // SLA: 24 hours
  }
}
```

**Side Effects**:
1. Creates `payroll_queue` record
2. Creates `financial_approvals` record
3. Sends notification to Finance team
4. Creates audit log

**Error Responses**:
```json
{
  "success": false,
  "error": "Duplicate payroll",
  "message": "Payroll for November 2024 already exists",
  "code": "DUPLICATE_PAYROLL",
  "details": {
    "existing_payroll_id": "uuid",
    "status": "pending_approval"
  }
}
```

---

#### GET `/api/accounts/payroll/queue`

**Purpose**: Get all payroll items in processing queue

**Query Parameters**:
```
?status=pending_approval    // Filter by status
&period_year=2024          // Filter by year
&period_month=11           // Filter by month
&page=1
&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "id": "uuid",
        "period_month": 11,
        "period_year": 2024,
        "period_label": "November 2024",
        "employee_count": 125,
        "total_amount": 285000,
        "currency": "USD",
        "status": "pending_approval",
        "initiated_by": {
          "id": "user-uuid",
          "name": "Emily Rodriguez",
          "email": "accounts@company.com"
        },
        "initiated_at": "2024-11-15T10:00:00Z",
        "submitted_for_approval_at": "2024-11-15T10:05:00Z",
        "approval_id": "approval-uuid",
        "approval_status": "pending",
        "notes": "Regular monthly payroll"
      },
      {
        "id": "uuid-2",
        "period_label": "October 2024",
        "employee_count": 125,
        "total_amount": 278000,
        "status": "completed",
        "approved_at": "2024-10-16T09:30:00Z",
        "approved_by": {
          "id": "finance-user-uuid",
          "name": "Robert Chen"
        },
        "processed_at": "2024-10-17T08:00:00Z"
      }
    ],
    "summary": {
      "total": 12,
      "by_status": {
        "pending_approval": 1,
        "approved": 0,
        "completed": 11
      },
      "total_amount_pending": 285000
    },
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 1,
      "total_count": 12
    }
  }
}
```

---

#### POST `/api/accounts/expenses`

**Purpose**: Record a new expense

**Request Body**:
```json
{
  "date": "2024-11-18",                    // Required: ISO date
  "description": "Office Supplies",        // Required
  "amount": 1250.50,                       // Required
  "category": "Operating Expenses",        // Required
  "account_id": "expense-account-uuid",    // Required: Chart of accounts
  "vendor": "Office Depot",                // Optional
  "payment_method": "Corporate Card",      // Optional
  "reference_number": "PO-2024-123",       // Optional: PO or invoice number
  "receipt_url": "https://...",            // Optional: Receipt upload
  "notes": "Monthly office supplies",      // Optional
  "tags": ["office", "supplies"]           // Optional
}
```

**Auto-Approval Logic**:
```javascript
if (amount >= approval_threshold) {  // Default: $10,000
  requires_approval = true;
  status = 'pending_approval';
  create_financial_approval();
} else {
  requires_approval = false;
  status = 'recorded';
  create_journal_entry();
}
```

**Response (Auto-Approved)**:
```json
{
  "success": true,
  "message": "Expense recorded successfully",
  "data": {
    "expense_id": "expense-uuid",
    "requires_approval": false,
    "status": "recorded",
    "journal_entry_id": "je-uuid",
    "created_at": "2024-11-18T14:30:00Z"
  }
}
```

**Response (Requires Approval)**:
```json
{
  "success": true,
  "message": "Expense submitted for approval",
  "data": {
    "expense_id": "expense-uuid",
    "requires_approval": true,
    "status": "pending_approval",
    "approval_id": "approval-uuid",
    "approval_threshold": 10000,
    "created_at": "2024-11-18T14:30:00Z"
  }
}
```

---

### 4️⃣ Feature Configuration APIs

#### GET `/api/companies/:company_id/features`

**Purpose**: Get current feature configuration for a company

**Authentication**: Required (Admin role for own company, Super Admin for all)

**URL Parameters**:
```
:company_id - UUID of the company
```

**Response**:
```json
{
  "success": true,
  "data": {
    "company_id": "company-uuid",
    "company_name": "Tech Startup Inc",
    "industry_type": "Technology & Software",
    "features": {
      // Core HR Management
      "employee_management": true,
      "attendance_tracking": true,
      "leave_management": true,
      
      // Time & Project Management
      "timesheet_management": false,
      "project_management": true,
      "task_management": true,
      "kanban_boards": true,
      
      // Performance & Skills
      "performance_appraisal": false,
      "skills_management": true,
      
      // Financial Management
      "payroll_management": true,
      "invoice_management": false,
      "accounting_bookkeeping": true,
      "expense_tracking": true,
      
      // Sales & CRM
      "leads_management": false,
      
      // Reporting & Analytics
      "advanced_reports": true,
      "analytics_dashboard": false,
      
      // Document Management
      "document_management": true
    },
    "feature_summary": {
      "enabled_count": 11,
      "total_count": 17,
      "enabled_percentage": 64.7
    },
    "metadata": {
      "last_updated": "2024-11-18T10:00:00Z",
      "updated_by": {
        "id": "super-admin-uuid",
        "name": "Platform Admin"
      }
    }
  }
}
```

---

#### PUT/PATCH `/api/companies/:company_id/features`

**Purpose**: Update feature configuration for a company

**Authentication**: Required (Super Admin only)

**Request Body (Full Update - PUT)**:
```json
{
  "features": {
    "employee_management": true,
    "attendance_tracking": true,
    "leave_management": true,
    "timesheet_management": true,
    "project_management": true,
    "task_management": true,
    "kanban_boards": true,
    "performance_appraisal": true,
    "skills_management": true,
    "payroll_management": true,
    "invoice_management": true,
    "accounting_bookkeeping": true,
    "expense_tracking": true,
    "leads_management": false,
    "advanced_reports": true,
    "analytics_dashboard": true,
    "document_management": true
  }
}
```

**Request Body (Partial Update - PATCH)**:
```json
{
  "features": {
    "invoice_management": true,
    "accounting_bookkeeping": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Features updated successfully",
  "data": {
    "company_id": "company-uuid",
    "features": {
      /* complete updated feature set */
    },
    "enabled_count": 13,
    "total_count": 17,
    "changes": [
      {
        "feature": "invoice_management",
        "old_value": false,
        "new_value": true,
        "changed_at": "2024-11-18T14:30:00Z"
      },
      {
        "feature": "accounting_bookkeeping",
        "old_value": false,
        "new_value": true,
        "changed_at": "2024-11-18T14:30:00Z"
      }
    ],
    "updated_at": "2024-11-18T14:30:00Z",
    "updated_by": {
      "id": "super-admin-uuid",
      "name": "Platform Admin"
    }
  }
}
```

**Side Effects**:
1. Updates `company_features` record
2. Clears feature cache for company
3. Sends notification to company admins
4. Creates audit log entry
5. May trigger UI refresh for active users

**Validation**:
- Core HR features cannot be disabled (employee_management, attendance_tracking, leave_management)
- Plan-based restrictions apply
- Cannot enable features not available in company's plan

**Error Response**:
```json
{
  "success": false,
  "error": "Feature not available",
  "message": "Feature 'advanced_reports' is not available in the Basic plan",
  "code": "FEATURE_NOT_IN_PLAN",
  "details": {
    "feature": "advanced_reports",
    "current_plan": "basic",
    "required_plan": "professional"
  }
}
```

---

#### GET `/api/features/recommendations`

**Purpose**: Get recommended features based on industry and company profile

**Authentication**: Required (Super Admin)

**Query Parameters**:
```
?industry_type=Technology & Software     // Required
&company_size=medium                     // Optional: small, medium, large
&plan=professional                       // Optional: Plan tier
```

**Response**:
```json
{
  "success": true,
  "data": {
    "industry_type": "Technology & Software",
    "company_size": "medium",
    "plan": "professional",
    "recommended_features": [
      "employee_management",      // Always recommended
      "attendance_tracking",      // Always recommended
      "leave_management",         // Always recommended
      "project_management",       // Industry-specific
      "task_management",          // Industry-specific
      "kanban_boards",           // Industry-specific
      "timesheet_management",    // Industry-specific
      "skills_management",       // Industry-specific
      "payroll_management"       // Size-based
    ],
    "optional_features": [
      "invoice_management",
      "accounting_bookkeeping",
      "leads_management",
      "performance_appraisal",
      "expense_tracking",
      "advanced_reports",
      "analytics_dashboard",
      "document_management"
    ],
    "reasoning": {
      "project_management": "Essential for software development teams to track sprints and releases",
      "kanban_boards": "Common workflow visualization in tech companies using Agile methodology",
      "timesheet_management": "Important for tracking billable hours and project time allocation",
      "skills_management": "Track technical competencies and plan professional development"
    },
    "industry_insights": {
      "common_workflows": ["Agile/Scrum", "Sprint Planning", "Code Reviews"],
      "typical_team_size": "50-200 employees",
      "key_metrics": ["Velocity", "Burn Rate", "Sprint Completion"]
    }
  }
}
```

**Industry Recommendation Matrix**:

| Industry | Core Features | Additional Recommended |
|----------|---------------|------------------------|
| Technology & Software | Projects, Tasks, Kanban, Timesheets | Skills, Performance, Analytics |
| Consulting | Invoices, Projects, Timesheets, Accounting | Skills, Leads, Advanced Reports |
| Creative Agency | Projects, Kanban, Invoices | Leads, Document Management |
| Healthcare | Attendance, Leave, Document, Compliance | Performance, Skills |
| Manufacturing | Attendance, Timesheet, Projects | Expense Tracking, Analytics |

---

## 🔄 Workflow API Sequences

### Workflow 1: Complete Payroll Cycle

```
┌────────────────────────────────────────────────────────────┐
│                   Payroll Processing Flow                   │
└────────────────────────────────────────────────────────────┘

Step 1: Accounts Initiates Payroll
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST /api/accounts/payroll/initiate
{
  "period_month": 11,
  "period_year": 2024,
  "total_amount": 285000,
  "employee_count": 125
}
→ Creates payroll_queue (status: pending_approval)
→ Creates financial_approvals (status: pending)
→ Returns approval_id

Step 2: Finance Views Pending Approvals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/finance/approvals?status=pending&type=payroll
→ Returns list including new payroll approval

Step 3: Finance Approves
━━━━━━━━━━━━━━━━━━━━━━━━━
POST /api/finance/approvals/{approval_id}/approve
→ Updates approval (status: approved)
→ Updates payroll_queue (status: approved)
→ Triggers background job

Step 4: System Processes (Background Job)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Create payroll_runs for each employee
→ Generate payslips
→ Create journal entries
→ Update payroll_queue (status: completed)
→ Send notifications

Step 5: Accounts Checks Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/accounts/payroll/queue
→ Sees payroll status: completed
```

### Workflow 2: Expense Recording with Approval

```
┌────────────────────────────────────────────────────────────┐
│              Expense Approval Workflow                      │
└────────────────────────────────────────────────────────────┘

Step 1: Accounts Records Large Expense
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POST /api/accounts/expenses
{
  "amount": 45000,  // Above threshold
  "description": "Office Equipment",
  "category": "Capital Expenditure"
}
→ System detects amount > threshold
→ Creates expense (status: pending_approval)
→ Creates financial_approvals
→ Returns requires_approval: true

Step 2: Finance Reviews
━━━━━━━━━━━━━━━━━━━━━
GET /api/finance/approvals?type=expense
→ Sees pending expense approval

Step 3: Finance Approves
━━━━━━━━━━━━━━━━━━━━━━
POST /api/finance/approvals/{approval_id}/approve
→ Updates approval (status: approved)
→ Updates expense (status: approved)
→ Creates journal entry
→ Updates financial metrics
```

### Workflow 3: Company Creation with Features

```
┌────────────────────────────────────────────────────────────┐
│            Company Setup with Features                      │
└────────────────────────────────────────────────────────────┘

Step 1: Get Recommendations
━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/features/recommendations?industry_type=Technology
→ Returns recommended features for tech industry

Step 2: Create Company
━━━━━━━━━━━━━━━━━━━━━
POST /api/companies
{
  "name": "Tech Startup Inc",
  "industry_type": "Technology & Software",
  "plan": "professional",
  "features": {
    "project_management": true,
    "kanban_boards": true,
    "timesheet_management": true
    // ... more features
  }
}
→ Creates company record
→ Creates company_features record
→ Returns complete company object

Step 3: User Logs In
━━━━━━━━━━━━━━━━━━
POST /api/auth/login
→ Returns user with company_id

Step 4: Frontend Fetches Features
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GET /api/companies/{company_id}/features
→ Returns enabled features
→ Frontend shows/hides navigation based on features
```

---

## 📊 Database Schema Quick Reference

### New Tables

#### 1. `company_features`
```
Columns: 21
Primary Key: id (UUID)
Foreign Keys: company_id → companies(id)
Unique: company_id
Purpose: Store feature flags per company
```

#### 2. `financial_approvals`
```
Columns: 16
Primary Key: id (UUID)
Foreign Keys: company_id → companies(id)
             requested_by → users(id)
             approved_by → users(id)
Indexes: company_id, status, approval_type, requested_by
Purpose: Track items requiring Finance approval
```

#### 3. `payroll_queue`
```
Columns: 14
Primary Key: id (UUID)
Foreign Keys: company_id → companies(id)
             initiated_by → users(id)
             approved_by → users(id)
             journal_entry_id → journal_entries(id)
Unique: (company_id, period_month, period_year)
Purpose: Manage payroll processing workflow
```

#### 4. `financial_metrics`
```
Columns: 18
Primary Key: id (UUID)
Foreign Keys: company_id → companies(id)
Unique: (company_id, metric_date, period_type)
Purpose: Cache computed financial metrics
```

### Modified Tables

#### 1. `companies`
```
New Columns:
  - industry_type VARCHAR(100)
  - industry_category VARCHAR(50)
```

#### 2. `users`
```
Modified:
  - role enum: Added 'finance', 'accounts'
```

#### 3. `payroll_runs`
```
New Columns:
  - approval_id UUID
  - approval_status VARCHAR(20)
  - submitted_for_approval_at TIMESTAMP
  - approved_at TIMESTAMP
  - approved_by UUID
```

#### 4. `expenses`
```
New Columns:
  - requires_approval BOOLEAN
  - approval_id UUID
  - approval_threshold DECIMAL(10,2)
```

---

## 🔐 Authentication & Authorization

### JWT Token Requirements

**Token Payload**:
```json
{
  "user_id": "uuid",
  "email": "finance@company.com",
  "role": "finance",
  "company_id": "company-uuid",
  "permissions": ["approve_payroll", "view_financials"],
  "exp": 1700000000
}
```

### Permission Checks

```javascript
// Backend middleware example
function requirePermissions(requiredPermissions) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions;
    
    const hasPermission = requiredPermissions.every(
      perm => userPermissions.includes(perm)
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
}

// Usage
app.post('/api/finance/approvals/:id/approve',
  authenticate,
  requirePermissions(['approve_payroll', 'approve_expenses']),
  approveHandler
);
```

### Role-Based Permissions

| Permission | Employee | Manager | HR | Admin | Finance | Accounts |
|-----------|----------|---------|----|----|---------|----------|
| `view_financials` | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `approve_payroll` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `approve_expenses` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `create_invoices` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `process_payroll` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `record_expenses` | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `configure_features` | ❌ | ❌ | ❌ | Super Admin | ❌ | ❌ |

---

## 📈 Performance Specifications

### Response Time SLAs

| Endpoint | Target (p50) | Max (p95) | Strategy |
|----------|-------------|-----------|----------|
| GET /api/finance/dashboard | 200ms | 500ms | Cache metrics, real-time approvals |
| GET /api/finance/approvals | 150ms | 300ms | Indexed queries |
| POST /api/finance/approvals/:id/approve | 300ms | 800ms | Background job for processing |
| GET /api/accounts/dashboard | 200ms | 500ms | Cache metrics |
| POST /api/accounts/payroll/initiate | 250ms | 600ms | Async approval creation |
| GET /api/companies/:id/features | 50ms | 100ms | Redis cache (1 hour TTL) |
| PUT /api/companies/:id/features | 200ms | 500ms | Cache invalidation |

### Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                   Cache Layers                           │
└─────────────────────────────────────────────────────────┘

L1: Application Cache (In-Memory)
    - Feature flags: 5 minutes
    - User permissions: 10 minutes

L2: Redis Cache
    - Financial metrics: 15 minutes
    - Dashboard summary: 5 minutes
    - Company features: 1 hour

L3: Database (PostgreSQL)
    - Materialized views refreshed hourly
    - Pre-computed financial_metrics table
```

### Database Indexes

```sql
-- Critical indexes for new tables

-- financial_approvals
CREATE INDEX idx_fa_company_status ON financial_approvals(company_id, status);
CREATE INDEX idx_fa_type_status ON financial_approvals(approval_type, status);
CREATE INDEX idx_fa_requested_at ON financial_approvals(requested_at DESC);

-- payroll_queue
CREATE INDEX idx_pq_company_status ON payroll_queue(company_id, status);
CREATE INDEX idx_pq_period ON payroll_queue(period_year DESC, period_month DESC);

-- financial_metrics
CREATE INDEX idx_fm_company_date ON financial_metrics(company_id, metric_date DESC);
CREATE INDEX idx_fm_period_type ON financial_metrics(period_type, metric_date DESC);
```

---

## 🧪 Testing Guide

### Sample API Test Suite

```javascript
describe('Finance Dashboard API', () => {
  let financeToken, accountsToken;
  
  beforeAll(async () => {
    financeToken = await login('finance@company.com', 'password');
    accountsToken = await login('accounts@company.com', 'password');
  });
  
  test('Finance user can access dashboard', async () => {
    const response = await request(app)
      .get('/api/finance/dashboard')
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('metrics');
    expect(response.body.data).toHaveProperty('pending_approvals');
  });
  
  test('Accounts user cannot access Finance dashboard', async () => {
    await request(app)
      .get('/api/finance/dashboard')
      .set('Authorization', `Bearer ${accountsToken}`)
      .expect(403);
  });
  
  test('Can approve payroll', async () => {
    // 1. Create approval
    const payroll = await initiatePayroll(accountsToken);
    
    // 2. Approve
    const response = await request(app)
      .post(`/api/finance/approvals/${payroll.approval_id}/approve`)
      .set('Authorization', `Bearer ${financeToken}`)
      .expect(200);
    
    expect(response.body.data.status).toBe('approved');
  });
});
```

### Postman Collection

```json
{
  "info": {
    "name": "Finance & Accounts APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Finance Dashboard",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{finance_token}}"
          },
          {
            "key": "X-Company-ID",
            "value": "{{company_id}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/finance/dashboard?period=month",
          "host": ["{{base_url}}"],
          "path": ["api", "finance", "dashboard"],
          "query": [
            {
              "key": "period",
              "value": "month"
            }
          ]
        }
      }
    }
  ]
}
```

---

## 🚨 Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  },
  "timestamp": "2024-11-18T14:30:00Z",
  "request_id": "req-uuid"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_PAYROLL` | 409 | Payroll already exists for period |
| `INVALID_APPROVAL_STATUS` | 400 | Cannot approve already processed item |
| `FEATURE_NOT_ENABLED` | 403 | Feature not enabled for company |
| `FEATURE_NOT_IN_PLAN` | 403 | Feature not available in current plan |
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `THRESHOLD_EXCEEDED` | 422 | Amount exceeds approval limit |

---

## 📚 Integration Examples

### Frontend Integration

```typescript
// Finance Dashboard Service
class FinanceService {
  async getDashboard(period = 'month') {
    const response = await api.get('/api/finance/dashboard', {
      params: { period }
    });
    return response.data;
  }
  
  async getPendingApprovals() {
    const response = await api.get('/api/finance/approvals', {
      params: { status: 'pending' }
    });
    return response.data.approvals;
  }
  
  async approveItem(approvalId: string, notes?: string) {
    const response = await api.post(
      `/api/finance/approvals/${approvalId}/approve`,
      { notes }
    );
    return response.data;
  }
}

// Usage in React component
const FinanceDashboard = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      const service = new FinanceService();
      const dashboard = await service.getDashboard();
      setData(dashboard.data);
    };
    loadData();
  }, []);
  
  // Render dashboard...
};
```

---

## 🔗 Related Endpoints

### Existing APIs Enhanced

These existing endpoints from `/BACKEND_SPECIFICATION.md` now integrate with the new approval system:

| Endpoint | Change |
|----------|--------|
| `POST /api/payroll/runs` | Now creates approval if initiated by Accounts |
| `GET /api/invoices` | Now respects `invoice_management` feature flag |
| `GET /api/accounting/ledger` | Now respects `accounting_bookkeeping` feature flag |
| `GET /api/reports/financial` | Now includes approval metrics |

---

## 📊 API Usage Statistics

### Expected Load (per company)

| Endpoint | Requests/Day | Peak TPS |
|----------|--------------|----------|
| GET /api/finance/dashboard | 50 | 0.01 |
| GET /api/finance/approvals | 100 | 0.02 |
| POST /api/finance/approvals/:id/approve | 5 | 0.001 |
| GET /api/accounts/dashboard | 80 | 0.015 |
| POST /api/accounts/payroll/initiate | 1 | 0.0001 |
| GET /api/companies/:id/features | 20 | 0.005 |

### Scaling Recommendations

- **Database**: PostgreSQL with read replicas for dashboard queries
- **Cache**: Redis cluster for feature flags and metrics
- **Background Jobs**: Sidekiq/Bull for payroll processing
- **CDN**: CloudFlare for static assets
- **Rate Limiting**: 100 requests/minute per user

---

## 🎯 API Versioning

All new endpoints use version 1:

```
Base URL: https://api.hrpm.com/v1
```

Future breaking changes will increment version:

```
v2: https://api.hrpm.com/v2/finance/dashboard
```

---

## 📖 Quick Start for Developers

### 1. Setup Development Environment

```bash
# Clone repo
git clone https://github.com/company/hrpm-api.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run migrations
npm run migrate:latest

# Seed data (includes Finance/Accounts users)
npm run seed:run

# Start dev server
npm run dev
```

### 2. Test with Curl

```bash
# Login as Finance user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "finance@company.com",
    "password": "password"
  }'

# Get Finance dashboard
curl -X GET http://localhost:3000/api/finance/dashboard \
  -H "Authorization: Bearer {token}" \
  -H "X-Company-ID: {company_uuid}"
```

### 3. Import Postman Collection

```bash
# Download collection
curl -o finance-apis.json \
  https://api.hrpm.com/docs/postman/finance-collection.json

# Import to Postman
# File → Import → finance-apis.json
```

---

## 📋 Summary

### API Statistics

- **New Endpoints**: 12 core endpoints
- **Total with variations**: 25+ endpoints
- **New Database Tables**: 4
- **Modified Tables**: 4
- **Estimated Development Time**: 3-4 weeks
- **Lines of Backend Code**: ~2,500 lines

### Key Features

1. ✅ Complete Finance dashboard with approval workflows
2. ✅ Accounts dashboard for operational tasks
3. ✅ Payroll processing with approval chain
4. ✅ Expense recording with auto/manual approval
5. ✅ Feature configuration system (17 features)
6. ✅ Industry-based recommendations (12 industries)
7. ✅ Role-based access control (2 new roles)
8. ✅ Performance optimization (caching, indexes)

### Next Steps

1. Implement backend APIs following this spec
2. Write unit and integration tests
3. Deploy to staging environment
4. Load test critical endpoints
5. Deploy to production
6. Monitor and optimize

---

**Document Version**: 1.0  
**Last Updated**: November 18, 2024  
**Maintained By**: Backend Team  
**Related Docs**: `/BACKEND_SPECIFICATION.md`, `/BACKEND_IMPLEMENTATION_SUMMARY.md`

---

End of API Summary
