# Finance & Accounts Department Features + Feature Configuration

## Overview
This document describes the new features added to the HR & PM system for Finance and Accounts departments, plus the Super Admin feature configuration capability.

---

## 1. Finance Department Dashboard

### File: `/components/finance/FinanceDashboard.tsx`

### Features

#### Key Metrics (Top Cards)
- **Total Revenue**: Shows total revenue with growth percentage
- **Total Expenses**: Shows total expenses with growth percentage  
- **Net Income**: Shows net income with profit margin
- **Cash Balance**: Shows current cash position with liquidity status

#### Tabs

**Overview Tab:**
- Financial Position Summary
  - Accounts Receivable
  - Accounts Payable
  - Working Capital
- Quick Actions
  - Approve Payroll
  - Manage Invoices
  - Accounting Dashboard
  - General Ledger
  - Financial Reports

**Approvals Tab:**
- Pending Approvals Table
  - Payroll approvals
  - Expense approvals
  - Invoice refund approvals
- Approval amount totals
- Quick approve/view actions

**Transactions Tab:**
- Recent Transactions List
  - Income/Expense categorization
  - Transaction details
  - Status badges
- Visual indicators for income (green) vs expense (red)

**Receivables Tab:**
- Outstanding Invoices
- Overdue tracking with days count
- Invoice status badges
- Quick access to invoice details

#### Alert System
- Pending approvals alert banner
- Total pending amount display
- Quick navigation to approvals

### Access Control
- **Role**: Finance
- Can approve payroll
- Full access to all financial data
- Can view all invoices and accounting records

---

## 2. Accounts Department Dashboard

### File: `/components/accounts/AccountsDashboard.tsx`

### Features

#### Key Metrics (Top Cards)
- **Invoices Sent**: Total invoices with paid count
- **Total Collected**: Revenue collected with collection rate
- **Pending Collection**: Outstanding amount with invoice count
- **Payroll Processed**: Annual payroll runs count

#### Tabs

**Overview Tab:**
- Quick Actions
  - Create New Invoice
  - Process Payroll
  - Record Expense
  - View Ledger
  - Accounting Dashboard
- Activity Summary (This Month)
  - Invoices Created
  - Payments Received
  - Payroll Runs
  - Expenses Recorded

**Invoices Tab:**
- Recent Invoices Table
- Invoice status tracking (Draft, Sent, Paid, Overdue)
- Quick view/edit access
- Create invoice button

**Payroll Tab:**
- Payroll Processing Queue
- Employee count per cycle
- Status tracking (Pending Approval, Approved)
- Total amount per cycle
- Initiated and approved dates

**Expenses Tab:**
- Recent Expense Entries
- Expense categorization
- Amount tracking
- Status indicators

### Access Control
- **Role**: Accounts
- Can create/edit invoices
- Can process payroll (initiate)
- Can record expenses
- Can create journal entries
- Cannot approve payroll (requires Finance/Admin)

---

## 3. Super Admin Feature Configuration

### File: `/components/superadmin/FeatureConfiguration.tsx`

### Feature Groups

#### Core HR Management
- Employee Management
- Attendance Tracking
- Leave Management

#### Time & Project Management
- Timesheet Management
- Project Management
- Task Management
- Kanban Boards

#### Performance & Skills
- Performance Appraisal
- Skills & Competencies

#### Financial Management
- Payroll Management
- Invoice Management
- Accounting & Bookkeeping
- Expense Tracking

#### Sales & CRM
- Leads Management

#### Reporting & Analytics
- Advanced Reports
- Analytics Dashboard

#### Document Management
- Document Management

### Industry-Based Recommendations

The system recommends features based on industry type:

**Technology & Software:**
- All project management features
- Timesheet management
- Task management
- Kanban boards
- Skills management

**Consulting & Professional Services:**
- Invoice management
- Project management
- Timesheet management
- Skills management

