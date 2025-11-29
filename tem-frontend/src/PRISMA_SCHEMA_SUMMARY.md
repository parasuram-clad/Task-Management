# Prisma Schema Summary

## 📦 What You Received

I've created a comprehensive Prisma schema for your HR & Project Management System with full UTR tracking support.

### Files Created:

1. **`/prisma/schema.prisma`** - Complete Prisma schema (64 models, 32 enums)
2. **`/PRISMA_SETUP.md`** - Detailed setup and troubleshooting guide
3. **`/PRISMA_QUICK_START.md`** - Quick start guide with examples
4. **`/types/prisma-helpers.ts`** - TypeScript helper types and utilities
5. **`/fix-prisma.sh`** - Automated fix script (Linux/Mac)
6. **`/fix-prisma.bat`** - Automated fix script (Windows)

## 🔧 Quick Fix for AttendanceSettings Error

The error you're seeing is a common Prisma caching issue. Here's how to fix it:

### **Solution 1: Run the Fix Script**

**Linux/Mac:**
```bash
chmod +x fix-prisma.sh
./fix-prisma.sh
```

**Windows:**
```cmd
fix-prisma.bat
```

### **Solution 2: Manual Fix**

```bash
# Step 1: Clear cache
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Step 2: Format schema
npx prisma format

# Step 3: Generate client
npx prisma generate
```

### **Why This Happens**

Prisma caches the generated client in `node_modules/.prisma`. When the schema changes, the cache can become stale. Running `prisma format` and `prisma generate` rebuilds everything.

## 📊 Schema Statistics

### **64 Models** organized in 15 categories:

| Category | Models | Description |
|----------|--------|-------------|
| **Core** | 7 | Company, User, Employee, Settings |
| **Attendance** | 4 | AttendanceSettings, Attendance, Timesheet |
| **Leave** | 4 | LeaveType, LeaveBalance, LeaveRequest, Holiday |
| **Payroll** | 3 | PayrollCycle, Payslip, SalaryComponent |
| **Payment/UTR** ⭐ | 4 | PaymentBatch, Reconciliation, AuditTrail, UnpaidRegister |
| **Projects** | 8 | Project, Task, Members, Activities, Comments |
| **Performance** | 4 | Appraisal, AppraisalCycle, Template, Rating |
| **Skills** | 4 | Skill, SkillCategory, EmployeeSkill, Endorsement |
| **Documents** | 4 | Document, Category, Version, Access |
| **Security** | 4 | Role, Permission, RolePermission, UserRole |
| **CRM** | 3 | Client, Lead, LeadActivity |
| **Finance** | 7 | Invoice, ChartOfAccount, JournalEntry, Ledger |
| **Notifications** | 3 | Notification, Preference, EmailLog |
| **Integrations** | 3 | IntegrationSetting, Webhook, WebhookLog |
| **Audit** | 2 | AuditLog, UserActivityLog |

### **32 Enums** for type safety:

- UserRole, EmploymentType, WorkLocation
- AttendanceStatus, TimesheetStatus, LeaveStatus
- PayrollStatus, **PayslipStatus** (with UTR states)
- **PaymentBatchType, PaymentBatchStatus** ⭐
- **ReconciliationStatus, UnpaidReason** ⭐
- ProjectStatus, TaskStatus, Priority
- AppraisalStatus, DocumentCategoryType, AccessLevel
- InvoiceStatus, AccountType, and more...

## 🆕 UTR Tracking Features

### Enhanced Payslip Model

The `Payslip` model now includes:

```prisma
model Payslip {
  // ... existing payroll fields
  
  // UTR Tracking (NEW)
  paymentBatchId          String?       @db.Uuid
  utrNumber               String?       @db.VarChar(50)
  utrUploadDate           DateTime?     @db.Timestamp(6)
  utrUploadedBy           String?       @db.Uuid
  actualPaymentDate       DateTime?     @db.Date
  bankReference           String?       @db.VarChar(100)
  paymentRemarks          String?       @db.Text
  
  // Hold & FnF Management (NEW)
  isFnf                   Boolean       @default(false)
  holdReason              String?       @db.Text
  holdApprovedBy          String?       @db.Uuid
  releasedAt              DateTime?     @db.Timestamp(6)
  releasedBy              String?       @db.Uuid
  
  // Payment Retry Tracking (NEW)
  paymentAttemptCount     Int           @default(0)
  lastPaymentAttemptDate  DateTime?     @db.Timestamp(6)
  paymentFailureReason    String?       @db.Text
  
  // Enhanced status enum
  status PayslipStatus // pending | processing | on-hold | paid | failed | partially-paid
}
```

### New Models for UTR Tracking

#### 1. PaymentBatch
```prisma
model PaymentBatch {
  id                String   @id
  batchNumber       String   // e.g., "BATCH-2024-11-001"
  batchType         PaymentBatchType // regular | fnf | bonus | etc.
  status            PaymentBatchStatus
  totalEmployees    Int
  totalAmount       Decimal
  employeesPaid     Int
  employeesFailed   Int
  // Bank integration fields
  bankFileName      String?
  bankReferenceNumber String?
  // Workflow
  preparedBy        String
  approvedBy        String?
  sentToBankBy      String?
}
```

#### 2. PayrollReconciliation
```prisma
model PayrollReconciliation {
  id                   String   @id
  reconciliationDate   DateTime
  reconciliationPeriod String  // "2024-11"
  
  // HRMS Data
  hrmssTotalPayable    Decimal
  hrmsTotalEmployees   Int
  
  // Bank Data (from UTRs)
  bankTotalPaid        Decimal
  bankTotalTransactions Int
  
  // ERP Data
  erpSalaryExpense     Decimal?
  erpSalaryPayable     Decimal?
  
  // Reconciliation Results
  status               ReconciliationStatus
  varianceAmount       Decimal?
  matchedEmployees     Int
  unmatchedEmployees   Int
  onHoldEmployees      Int
  failedPayments       Int
}
```

#### 3. PaymentAuditTrail
```prisma
model PaymentAuditTrail {
  id          String   @id
  payslipId   String
  action      String   // "status_change" | "utr_uploaded" | etc.
  oldStatus   String?
  newStatus   String?
  oldUtr      String?
  newUtr      String?
  performedBy String
  reason      String?
  ipAddress   String?
  createdAt   DateTime
}
```

#### 4. UnpaidSalaryRegister
```prisma
model UnpaidSalaryRegister {
  id               String   @id
  payslipId        String   @unique
  employeeId       String
  netSalary        Decimal
  reason           UnpaidReason // on-hold | payment-failed | etc.
  reasonDetails    String?
  holdAppliedDate  DateTime?
  isResolved       Boolean
  resolvedDate     DateTime?
  daysUnpaid       Int?
  agingBucket      String?  // "Current" | "1-30 Days" | etc.
}
```

## 💻 Usage Examples

### 1. Upload UTR

```typescript
import { prisma } from '@/lib/prisma'

await prisma.payslip.update({
  where: { id: payslipId },
  data: {
    utrNumber: "HDFC1234567890123456",
    utrUploadDate: new Date(),
    utrUploadedBy: employeeId,
    actualPaymentDate: new Date(),
    status: "paid"
  }
})
```

### 2. Create Payment Batch

```typescript
const batch = await prisma.paymentBatch.create({
  data: {
    companyId: "company-uuid",
    payrollCycleId: "cycle-uuid",
    batchNumber: "BATCH-2024-11-001",
    batchName: "November 2024 Salary",
    batchType: "regular",
    totalEmployees: 100,
    totalAmount: 500000.00,
    preparedBy: "employee-uuid",
    status: "draft"
  }
})
```

### 3. Get Unpaid Salaries

```typescript
const unpaidSalaries = await prisma.unpaidSalaryRegister.findMany({
  where: {
    companyId: "company-uuid",
    isResolved: false,
    agingBucket: "60+ Days"
  },
  include: {
    employee: {
      include: { user: true }
    },
    payslip: true
  }
})
```

