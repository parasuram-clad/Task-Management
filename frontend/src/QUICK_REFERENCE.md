# Prisma Schema - Quick Reference Card

## 🚨 Fix the "AttendanceSettings" Error NOW

```bash
# Quick Fix (choose one):

# Option 1: Automated (Recommended)
./fix-prisma.sh        # Linux/Mac
# OR
fix-prisma.bat         # Windows

# Option 2: Manual
npx prisma format && npx prisma generate
```

## 📦 Installation

```bash
npm install @prisma/client
npm install -D prisma
```

## ⚙️ Setup

```bash
# 1. Create .env
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/hr_db"' > .env

# 2. Generate
npx prisma generate

# 3. Push to DB
npx prisma db push
```

## 🔥 Essential Commands

| Command | Purpose |
|---------|---------|
| `npx prisma format` | Format & validate schema |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma db push` | Push schema to DB (dev) |
| `npx prisma migrate dev` | Create migration |
| `npx prisma studio` | Open GUI (localhost:5555) |
| `npx prisma validate` | Validate schema only |

## 📊 Schema Overview

**64 Models** | **32 Enums** | **50+ Tables**

### Core Models (7)
- Company, User, Employee, Department
- CompanySettings, CompanyFeatures, UserSession

### UTR Tracking (4) ⭐ NEW
- **PaymentBatch** - Batch payment processing
- **PayrollReconciliation** - HRMS-Bank-ERP reconciliation
- **PaymentAuditTrail** - Complete audit trail
- **UnpaidSalaryRegister** - Unpaid salaries with aging

### Payroll (3)
- PayrollCycle, **Payslip** (enhanced), SalaryComponent

### HR (12)
- AttendanceSettings, Attendance, Timesheet, TimesheetEntry
- Holiday, LeaveType, LeaveBalance, LeaveRequest

### Projects (8)
- Project, ProjectMember, ProjectMilestone, ProjectActivity
- Task, TaskComment, TaskAttachment, TaskDependency

### More...
- Performance (4), Skills (4), Documents (4)
- Security (4), CRM (3), Finance (7)
- Notifications (3), Integrations (3), Audit (2)

## 💡 Quick Code Snippets

### Upload UTR
```typescript
await prisma.payslip.update({
  where: { id: payslipId },
  data: {
    utrNumber: "BANK1234567890",
    utrUploadedBy: employeeId,
    actualPaymentDate: new Date(),
    status: "paid"
  }
})
```

### Create Payment Batch
```typescript
const batch = await prisma.paymentBatch.create({
  data: {
    companyId, payrollCycleId,
    batchNumber: "BATCH-2024-11-001",
    batchName: "Nov 2024 Salary",
    batchType: "regular",
    totalEmployees: 100,
    totalAmount: 500000,
    preparedBy: employeeId
  }
})
```

### Get Unpaid Salaries
```typescript
const unpaid = await prisma.unpaidSalaryRegister.findMany({
  where: {
    companyId,
    isResolved: false,
    agingBucket: "60+ Days"
  },
  include: {
    employee: { include: { user: true } },
    payslip: true
  }
})
```

### Reconciliation
```typescript
const recon = await prisma.payrollReconciliation.create({
  data: {
    companyId, payrollCycleId,
    reconciliationDate: new Date(),
    reconciliationPeriod: "2024-11",
    hrmssTotalPayable: 500000,
    hrmsTotalEmployees: 100,
    bankTotalPaid: 495000,
    bankTotalTransactions: 95,
    status: "pending"
  }
})
```

### Transaction
```typescript
await prisma.$transaction([
  prisma.payslip.update({ ... }),
  prisma.paymentAuditTrail.create({ ... })
])
```

## 🎯 Payslip Status Flow

```
pending → processing → paid
              ↓
           on-hold → (release) → processing → paid
              ↓
           failed → (reprocess) → processing → paid
```

## 🔄 Payment Batch Flow

```
draft → approved → sent_to_bank → processing → completed
                                              ↓
                                    partially_completed
                                              ↓
                                           failed
```

## 📈 Key Enums

### PayslipStatus
`pending | processing | on-hold | paid | failed | partially-paid`

### PaymentBatchType
`regular | fnf | bonus | arrears | advance | reprocess`

### PaymentBatchStatus
`draft | approved | sent_to_bank | processing | completed | failed | partially_completed`

### ReconciliationStatus
`pending | in-progress | matched | mismatched | approved`

### UnpaidReason
`on-hold | payment-failed | bank-issue | compliance-issue | documentation-pending | other`

## 🔍 Useful Queries

### Find with Relations
```typescript
const company = await prisma.company.findUnique({
  where: { id: companyId },
  include: {
    attendanceSettings: true,
    employees: { include: { user: true } },
    payrollCycles: { orderBy: { createdAt: 'desc' } }
  }
})
```

### Filter & Count
```typescript
const { _count, _sum } = await prisma.payslip.aggregate({
  where: { payrollCycleId, status: 'paid' },
  _count: { id: true },
  _sum: { netSalary: true }
})
```

### Group By
```typescript
const stats = await prisma.payslip.groupBy({
  by: ['status'],
  where: { payrollCycleId },
  _count: { id: true },
  _sum: { netSalary: true }
})
```

## 🛡️ Best Practices

1. **Always use transactions** for multi-step operations
2. **Use select** to fetch only needed fields
3. **Use include** sparingly (performance)
4. **Add indexes** on frequently queried fields (already done)
5. **Validate input** before database operations
6. **Handle errors** gracefully with try-catch
7. **Use connection pooling** in production
8. **Close connections** with `prisma.$disconnect()`

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| Type not found | `npx prisma format && npx prisma generate` |
| P2002 Unique constraint | Check unique fields in schema |
| P2025 Record not found | Verify record exists before update |
| Connection timeout | Check DATABASE_URL and PostgreSQL |
| Pool exhausted | Increase connection limit or disconnect |

## 📚 Documentation Files

| File | What's in it |
|------|--------------|
| `schema.prisma` | Complete schema (64 models) |
| `PRISMA_SETUP.md` | Detailed setup guide |
| `PRISMA_QUICK_START.md` | Examples & tutorials |
| `PRISMA_SCHEMA_SUMMARY.md` | This summary |
| `prisma-helpers.ts` | TypeScript utilities |
| `fix-prisma.sh` / `.bat` | Automated fix scripts |

## ✅ Quick Checklist

- [ ] Install Prisma: `npm install @prisma/client prisma`
- [ ] Create `.env` with `DATABASE_URL`
- [ ] Run `npx prisma format`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push` or `migrate dev`
- [ ] Test with `npx prisma studio`
- [ ] Import in code: `import { prisma } from '@/lib/prisma'`
- [ ] Start building! 🎉

## 🚀 Production Checklist

- [ ] Use migrations instead of `db push`
- [ ] Set up connection pooling
- [ ] Enable query logging
- [ ] Set up backup strategy
- [ ] Use environment-specific DATABASE_URLs
- [ ] Monitor query performance
- [ ] Set up error tracking
- [ ] Configure read replicas if needed

## 🎓 Learning Resources

- [Prisma Docs](https://prisma.io/docs)
- [Prisma Examples](https://github.com/prisma/prisma-examples)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Got issues?** Run the fix script first!

**Need examples?** Check `PRISMA_QUICK_START.md`

**Deep dive?** Read `PRISMA_SETUP.md`

**Ready to code?** You're all set! 🚀
