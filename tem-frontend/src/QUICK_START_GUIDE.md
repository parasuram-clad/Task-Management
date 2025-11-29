# Quick Start Guide - Testing Finance & Accounts Features

## Demo Login Credentials

All users use the password: **`password`**

### Available Demo Users

| Email | Role | Name | Department | Features |
|-------|------|------|------------|----------|
| `superadmin@platform.com` | Super Admin | Platform Admin | Platform | Full system access, company management, feature configuration |
| `admin@company.com` | Admin | Admin User | Administration | Full company access, all approvals |
| `finance@company.com` | **Finance** | Robert Chen | Finance | **Financial oversight, approve payroll, view all financial data** |
| `accounts@company.com` | **Accounts** | Emily Rodriguez | Accounts | **Invoice management, payroll processing, expense tracking** |
| `manager@company.com` | Manager | Sarah Johnson | Engineering | Team management, project oversight |
| `hr@company.com` | HR | Mike Wilson | HR | Employee management, performance reviews |
| `employee@company.com` | Employee | John Doe | Engineering | Basic employee features |

---

## Testing Finance Dashboard

### Login as Finance User
1. Email: `finance@company.com`
2. Password: `password`
3. Click "Login"

### What You'll See
- **Dashboard**: Finance-specific dashboard with:
  - Total Revenue: $450,000
  - Total Expenses: $280,000
  - Net Income: $170,000
  - Cash Balance: $325,000

### Features to Test

#### 1. Overview Tab
- View financial position (Receivables, Payables, Working Capital)
- Quick actions for approvals and reports

#### 2. Approvals Tab ⭐
- **3 Pending Approvals**:
  - November 2024 Payroll ($285,000)
  - Office Equipment Purchase ($45,000)
  - Client Refund ($12,000)
- Approve/View actions

#### 3. Transactions Tab
- Recent financial transactions
- Income vs Expense tracking
- Navigate to General Ledger

#### 4. Receivables Tab
- Outstanding invoices
- Overdue tracking
- Quick invoice access

### Navigation Access
- ✅ Invoicing → All Invoices, Create Invoice
- ✅ Accounting → Dashboard, General Ledger
- ✅ Payroll → Approve Payroll
- ✅ Full financial reports access

---

## Testing Accounts Dashboard

### Login as Accounts User
1. Email: `accounts@company.com`
2. Password: `password`
3. Click "Login"

### What You'll See
- **Dashboard**: Accounts-specific dashboard with:
  - Invoices Sent: 42
  - Total Collected: $675,000
  - Pending Collection: $175,000
  - Payroll Processed: 12

### Features to Test

#### 1. Overview Tab
- Quick Actions (Create Invoice, Process Payroll, Record Expense)
- Monthly Activity Summary:
  - Invoices Created: 12
  - Payments Received: 8
  - Payroll Runs: 1
  - Expenses Recorded: 24

#### 2. Invoices Tab ⭐
- **Recent Invoices**:
  - INV-2024-005: Acme Corp ($45,000) - Sent
  - INV-2024-004: StartUp Co ($35,400) - Draft
  - INV-2024-003: Global Enterprises ($70,800) - Overdue
- Create new invoice button
- View all invoices

#### 3. Payroll Tab ⭐
- **Payroll Queue**:
  - November 2024: 125 employees, $285,000 (Pending Approval)
  - October 2024: 125 employees, $278,000 (Approved)
- Process new payroll
- View details

#### 4. Expenses Tab
- Recent expense entries
- Categorized tracking
- Record new expenses

### Navigation Access
- ✅ Invoicing → All Invoices, Create Invoice
- ✅ Accounting → Dashboard, General Ledger
- ✅ Payroll → Process Payroll (can initiate, not approve)
- ✅ Expense tracking

---

## Testing Feature Configuration (Super Admin)

### Login as Super Admin
1. Email: `superadmin@platform.com`
2. Password: `password`
3. Click "Login"

### Create New Company with Features
1. Click on Company Switcher (top of sidebar)
2. Click "➕ Create Company"
3. **Step 1: Basic Information**
   - Company Name: e.g., "Tech Startup Inc"
   - Company Slug: e.g., "tech-startup" (auto-generated)
   - **Industry Type**: Select "Technology & Software"
   - Plan: Select any plan
   - Timezone: Select timezone
   - Click "Next: Configure Features"

4. **Step 2: Feature Configuration** ⭐
   - See **17 features** grouped by category
   - Features with "Recommended" badge are pre-selected based on industry
   - Toggle features on/off as needed
   - See progress indicator (X of 17 features enabled)
   - Review feature descriptions
   - Click "Create Company"

### Industry Recommendations

**Technology & Software** gets:
- ✅ All Core HR
- ✅ Project Management + Tasks + Kanban
- ✅ Timesheet Management
- ✅ Skills Management
- ✅ Payroll

**Consulting & Professional Services** gets:
- ✅ All Core HR
- ✅ Invoice Management
- ✅ Project + Timesheet Management
- ✅ Accounting & Bookkeeping
- ✅ Skills Management

