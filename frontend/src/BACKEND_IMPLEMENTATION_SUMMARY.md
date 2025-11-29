# Backend Implementation Summary - Today's Features
**Date**: November 18, 2024

---

## 🎯 Overview

This document outlines the backend implementation requirements for the three major features added today:

1. **Finance Dashboard** - Financial oversight and approval workflows
2. **Accounts Dashboard** - Invoice/payroll processing workflows
3. **Feature Configuration System** - Modular feature management per company

---

## 📊 Database Schema Changes

### 1. New Tables Required

#### `company_features` Table
Stores feature configuration for each company.

```sql
CREATE TABLE company_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Core HR Management
    employee_management BOOLEAN DEFAULT TRUE,
    attendance_tracking BOOLEAN DEFAULT TRUE,
    leave_management BOOLEAN DEFAULT TRUE,
    
    -- Time & Project Management
    timesheet_management BOOLEAN DEFAULT FALSE,
    project_management BOOLEAN DEFAULT FALSE,
    task_management BOOLEAN DEFAULT FALSE,
    kanban_boards BOOLEAN DEFAULT FALSE,
    
    -- Performance & Skills
    performance_appraisal BOOLEAN DEFAULT FALSE,
    skills_management BOOLEAN DEFAULT FALSE,
    
    -- Financial Management
    payroll_management BOOLEAN DEFAULT FALSE,
    invoice_management BOOLEAN DEFAULT FALSE,
    accounting_bookkeeping BOOLEAN DEFAULT FALSE,
    expense_tracking BOOLEAN DEFAULT FALSE,
    
    -- Sales & CRM
    leads_management BOOLEAN DEFAULT FALSE,
    
    -- Reporting & Analytics
    advanced_reports BOOLEAN DEFAULT FALSE,
    analytics_dashboard BOOLEAN DEFAULT FALSE,
    
    -- Document Management
    document_management BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(company_id)
);

CREATE INDEX idx_company_features_company ON company_features(company_id);
```

#### `financial_approvals` Table
Tracks items requiring Finance approval.

```sql
CREATE TABLE financial_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Approval Details
    approval_type VARCHAR(50) NOT NULL, -- 'payroll', 'expense', 'refund', 'invoice', 'budget'
    reference_id UUID, -- Links to payroll_runs, expenses, invoices, etc.
    reference_number VARCHAR(50), -- Display reference (e.g., 'INV-2024-001')
    
    -- Financial Data
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    category VARCHAR(100), -- 'Payroll', 'Equipment', 'Refund', etc.
    
    -- Status & Workflow
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Approval Tracking
    requested_by UUID REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_financial_approvals_company ON financial_approvals(company_id);
CREATE INDEX idx_financial_approvals_status ON financial_approvals(status);
CREATE INDEX idx_financial_approvals_type ON financial_approvals(approval_type);
CREATE INDEX idx_financial_approvals_requested_by ON financial_approvals(requested_by);
```

#### `payroll_queue` Table
Manages payroll processing workflow.

```sql
CREATE TABLE payroll_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Payroll Period
    period_month INTEGER NOT NULL, -- 1-12
    period_year INTEGER NOT NULL,
    period_label VARCHAR(50), -- 'November 2024'
    
    -- Payroll Data
    employee_count INTEGER NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Processing Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending_approval', 'approved', 'processing', 'completed', 'failed'
    
    -- Workflow Tracking
    initiated_by UUID REFERENCES users(id), -- Accounts user
    initiated_at TIMESTAMP WITH TIME ZONE,
    submitted_for_approval_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id), -- Finance user
    approved_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Accounting Reference
    journal_entry_id UUID REFERENCES journal_entries(id),
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_month CHECK (period_month BETWEEN 1 AND 12),
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_approval', 'approved', 'processing', 'completed', 'failed')),
    UNIQUE(company_id, period_month, period_year)
);

CREATE INDEX idx_payroll_queue_company ON payroll_queue(company_id);
CREATE INDEX idx_payroll_queue_status ON payroll_queue(status);
CREATE INDEX idx_payroll_queue_period ON payroll_queue(period_year, period_month);
```

