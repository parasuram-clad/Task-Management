# Prisma Quick Start Guide

## 🚀 Getting Started

### Option 1: Automated Fix (Recommended)

**For Linux/Mac:**
```bash
chmod +x fix-prisma.sh
./fix-prisma.sh
```

**For Windows:**
```bash
fix-prisma.bat
```

### Option 2: Manual Steps

```bash
# 1. Format the schema
npx prisma format

# 2. Generate Prisma Client
npx prisma generate

# 3. Push to database (development)
npx prisma db push

# OR create migration (production)
npx prisma migrate dev --name initial_setup
```

## 📋 Prerequisites

1. **Install Dependencies**
```bash
npm install @prisma/client
npm install -D prisma typescript ts-node @types/node
```

2. **Setup Environment**

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hr_db?schema=public"
```

## 🔍 Resolving the AttendanceSettings Error

The error occurs due to Prisma caching. Here's the fix:

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# Format and validate
npx prisma format
npx prisma validate

# Generate client
npx prisma generate
```

## 📊 Schema Overview

Your Prisma schema includes **64 models** across **15 categories**:

### Core (10 models)
- Company, CompanySettings, CompanyFeatures
- Department, User, UserSession, Employee

### HR Management
- **Attendance**: AttendanceSettings, Attendance
- **Timesheet**: Timesheet, TimesheetEntry
- **Leave**: Holiday, LeaveType, LeaveBalance, LeaveRequest

### Payroll & Payment (7 models) ⭐
- PayrollCycle, Payslip, SalaryComponent
- **UTR Tracking**: PaymentBatch, PayrollReconciliation, PaymentAuditTrail, UnpaidSalaryRegister

### Projects & Tasks (8 models)
- Project, ProjectMember, ProjectMilestone, ProjectActivity
- Task, TaskComment, TaskAttachment, TaskDependency

### Performance (4 models)
- AppraisalTemplate, AppraisalCycle, Appraisal, PerformanceRating

### Skills (4 models)
- SkillCategory, Skill, EmployeeSkill, SkillEndorsement

### Documents (4 models)
- DocumentCategory, Document, DocumentVersion, DocumentAccess

### Security (4 models)
- Permission, Role, RolePermission, UserRole_Mapping

### CRM (3 models)
- Client, Lead, LeadActivity

### Finance (7 models)
- Invoice, InvoiceItem, InvoicePayment
- ChartOfAccount, JournalEntry, JournalEntryLine, LedgerEntry

### Communications (3 models)
- Notification, NotificationPreference, EmailLog

### Integrations (3 models)
- IntegrationSetting, Webhook, WebhookLog

### Audit (2 models)
- AuditLog, UserActivityLog

## 💻 Usage Examples

### 1. Basic Queries

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Find companies with attendance settings
const companies = await prisma.company.findMany({
  include: {
    attendanceSettings: true,
    employees: true
  }
})

// Create a payment batch
const batch = await prisma.paymentBatch.create({
  data: {
    companyId: "company-uuid",
    payrollCycleId: "cycle-uuid",
    batchNumber: "BATCH-2024-11-001",
    batchName: "November 2024 Salary",
    batchType: "regular",
    totalEmployees: 100,
    totalAmount: 500000.00,
    preparedBy: "employee-uuid"
  }
})

// Update payslip with UTR
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

### 2. Complex Queries with UTR Tracking

```typescript
// Get unpaid salaries with aging
const unpaidSalaries = await prisma.unpaidSalaryRegister.findMany({
  where: {
    companyId: "company-uuid",
    isResolved: false,
    agingBucket: "60+ Days"
  },
  include: {
    employee: {
      include: {
        user: true
      }
    },
    payslip: true
  }
})

// Get payment reconciliation report
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

// Get payment audit trail
const auditTrail = await prisma.paymentAuditTrail.findMany({
  where: {
    payslipId: "payslip-uuid"
  },
  include: {
    performer: {
      include: {
        user: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
})
```

### 3. Transactions

```typescript
// Process payroll with UTR tracking
const result = await prisma.$transaction(async (tx) => {
  // Create payment batch
  const batch = await tx.paymentBatch.create({
    data: { /* batch data */ }
  })

  // Update payslips with batch ID
  await tx.payslip.updateMany({
    where: { payrollCycleId: cycleId },
    data: { paymentBatchId: batch.id, status: 'processing' }
  })

  // Create audit trail
  await tx.paymentAuditTrail.create({
    data: {
      companyId: "company-uuid",
      payslipId: "payslip-uuid",
      action: "status_change",
      oldStatus: "pending",
      newStatus: "processing",
      performedBy: employeeId
    }
  })

  return batch
})
```