**Creative Agency & Marketing:**
- Project management
- Invoice management
- Kanban boards
- Leads management

**Healthcare & Medical:**
- Skills management
- Performance appraisal
- Employee management

**Finance & Banking:**
- Accounting & bookkeeping
- Advanced reports

**All Industries:**
- Employee management
- Attendance tracking
- Leave management
- Payroll management
- Performance appraisal
- Accounting & bookkeeping
- Advanced reports
- Document management

### Feature Configuration UI

#### Progress Indicator
- Shows X of Y features enabled
- Percentage completion

#### Feature Cards
- Grouped by category
- Icon for each group
- Feature toggle switches
- "Recommended" badges for industry-specific features
- Description for each feature

#### Configuration Tips
- Features can be enabled/disabled anytime
- Recommendations based on industry
- Disabled features don't appear in navigation
- Data is preserved when toggling

---

## 4. Enhanced Company Creation Modal

### File: `/components/companies/CreateCompanyModal.tsx`

### Two-Step Process

#### Step 1: Basic Information
- Company Name (required)
- Company Slug (required, auto-generated from name)
- **Industry Type (required)** - NEW!
  - Technology & Software
  - Consulting & Professional Services
  - Creative Agency & Marketing
  - Healthcare & Medical
  - Manufacturing & Production
  - Retail & E-commerce
  - Finance & Banking
  - Education & Training
  - Construction & Real Estate
  - Hospitality & Tourism
  - Nonprofit & NGO
  - Other
- Plan Selection (Free, Basic, Professional, Enterprise)
- Timezone Selection

#### Step 2: Feature Configuration
- Visual feature configuration interface
- Industry-based recommendations
- Toggle features on/off
- Preview enabled features count
- Back button to edit Step 1

### Benefits
- Customized setup per company
- Reduced clutter in navigation
- Only relevant features enabled
- Industry-specific defaults
- Better resource utilization

---

## 5. Updated Navigation

### Sidebar Additions

**Finance Role:**
- Dashboard → Finance Dashboard
- Invoicing (with sub-items)
  - All Invoices
  - Create Invoice
- Accounting (with sub-items)
  - Dashboard
  - General Ledger

**Accounts Role:**
- Dashboard → Accounts Dashboard  
- Invoicing (with sub-items)
  - All Invoices
  - Create Invoice
- Accounting (with sub-items)
  - Dashboard
  - General Ledger

**Manager Role:**
- Invoicing (view/create for their projects)

---

## 6. Role-Based Dashboards

### Dashboard Routing Logic

```typescript
case 'dashboard':
  if (user?.role === 'finance') {
    return <FinanceDashboard />;
  } else if (user?.role === 'accounts') {
    return <AccountsDashboard />;
  } else if (user?.role === 'manager' || user?.role === 'admin') {
    return <ManagerDashboard />;
  } else {
    return <EmployeeDashboard />;
  }
```

Each role now sees a customized dashboard with relevant metrics and actions.

---

## 7. Integration Points

### Finance ↔ Payroll
- Approve payroll cycles
- View payroll amounts
- Financial reporting integration

### Accounts ↔ Invoices
- Create and manage invoices
- Track payments
- Generate invoices from projects

### Accounts ↔ Payroll
- Initiate payroll processing
- Generate payslips
- Submit for Finance approval

### Both ↔ Accounting
- Access general ledger
- Create journal entries
- View financial reports

---

## 8. Feature Flags in Backend

### Data Model Addition

```typescript
Company {
  // ... existing fields
  enabled_features: json {
    employee_management: boolean
    attendance_tracking: boolean
    leave_management: boolean
    timesheet_management: boolean
    project_management: boolean
    task_management: boolean
    kanban_boards: boolean
    performance_appraisal: boolean
    skills_management: boolean
    payroll_management: boolean
    invoice_management: boolean
    accounting_bookkeeping: boolean
    expense_tracking: boolean
    leads_management: boolean
    advanced_reports: boolean
    analytics_dashboard: boolean
    document_management: boolean
  }
}
```