#### `financial_metrics` Table
Caches computed financial metrics for dashboard performance.

```sql
CREATE TABLE financial_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Time Period
    metric_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    
    -- Revenue Metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    revenue_growth_percent DECIMAL(5,2),
    
    -- Expense Metrics
    total_expenses DECIMAL(15,2) DEFAULT 0,
    expense_growth_percent DECIMAL(5,2),
    
    -- Profitability
    net_income DECIMAL(15,2) DEFAULT 0,
    profit_margin_percent DECIMAL(5,2),
    
    -- Cash Flow
    cash_balance DECIMAL(15,2) DEFAULT 0,
    accounts_receivable DECIMAL(15,2) DEFAULT 0,
    accounts_payable DECIMAL(15,2) DEFAULT 0,
    working_capital DECIMAL(15,2) DEFAULT 0,
    
    -- Invoice Metrics
    invoices_sent INTEGER DEFAULT 0,
    invoices_paid INTEGER DEFAULT 0,
    invoices_overdue INTEGER DEFAULT 0,
    total_collected DECIMAL(15,2) DEFAULT 0,
    pending_collection DECIMAL(15,2) DEFAULT 0,
    
    -- Payroll Metrics
    payroll_runs_count INTEGER DEFAULT 0,
    total_payroll_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Metadata
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, metric_date, period_type)
);

CREATE INDEX idx_financial_metrics_company ON financial_metrics(company_id);
CREATE INDEX idx_financial_metrics_date ON financial_metrics(metric_date);
CREATE INDEX idx_financial_metrics_period ON financial_metrics(period_type);
```

### 2. Table Modifications

#### Update `companies` Table
Add industry type field.

```sql
ALTER TABLE companies 
ADD COLUMN industry_type VARCHAR(100),
ADD COLUMN industry_category VARCHAR(50); -- 'technology', 'consulting', 'creative', etc.

CREATE INDEX idx_companies_industry ON companies(industry_type);
```

#### Update `users` Table
Ensure role enum includes new roles.

```sql
-- If using enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'finance';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accounts';

-- If using varchar with check constraint, update it:
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('employee', 'manager', 'hr', 'admin', 'finance', 'accounts'));
```

#### Update `payroll_runs` Table
Link to approval workflow.

```sql
ALTER TABLE payroll_runs
ADD COLUMN approval_id UUID REFERENCES financial_approvals(id),
ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN submitted_for_approval_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES users(id);
```

#### Update `expenses` Table
Link to approval workflow for large expenses.

```sql
ALTER TABLE expenses
ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE,
ADD COLUMN approval_id UUID REFERENCES financial_approvals(id),
ADD COLUMN approval_threshold DECIMAL(10,2) DEFAULT 10000.00;

-- Trigger to set requires_approval
CREATE OR REPLACE FUNCTION check_expense_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount >= NEW.approval_threshold THEN
        NEW.requires_approval = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expense_approval_check
    BEFORE INSERT OR UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION check_expense_approval();
```

---

## 🔌 New API Endpoints

### Finance Dashboard APIs

#### 1. Get Finance Dashboard Summary
```http
GET /api/finance/dashboard
```

**Headers:**
```
Authorization: Bearer {token}
X-Company-ID: {company_id}
```

**Query Parameters:**
- `period` (optional): `month`, `quarter`, `year` (default: `month`)
- `start_date` (optional): ISO date
- `end_date` (optional): ISO date