### 4. Reconciliation Report

```typescript
const reconciliation = await prisma.payrollReconciliation.findFirst({
  where: {
    payrollCycleId: "cycle-uuid"
  },
  include: {
    payrollCycle: {
      include: {
        payslips: {
          include: {
            employee: true,
            paymentBatch: true
          }
        }
      }
    }
  }
})

const matchPercentage = (reconciliation.matchedEmployees / reconciliation.hrmsTotalEmployees) * 100
```

## 🔍 Key Relationships

### Company → Everything
```
Company (1) → (many) Employees
Company (1) → (many) PayrollCycles
Company (1) → (many) PaymentBatches
Company (1) → (1) AttendanceSettings
```

### Payroll Flow
```
PayrollCycle (1) → (many) Payslips
PayrollCycle (1) → (many) PaymentBatches
PayrollCycle (1) → (many) PayrollReconciliations

Payslip (many) → (1) PaymentBatch
Payslip (1) → (many) PaymentAuditTrail
Payslip (1) → (1) UnpaidSalaryRegister
```

### Employee Relations
```
Employee (1) → (many) Payslips
Employee (1) → (many) Attendance
Employee (1) → (many) LeaveRequests
Employee (1) → (many) Tasks
Employee (1) → (many) EmployeeSkills
```

## 🎯 Next Steps

### 1. Setup Environment
```bash
# Create .env file
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/hr_db"' > .env
```

### 2. Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma typescript ts-node @types/node
```

### 3. Initialize Prisma
```bash
# Format schema
npx prisma format

# Generate client
npx prisma generate

# Push to database
npx prisma db push

# Or create migration
npx prisma migrate dev --name initial_setup
```

### 4. Test Connection
```bash
# Open Prisma Studio
npx prisma studio
```

### 5. Start Coding
```typescript
import { prisma } from '@/lib/prisma'

// Your code here
const companies = await prisma.company.findMany({
  include: {
    attendanceSettings: true,
    employees: true
  }
})
```

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `schema.prisma` | Complete database schema |
| `PRISMA_SETUP.md` | Detailed setup guide |
| `PRISMA_QUICK_START.md` | Quick start with examples |
| `prisma-helpers.ts` | TypeScript utilities |
| `DATABASE_SCHEMA.sql` | Original SQL schema |
| `DATABASE_SCHEMA_UTR_ADDON.sql` | UTR tracking SQL |
| `UTR_TRACKING_SPECIFICATION.md` | Complete UTR spec |
| `API_ENDPOINTS_SUMMARY.md` | API endpoints (330+) |

## ✅ Verification Checklist

- [x] ✅ Schema file created with all 64 models
- [x] ✅ UTR tracking models included
- [x] ✅ All relationships properly defined
- [x] ✅ Indexes on all important fields
- [x] ✅ Enums for type safety
- [x] ✅ Default values configured
- [x] ✅ Cascade deletes set up
- [x] ✅ Unique constraints defined
- [x] ✅ TypeScript helper types created
- [x] ✅ Fix scripts provided
- [x] ✅ Documentation complete

## 🐛 Common Issues

### Issue: "Type XXX is not found"

**Fix:**
```bash
npx prisma format
npx prisma generate
```

### Issue: "Cannot find module '@prisma/client'"

**Fix:**
```bash
npm install @prisma/client
npx prisma generate
```

### Issue: Connection errors

**Fix:**
- Verify DATABASE_URL in `.env`
- Check PostgreSQL is running
- Verify credentials

## 🎉 You're All Set!

Your Prisma schema is ready with:
- ✅ 64 models covering all aspects of your HR system
- ✅ Full UTR tracking and reconciliation
- ✅ IFC compliance support
- ✅ Type-safe queries
- ✅ Excellent performance with proper indexes
- ✅ Complete documentation

**Run the fix script and start building! 🚀**

---

**Need help?** Refer to the documentation files or run `npx prisma --help`