**Creative Agency** gets:
- ✅ All Core HR
- ✅ Project + Kanban
- ✅ Invoice Management
- ✅ Leads Management

---

## Testing Invoice Management

### As Accounts or Finance User

1. Navigate to **Invoicing → All Invoices**
2. See invoice list with filters:
   - Tabs: All, Draft, Sent, Paid, Overdue
   - Search by invoice number or client
   - Filter by status

3. Click **Create Invoice**:
   - Fill in client details
   - Add invoice items (description, quantity, rate)
   - Set payment terms (Net 30, 45, 60)
   - Tax calculation
   - Save as draft or send

4. View invoice summary:
   - Total Revenue
   - Pending Amount
   - Overdue Amount
   - Total Invoices

---

## Testing Accounting Features

### As Finance or Accounts User

1. Navigate to **Accounting → Dashboard**
2. View key metrics:
   - Total Revenue vs Expenses
   - Net Income
   - Profit Margin
   - Account Balances (Assets, Liabilities, Equity)

3. Navigate to **Accounting → General Ledger**:
   - View all ledger entries
   - Filter by account or date range
   - See running balances
   - Total debits and credits

4. Create Journal Entry (from dashboard):
   - Add debit/credit lines
   - Must balance (total debits = total credits)
   - Post to ledger

---

## Key Differences: Finance vs Accounts

### Finance Role Can:
✅ **Approve** payroll (final authority)
✅ **Approve** large expenses
✅ View ALL financial data
✅ Generate financial reports
✅ Access all accounting features
✅ Manage invoices (view/edit)

### Accounts Role Can:
✅ **Process** payroll (initiate, send for approval)
✅ **Create** invoices
✅ **Record** expenses
✅ Create journal entries
✅ Access accounting dashboard
✅ View general ledger

### What Accounts CANNOT Do:
❌ Approve payroll (must send to Finance)
❌ Approve large financial transactions

---

## Testing Workflow: Payroll Processing

### Full Payroll Cycle

1. **Accounts Initiates** (accounts@company.com):
   - Navigate to Payroll → Process Payroll
   - Enter payroll details for current month
   - Calculate amounts
   - Submit for approval

2. **Finance Approves** (finance@company.com):
   - See pending approval in Finance Dashboard
   - Navigate to Approvals tab
   - Review payroll details
   - Approve or reject

3. **System Processes**:
   - Creates accounting entries
   - Generates payslips
   - Updates balances

---

## Feature Configuration Use Cases

### Scenario 1: Freelance Agency
**Industry**: Creative Agency
**Enable**:
- Core HR (basic)
- Project Management
- Invoice Management
- Leads Management

**Disable**:
- Timesheet Management
- Performance Appraisal
- Accounting (use external)

### Scenario 2: Tech Startup (50 employees)
**Industry**: Technology
**Enable**:
- All Core HR
- Full Project Suite (Projects, Tasks, Kanban)
- Timesheet Management
- Skills Management
- Payroll + Accounting

**Disable**:
- Invoice Management (no client billing)
- Leads Management (product company)

### Scenario 3: Consulting Firm
**Industry**: Consulting
**Enable**:
- All Core HR
- Project + Timesheet
- Invoice + Accounting (crucial!)
- Performance + Skills
- Advanced Reports

**Keep All**: This industry needs most features!

---

## Tips for Testing

1. **Switch Between Users**: Log out and log in as different users to see role-specific dashboards

2. **Check Navigation**: Notice how sidebar items change based on role and permissions

3. **Test Workflows**: Try the full payroll cycle (Accounts → Finance approval)

4. **Feature Configuration**: Create multiple companies with different industries and see how recommendations change

5. **Responsive Design**: Test on mobile/tablet to see responsive layouts

---

## Mock Data Available

### Invoices
- 4 invoices with different statuses
- Mix of paid, sent, draft, and overdue

### Payroll
- 2 payroll cycles (current pending, previous approved)
- 125 employees per cycle

### Transactions
- 4 recent transactions (income and expenses)
- Linked to various accounts

### Approvals
- 3 items pending Finance approval
- Different types (payroll, expense, refund)

---

## Support & Documentation

- **Backend Spec**: `/BACKEND_SPECIFICATION.md` - 185+ API endpoints
- **Invoice & Accounting Spec**: `/INVOICE_ACCOUNTING_SPEC.md` - Financial module APIs
- **Database Schema**: `/DATABASE_SCHEMA.sql` - 30+ tables
- **Feature Documentation**: `/FINANCE_ACCOUNTS_FEATURES.md` - Complete feature guide
- **Implementation Guide**: `/IMPLEMENTATION_GUIDE.md` - 12-week roadmap

---

## Quick Login Cheat Sheet

```
Finance Dashboard:     finance@company.com / password
Accounts Dashboard:    accounts@company.com / password
Super Admin:           superadmin@platform.com / password
Feature Config:        Create new company as Super Admin
```

Happy Testing! 🚀