**Response:**
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
      "items": [
        {
          "id": "uuid-1",
          "type": "payroll",
          "reference": "November 2024 Payroll",
          "amount": 285000,
          "status": "pending",
          "requested_by": "Emily Rodriguez",
          "requested_at": "2024-11-15T10:00:00Z",
          "priority": "high"
        }
      ]
    },
    "recent_transactions": [
      {
        "id": "uuid-1",
        "date": "2024-11-15",
        "description": "Client Payment - Acme Corp",
        "amount": 45000,
        "type": "income",
        "account": "Accounts Receivable"
      }
    ],
    "outstanding_invoices": [
      {
        "id": "uuid-1",
        "invoice_number": "INV-2024-003",
        "client": "Global Enterprises",
        "amount": 70800,
        "due_date": "2024-10-30",
        "days_overdue": 19,
        "status": "overdue"
      }
    ]
  }
}
```

#### 2. Get Pending Approvals
```http
GET /api/finance/approvals
```

**Query Parameters:**
- `status` (optional): `pending`, `approved`, `rejected`
- `type` (optional): `payroll`, `expense`, `refund`, `invoice`
- `page` (optional): default 1
- `limit` (optional): default 20

**Response:**
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": "uuid-1",
        "type": "payroll",
        "reference_id": "uuid-payroll-1",
        "reference_number": "November 2024",
        "amount": 285000,
        "currency": "USD",
        "description": "Monthly payroll for 125 employees",
        "category": "Payroll",
        "status": "pending",
        "priority": "high",
        "requested_by": {
          "id": "uuid-user-1",
          "name": "Emily Rodriguez",
          "role": "accounts"
        },
        "requested_at": "2024-11-15T10:00:00Z"
      }
    ],
    "total": 3,
    "total_amount": 342000,
    "page": 1,
    "limit": 20
  }
}
```

#### 3. Approve/Reject Financial Item
```http
POST /api/finance/approvals/:approval_id/approve
POST /api/finance/approvals/:approval_id/reject
```

**Request Body (Reject):**
```json
{
  "rejection_reason": "Insufficient budget allocation for this period"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Approval processed successfully",
  "data": {
    "approval_id": "uuid-1",
    "status": "approved",
    "approved_by": "uuid-finance-user",
    "approved_at": "2024-11-18T14:30:00Z",
    "reference_updated": true
  }
}
```

#### 4. Get Financial Metrics
```http
GET /api/finance/metrics
```

**Query Parameters:**
- `period`: `month`, `quarter`, `year`
- `start_date`: ISO date
- `end_date`: ISO date
- `granularity`: `daily`, `weekly`, `monthly`

**Response:**
```json
{
  "success": true,
  "data": {
    "current_period": {
      "revenue": 450000,
      "expenses": 280000,
      "net_income": 170000,
      "profit_margin": 37.8
    },
    "previous_period": {
      "revenue": 400000,
      "expenses": 258000,
      "net_income": 142000,
      "profit_margin": 35.5
    },
    "growth": {
      "revenue": 12.5,
      "expenses": 8.3,
      "net_income": 19.7,
      "profit_margin": 2.3
    },
    "trend": [
      {
        "date": "2024-10-01",
        "revenue": 150000,
        "expenses": 95000
      }
    ]
  }
}
```

---

### Accounts Dashboard APIs

#### 5. Get Accounts Dashboard Summary
```http
GET /api/accounts/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "invoices_sent": 42,
      "invoices_paid": 35,
      "total_collected": 675000,
      "pending_collection": 175000,
      "collection_rate": 79.4,
      "payroll_processed": 12
    },
    "monthly_activity": {
      "invoices_created": 12,
      "payments_received": 8,
      "payroll_runs": 1,
      "expenses_recorded": 24
    },
    "recent_invoices": [
      {
        "id": "uuid-1",
        "invoice_number": "INV-2024-005",
        "client": "Acme Corp",
        "amount": 45000,
        "status": "sent",
        "issue_date": "2024-11-10",
        "due_date": "2024-12-10"
      }
    ],
    "payroll_queue": [
      {
        "id": "uuid-1",
        "period": "November 2024",
        "employee_count": 125,
        "total_amount": 285000,
        "status": "pending_approval",
        "initiated_at": "2024-11-15T10:00:00Z"
      }
    ],
    "recent_expenses": [
      {
        "id": "uuid-1",
        "date": "2024-11-15",
        "description": "Office Equipment",
        "amount": 2500,
        "category": "Operating Expenses",
        "status": "recorded"
      }
    ]
  }
}
```