### API Endpoints

#### POST /api/companies
- Include `enabled_features` in company creation
- Set defaults based on industry type

#### PUT /api/companies/:id/features
- Update feature flags for a company (Admin only)
- Input: { enabled_features: {...} }
- Output: { company }

#### GET /api/companies/:id/features
- Get enabled features for a company
- Output: { enabled_features }

### Middleware
```typescript
// Check if feature is enabled for company
const checkFeature = (feature: string) => {
  return async (req, res, next) => {
    const company = await getCompany(req.company_id);
    if (company.enabled_features[feature]) {
      next();
    } else {
      res.status(403).json({ error: 'Feature not enabled' });
    }
  };
};

// Usage
app.get('/api/invoices', checkFeature('invoice_management'), getInvoices);
```

---

## 9. Migration Guide

### For Existing Companies

When rolling out these features to existing companies:

1. **Set Default Features**
   ```sql
   UPDATE companies 
   SET enabled_features = '{
     "employee_management": true,
     "attendance_tracking": true,
     "leave_management": true,
     "payroll_management": true,
     "performance_appraisal": true,
     "document_management": true,
     "advanced_reports": true
   }'::jsonb
   WHERE enabled_features IS NULL;
   ```

2. **Create Feature Configuration Page**
   - Super Admin can enable/disable features per company
   - Company Admin can request feature changes

3. **Navigation Updates**
   - Sidebar items filtered by enabled features
   - 404 page for disabled feature access

---

## 10. Usage Examples

### Example 1: Tech Startup
**Industry**: Technology & Software
**Enabled Features**:
- Core HR (all)
- Project Management (all)
- Task Management + Kanban
- Timesheet Management
- Skills Management
- Payroll
- Basic Reports

**Result**: Lean setup focused on engineering team management

### Example 2: Consulting Firm
**Industry**: Consulting & Professional Services
**Enabled Features**:
- Core HR (all)
- Project Management
- Timesheet Management
- Invoice Management
- Accounting & Bookkeeping
- Performance Appraisal
- Advanced Reports

**Result**: Client billing and time tracking focused

### Example 3: Marketing Agency
**Industry**: Creative Agency
**Enabled Features**:
- Core HR (all)
- Project Management + Kanban
- Invoice Management
- Leads Management
- Basic Reports

**Result**: Client acquisition and project delivery focused

---

## 11. Benefits Summary

### For Super Admin
✅ Customized company setup per industry
✅ Reduced system complexity per tenant
✅ Better resource management
✅ Faster onboarding with smart defaults

### For Finance Department
✅ Centralized financial oversight
✅ Approval workflows at fingertips
✅ Real-time financial metrics
✅ Quick access to all financial data

### For Accounts Department
✅ Streamlined invoicing workflow
✅ Payroll processing efficiency
✅ Expense tracking centralized
✅ Activity monitoring

### For Customers
✅ Pay only for features they need
✅ Cleaner, focused interface
✅ Industry-specific setup
✅ Scalable as they grow

---

## 12. Next Steps for Backend Implementation

1. **Database Schema Updates**
   - Add `enabled_features` JSONB column to companies table
   - Add `industry` VARCHAR column to companies table
   - Update indexes

2. **Feature Flag Middleware**
   - Implement feature checking middleware
   - Add to all module routes

3. **API Endpoints**
   - Company feature management endpoints
   - Feature-filtered navigation API

4. **Billing Integration** (Future)
   - Feature-based pricing
   - Automated feature limits per plan
   - Usage tracking per feature

5. **Analytics** (Future)
   - Track feature adoption
   - Identify most-used features by industry
   - Usage patterns for optimization

---

This comprehensive feature set transforms the HR & PM system into a modular, industry-specific platform that can be customized for each customer's unique needs!