### 4. Aggregations

```typescript
// Get payment statistics
const stats = await prisma.payslip.groupBy({
  by: ['status'],
  where: {
    payrollCycleId: cycleId
  },
  _count: {
    id: true
  },
  _sum: {
    netSalary: true
  }
})

// Get unpaid salary aging breakdown
const aging = await prisma.unpaidSalaryRegister.groupBy({
  by: ['agingBucket'],
  where: {
    companyId: "company-uuid",
    isResolved: false
  },
  _count: true,
  _sum: {
    netSalary: true
  }
})
```

## 🎯 Key Features

### 1. UTR Tracking
```typescript
// Upload UTR for a payslip
await prisma.payslip.update({
  where: { id: payslipId },
  data: {
    utrNumber: "BANK1234567890",
    utrUploadDate: new Date(),
    utrUploadedBy: employeeId,
    actualPaymentDate: new Date("2024-11-20"),
    status: "paid"
  }
})

// Create audit trail automatically via trigger
```

### 2. Payment Batches
```typescript
// Create and approve batch
const batch = await prisma.paymentBatch.create({
  data: {
    // ... batch data
    status: "draft"
  }
})

await prisma.paymentBatch.update({
  where: { id: batch.id },
  data: {
    status: "approved",
    approvedBy: managerId,
    approvedAt: new Date()
  }
})
```

### 3. Reconciliation
```typescript
// Create reconciliation record
await prisma.payrollReconciliation.create({
  data: {
    companyId: "company-uuid",
    payrollCycleId: cycleId,
    reconciliationDate: new Date(),
    reconciliationPeriod: "2024-11",
    hrmssTotalPayable: 500000.00,
    hrmsTotalEmployees: 100,
    bankTotalPaid: 495000.00,
    bankTotalTransactions: 95,
    status: "pending"
  }
})
```

## 🔒 Best Practices

### 1. Use Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### 2. Always Use Transactions for Multi-Step Operations

```typescript
// Good
await prisma.$transaction([
  prisma.payslip.update({ /* ... */ }),
  prisma.paymentAuditTrail.create({ /* ... */ }),
])

// Bad - can lead to inconsistent state
await prisma.payslip.update({ /* ... */ })
await prisma.paymentAuditTrail.create({ /* ... */ })
```

### 3. Proper Error Handling

```typescript
try {
  const result = await prisma.payslip.create({ data })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      console.log('Unique constraint violation')
    }
  }
  throw error
}
```

### 4. Use Select for Performance

```typescript
// Good - only get what you need
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true
  }
})

// Less optimal - fetches all fields
const users = await prisma.user.findMany()
```

## 🐛 Troubleshooting

### Error: Type "XXX" is not found

**Solution:**
```bash
npx prisma format
npx prisma generate
```

### Error: P2002 - Unique constraint failed

**Cause:** Trying to insert duplicate data

**Solution:** Check your unique constraints in the schema

### Error: P2025 - Record not found

**Cause:** Trying to update/delete non-existent record

**Solution:** Use `findUnique` first or use `upsert`

### Connection Pool Exhausted

**Solution:**
```typescript
await prisma.$disconnect() // Disconnect when done
// Or increase pool size in DATABASE_URL
DATABASE_URL="postgresql://user:pass@localhost:5432/db?connection_limit=20"
```

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Database Schema Documentation](./DATABASE_SCHEMA.sql)
- [UTR Tracking Specification](./UTR_TRACKING_SPECIFICATION.md)
- [API Endpoints Summary](./API_ENDPOINTS_SUMMARY.md)

## ✅ Checklist

- [ ] Install Prisma dependencies
- [ ] Create `.env` with DATABASE_URL
- [ ] Run `npx prisma format`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push` or `migrate dev`
- [ ] Test connection with `npx prisma studio`
- [ ] Set up connection pooling in your app
- [ ] Create seed data
- [ ] Start building! 🎉

---

**Need help?** Check `PRISMA_SETUP.md` for detailed troubleshooting guide.