#### 6. Initiate Payroll
```http
POST /api/accounts/payroll/initiate
```

**Request Body:**
```json
{
  "period_month": 11,
  "period_year": 2024,
  "period_label": "November 2024",
  "employee_count": 125,
  "total_amount": 285000,
  "currency": "USD",
  "notes": "Regular monthly payroll"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payroll initiated successfully",
  "data": {
    "payroll_id": "uuid-1",
    "approval_id": "uuid-approval-1",
    "status": "pending_approval",
    "submitted_for_approval_at": "2024-11-18T14:30:00Z"
  }
}
```

#### 7. Get Payroll Queue
```http
GET /api/accounts/payroll/queue
```

**Query Parameters:**
- `status`: `draft`, `pending_approval`, `approved`, `processing`, `completed`
- `page`: default 1
- `limit`: default 20

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "id": "uuid-1",
        "period_month": 11,
        "period_year": 2024,
        "period_label": "November 2024",
        "employee_count": 125,
        "total_amount": 285000,
        "status": "pending_approval",
        "initiated_by": {
          "id": "uuid-accounts",
          "name": "Emily Rodriguez"
        },
        "initiated_at": "2024-11-15T10:00:00Z",
        "approval_id": "uuid-approval-1"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 20
  }
}
```

#### 8. Record Expense
```http
POST /api/accounts/expenses
```

**Request Body:**
```json
{
  "date": "2024-11-18",
  "description": "Office Supplies",
  "amount": 1250.50,
  "category": "Operating Expenses",
  "account_id": "uuid-expense-account",
  "vendor": "Office Depot",
  "payment_method": "Corporate Card",
  "receipt_url": "https://...",
  "notes": "Monthly office supplies"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Expense recorded successfully",
  "data": {
    "expense_id": "uuid-1",
    "requires_approval": false,
    "journal_entry_id": "uuid-je-1",
    "created_at": "2024-11-18T14:30:00Z"
  }
}
```

---

### Feature Configuration APIs

#### 9. Get Company Features
```http
GET /api/companies/:company_id/features
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company_id": "uuid-1",
    "features": {
      "employee_management": true,
      "attendance_tracking": true,
      "leave_management": true,
      "timesheet_management": false,
      "project_management": true,
      "task_management": true,
      "kanban_boards": true,
      "performance_appraisal": false,
      "skills_management": true,
      "payroll_management": true,
      "invoice_management": false,
      "accounting_bookkeeping": true,
      "expense_tracking": true,
      "leads_management": false,
      "advanced_reports": true,
      "analytics_dashboard": false,
      "document_management": true
    },
    "enabled_count": 11,
    "total_count": 17,
    "last_updated": "2024-11-18T10:00:00Z"
  }
}
```

#### 10. Update Company Features
```http
PUT /api/companies/:company_id/features
PATCH /api/companies/:company_id/features
```

**Request Body:**
```json
{
  "features": {
    "project_management": true,
    "task_management": true,
    "kanban_boards": true,
    "invoice_management": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Features updated successfully",
  "data": {
    "company_id": "uuid-1",
    "features": { /* updated features */ },
    "enabled_count": 12,
    "changes": [
      {
        "feature": "invoice_management",
        "old_value": false,
        "new_value": true
      }
    ],
    "updated_at": "2024-11-18T14:30:00Z"
  }
}
```

#### 11. Get Feature Recommendations
```http
GET /api/features/recommendations
```

**Query Parameters:**
- `industry_type`: Industry name
- `company_size`: `small`, `medium`, `large`
- `plan`: `free`, `basic`, `professional`, `enterprise`

**Response:**
```json
{
  "success": true,
  "data": {
    "industry_type": "Technology & Software",
    "recommended_features": [
      "employee_management",
      "attendance_tracking",
      "leave_management",
      "project_management",
      "task_management",
      "kanban_boards",
      "timesheet_management",
      "skills_management",
      "payroll_management"
    ],
    "optional_features": [
      "invoice_management",
      "accounting_bookkeeping",
      "leads_management"
    ],
    "reasoning": {
      "project_management": "Essential for software development teams",
      "kanban_boards": "Common workflow in tech companies",
      "skills_management": "Track technical competencies"
    }
  }
}
```

#### 12. Create Company with Features
```http
POST /api/companies
```

**Request Body:**
```json
{
  "name": "Tech Startup Inc",
  "slug": "tech-startup",
  "industry_type": "Technology & Software",
  "industry_category": "technology",
  "plan": "professional",
  "timezone": "America/New_York",
  "features": {
    "employee_management": true,
    "project_management": true,
    "task_management": true,
    "kanban_boards": true,
    "timesheet_management": true,
    "payroll_management": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "company": {
      "id": "uuid-1",
      "name": "Tech Startup Inc",
      "slug": "tech-startup",
      "industry_type": "Technology & Software",
      "plan": "professional"
    },
    "features": {
      "enabled_count": 6,
      "features": { /* feature config */ }
    },
    "created_at": "2024-11-18T14:30:00Z"
  }
}
```

---

## 🔐 Authorization & Permissions

### Role-Based Permissions Matrix

| Endpoint | Employee | Manager | HR | Admin | Finance | Accounts |
|----------|----------|---------|----|----|---------|----------|
| `GET /api/finance/dashboard` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `GET /api/finance/approvals` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `POST /api/finance/approvals/:id/approve` | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| `GET /api/finance/metrics` | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /api/accounts/dashboard` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /api/accounts/payroll/initiate` | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `GET /api/accounts/payroll/queue` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /api/accounts/expenses` | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /api/companies/:id/features` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `PUT /api/companies/:id/features` | ❌ | ❌ | ❌ | Super Admin | ❌ | ❌ |

### Middleware Requirements

```javascript
// Example: Finance-only middleware
const requireFinanceRole = (req, res, next) => {
  const user = req.user;
  
  if (!user || !['finance', 'admin'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions. Finance role required.'
    });
  }
  
  next();
};

// Example: Feature-based access control
const requireFeature = (feature) => {
  return async (req, res, next) => {
    const companyId = req.headers['x-company-id'];
    const features = await getCompanyFeatures(companyId);
    
    if (!features[feature]) {
      return res.status(403).json({
        success: false,
        error: `Feature '${feature}' is not enabled for this company`
      });
    }
    
    next();
  };
};

// Usage
app.get('/api/finance/dashboard', 
  authenticate, 
  requireFinanceRole, 
  getFinanceDashboard
);

app.get('/api/invoices', 
  authenticate, 
  requireFeature('invoice_management'),
  getInvoices
);
```

---

## 🔄 Business Logic & Workflows

### 1. Payroll Processing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    Payroll Processing Flow                   │
└─────────────────────────────────────────────────────────────┘

1. INITIATE (Accounts Role)
   ├─ POST /api/accounts/payroll/initiate
   ├─ Create payroll_queue record (status: draft)
   ├─ Calculate totals
   └─ Submit for approval

2. CREATE APPROVAL (System)
   ├─ Create financial_approvals record
   ├─ Link to payroll_queue
   ├─ Set status: pending
   └─ Notify Finance team

3. APPROVE (Finance Role)
   ├─ POST /api/finance/approvals/:id/approve
   ├─ Update approval status: approved
   ├─ Update payroll_queue status: approved
   └─ Trigger processing

4. PROCESS (System Background Job)
   ├─ Create payroll_runs for each employee
   ├─ Generate payslips
   ├─ Create journal entries (debit: Salary Expense, credit: Payable)
   ├─ Update payroll_queue status: completed
   └─ Send notifications

5. PAYMENT (Integration)
   ├─ Export payment file
   ├─ Send to payment processor
   ├─ Update payment status
   └─ Create journal entry (debit: Payable, credit: Cash)
```

### 2. Expense Approval Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   Expense Approval Logic                     │
└─────────────────────────────────────────────────────────────┘

Record Expense:
├─ IF amount < threshold (e.g., $10,000)
│  ├─ Auto-approve
│  ├─ Create journal entry immediately
│  └─ No approval required
│
└─ IF amount >= threshold
   ├─ Set requires_approval = true
   ├─ Create financial_approvals record
   ├─ Status: pending
   ├─ Await Finance approval
   └─ On approval: Create journal entry
```

### 3. Feature Configuration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│               Feature Configuration Process                  │
└─────────────────────────────────────────────────────────────┘

1. SELECT INDUSTRY
   ├─ Frontend: User selects industry type
   ├─ GET /api/features/recommendations?industry_type=Technology
   └─ Return recommended features

2. CONFIGURE FEATURES
   ├─ Frontend: Toggle features on/off
   ├─ Show progress (X of 17 enabled)
   └─ Validate configuration

3. CREATE COMPANY
   ├─ POST /api/companies (with features object)
   ├─ Create company record
   ├─ Create company_features record
   └─ Return success

4. APPLY FEATURES
   ├─ Middleware checks enabled features
   ├─ Hide/show navigation items
   ├─ Block access to disabled features
   └─ Return 403 if feature disabled
```

---

## 📊 Performance Considerations

### 1. Financial Metrics Caching

```sql
-- Scheduled job runs hourly/daily to pre-calculate metrics
INSERT INTO financial_metrics (
    company_id,
    metric_date,
    period_type,
    total_revenue,
    total_expenses,
    net_income,
    profit_margin_percent,
    cash_balance
)
SELECT
    company_id,
    CURRENT_DATE,
    'daily',
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END),
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END),
    (SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) / 
     NULLIF(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) * 100),
    (SELECT balance FROM accounts WHERE account_type = 'asset' AND name = 'Cash')
FROM transactions
WHERE DATE(transaction_date) = CURRENT_DATE
GROUP BY company_id
ON CONFLICT (company_id, metric_date, period_type)
DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_expenses = EXCLUDED.total_expenses,
    calculated_at = NOW();
```

### 2. Approval Count Optimization

```sql
-- Materialized view for quick approval counts
CREATE MATERIALIZED VIEW finance_approval_summary AS
SELECT
    company_id,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    SUM(amount) FILTER (WHERE status = 'pending') as pending_amount,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    MAX(requested_at) FILTER (WHERE status = 'pending') as latest_request
FROM financial_approvals
GROUP BY company_id;

CREATE UNIQUE INDEX ON finance_approval_summary(company_id);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY finance_approval_summary;
```

### 3. Feature Flag Caching

```javascript
// Redis cache for company features (TTL: 1 hour)
const getCompanyFeatures = async (companyId) => {
  const cacheKey = `company:${companyId}:features`;
  
  // Try cache first
  let features = await redis.get(cacheKey);
  if (features) {
    return JSON.parse(features);
  }
  
  // Fetch from database
  features = await db.query(
    'SELECT * FROM company_features WHERE company_id = $1',
    [companyId]
  );
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(features));
  
  return features;
};
```

---

## 🔔 Notification Requirements

### 1. Approval Request Notifications

```javascript
// When payroll submitted for approval
{
  type: 'approval_request',
  recipients: ['finance@company.com'], // All Finance role users
  subject: 'Payroll Approval Required - November 2024',
  template: 'approval_request',
  data: {
    approval_type: 'payroll',
    amount: 285000,
    requested_by: 'Emily Rodriguez',
    period: 'November 2024',
    employee_count: 125,
    approval_link: '/finance/approvals/uuid-1'
  },
  priority: 'high'
}
```

### 2. Approval Decision Notifications

```javascript
// When approval approved/rejected
{
  type: 'approval_decision',
  recipients: ['accounts@company.com'], // Original requester
  subject: 'Payroll Approved - November 2024',
  template: 'approval_approved',
  data: {
    approval_type: 'payroll',
    status: 'approved',
    approved_by: 'Robert Chen',
    approved_at: '2024-11-18T14:30:00Z',
    next_steps: 'Payroll is now being processed'
  }
}
```

### 3. Feature Configuration Notifications

```javascript
// When features updated
{
  type: 'features_updated',
  recipients: ['admin@company.com'], // Company admins
  subject: 'Company Features Updated',
  template: 'features_changed',
  data: {
    changes: [
      { feature: 'invoice_management', enabled: true },
      { feature: 'accounting_bookkeeping', enabled: true }
    ],
    updated_by: 'Super Admin',
    updated_at: '2024-11-18T14:30:00Z'
  }
}
```

---

## 🧪 Testing Requirements

### Unit Tests

```javascript
describe('Finance Approval API', () => {
  test('should create approval when payroll initiated', async () => {
    const payroll = await initiatePayroll({
      period_month: 11,
      period_year: 2024,
      total_amount: 285000
    });
    
    expect(payroll.approval_id).toBeDefined();
    
    const approval = await getApproval(payroll.approval_id);
    expect(approval.status).toBe('pending');
    expect(approval.amount).toBe(285000);
  });
  
  test('should update payroll status when approved', async () => {
    const approval = await createApproval({
      type: 'payroll',
      amount: 285000
    });
    
    await approveApproval(approval.id, financeUser);
    
    const updated = await getApproval(approval.id);
    expect(updated.status).toBe('approved');
    expect(updated.approved_by).toBe(financeUser.id);
  });
});

describe('Feature Configuration API', () => {
  test('should return recommendations based on industry', async () => {
    const recommendations = await getFeatureRecommendations({
      industry_type: 'Technology & Software'
    });
    
    expect(recommendations.recommended_features).toContain('project_management');
    expect(recommendations.recommended_features).toContain('kanban_boards');
  });
  
  test('should create company with features', async () => {
    const company = await createCompany({
      name: 'Test Co',
      industry_type: 'Technology',
      features: {
        project_management: true,
        invoice_management: false
      }
    });
    
    const features = await getCompanyFeatures(company.id);
    expect(features.project_management).toBe(true);
    expect(features.invoice_management).toBe(false);
  });
});
```

### Integration Tests

```javascript
describe('Payroll Workflow Integration', () => {
  test('complete payroll cycle from initiate to approve', async () => {
    // 1. Accounts initiates payroll
    const payroll = await request(app)
      .post('/api/accounts/payroll/initiate')
      .set('Authorization', `Bearer ${accountsToken}`)
      .send({
        period_month: 11,
        period_year: 2024,
        total_amount: 285000
      });
    
    expect(payroll.status).toBe(200);
    expect(payroll.body.data.status).toBe('pending_approval');
    
    // 2. Finance sees pending approval
    const approvals = await request(app)
      .get('/api/finance/approvals')
      .set('Authorization', `Bearer ${financeToken}`);
    
    expect(approvals.body.data.approvals).toHaveLength(1);
    
    // 3. Finance approves
    const approve = await request(app)
      .post(`/api/finance/approvals/${payroll.body.data.approval_id}/approve`)
      .set('Authorization', `Bearer ${financeToken}`);
    
    expect(approve.status).toBe(200);
    
    // 4. Verify payroll updated
    const updated = await getPayrollQueue(payroll.body.data.payroll_id);
    expect(updated.status).toBe('approved');
  });
});
```

---

## 📦 Migration Strategy

### Phase 1: Database Setup (Week 1)

```sql
-- Run migrations in order
-- 1. Add new columns to existing tables
-- 2. Create new tables
-- 3. Create indexes
-- 4. Create triggers and functions
-- 5. Seed default data
```

### Phase 2: API Development (Week 2-3)

```
Day 1-3:   Finance Dashboard APIs
Day 4-6:   Accounts Dashboard APIs
Day 7-9:   Feature Configuration APIs
Day 10-12: Integration & testing
```

### Phase 3: Feature Rollout (Week 4)

```
Day 1-2:   Deploy to staging
Day 3:     QA testing
Day 4:     Fix bugs
Day 5:     Deploy to production (off-hours)
Day 6-7:   Monitor & support
```

### Data Migration

```sql
-- Backfill company features for existing companies
INSERT INTO company_features (company_id)
SELECT id FROM companies
WHERE NOT EXISTS (
  SELECT 1 FROM company_features WHERE company_id = companies.id
);

-- Set default features based on plan
UPDATE company_features cf
SET
  employee_management = TRUE,
  attendance_tracking = TRUE,
  leave_management = TRUE,
  payroll_management = (c.plan IN ('professional', 'enterprise')),
  invoice_management = (c.plan IN ('professional', 'enterprise')),
  accounting_bookkeeping = (c.plan = 'enterprise')
FROM companies c
WHERE cf.company_id = c.id;
```

---

## 🔍 Monitoring & Logging

### Key Metrics to Track

1. **Approval Metrics**
   - Average approval time
   - Approval rejection rate
   - Pending approval count
   - High-priority approval SLA

2. **Feature Usage**
   - Features enabled per company
   - Most/least used features
   - Feature adoption rate
   - Feature disable frequency

3. **Performance**
   - Dashboard load time
   - API response time (p50, p95, p99)
   - Cache hit rate
   - Database query time

### Logging Examples

```javascript
// Approval action log
logger.info('Approval processed', {
  approval_id: approval.id,
  type: approval.type,
  amount: approval.amount,
  action: 'approved',
  user_id: user.id,
  user_role: 'finance',
  company_id: company.id,
  processing_time_ms: 125
});

// Feature update log
logger.info('Features updated', {
  company_id: company.id,
  updated_by: user.id,
  changes: featureChanges,
  enabled_count: 12,
  total_count: 17
});
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run all migrations on staging
- [ ] Test all new API endpoints
- [ ] Verify role permissions
- [ ] Load test critical endpoints
- [ ] Review security (SQL injection, XSS, CSRF)
- [ ] Update API documentation
- [ ] Create rollback plan

### Deployment

- [ ] Schedule maintenance window
- [ ] Backup database
- [ ] Run migrations on production
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify health checks
- [ ] Test critical flows

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify notifications working
- [ ] Test with real user accounts
- [ ] Update internal documentation
- [ ] Train support team
- [ ] Announce new features

---

## 📚 Additional Resources

### Related Documentation
- `/BACKEND_SPECIFICATION.md` - Full API specification (185+ endpoints)
- `/INVOICE_ACCOUNTING_SPEC.md` - Financial module APIs (25+ endpoints)
- `/DATABASE_SCHEMA.sql` - Complete database schema
- `/FINANCE_ACCOUNTS_FEATURES.md` - Feature documentation

### External Dependencies
- Notification service (email/SMS)
- Payment processor integration
- Accounting software sync (QuickBooks, Xero)
- Audit log service

---

**Implementation Timeline**: 4 weeks
**Estimated Effort**: 120-160 hours
**Priority**: High - Core business feature
**Risk Level**: Medium - Financial data handling

---

End of Backend Implementation Summary
