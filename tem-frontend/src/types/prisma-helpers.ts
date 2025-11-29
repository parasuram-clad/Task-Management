/**
 * Prisma Helper Types and Utilities
 * This file provides type-safe helpers for working with the Prisma schema
 */

import { Prisma } from '@prisma/client'

// ============================================================================
// PAYSLIP WITH UTR - Type Helpers
// ============================================================================

export type PayslipWithEmployee = Prisma.PayslipGetPayload<{
  include: {
    employee: {
      include: {
        user: true
      }
    }
  }
}>

export type PayslipWithBatch = Prisma.PayslipGetPayload<{
  include: {
    paymentBatch: true
    employee: {
      include: {
        user: true
      }
    }
  }
}>

export type PayslipWithAuditTrail = Prisma.PayslipGetPayload<{
  include: {
    auditTrails: {
      include: {
        performer: {
          include: {
            user: true
          }
        }
      }
    }
  }
}>

// ============================================================================
// PAYMENT BATCH - Type Helpers
// ============================================================================

export type PaymentBatchWithPayslips = Prisma.PaymentBatchGetPayload<{
  include: {
    payslips: {
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    }
    preparer: {
      include: {
        user: true
      }
    }
    approver: {
      include: {
        user: true
      }
    }
  }
}>

export type PaymentBatchSummary = {
  id: string
  batchNumber: string
  batchName: string
  status: string
  totalEmployees: number
  totalAmount: number
  employeesPaid: number
  employeesFailed: number
  completionPercentage: number
}

// ============================================================================
// RECONCILIATION - Type Helpers
// ============================================================================

export type ReconciliationWithDetails = Prisma.PayrollReconciliationGetPayload<{
  include: {
    payrollCycle: {
      include: {
        payslips: {
          include: {
            employee: {
              include: {
                user: true
              }
            }
            paymentBatch: true
          }
        }
      }
    }
    reconciler: {
      include: {
        user: true
      }
    }
    approver: {
      include: {
        user: true
      }
    }
  }
}>

export type ReconciliationSummary = {
  totalPayable: number
  totalPaid: number
  variance: number
  matchedCount: number
  unmatchedCount: number
  onHoldCount: number
  failedCount: number
  matchPercentage: number
}

// ============================================================================
// UNPAID SALARY - Type Helpers
// ============================================================================

export type UnpaidSalaryWithDetails = Prisma.UnpaidSalaryRegisterGetPayload<{
  include: {
    employee: {
      include: {
        user: true
      }
    }
    payslip: true
    holdApplier: {
      include: {
        user: true
      }
    }
    resolver: {
      include: {
        user: true
      }
    }
  }
}>

export type UnpaidSalaryAgingReport = {
  agingBucket: string
  count: number
  totalAmount: number
  percentage: number
}

// ============================================================================
// EMPLOYEE - Type Helpers
// ============================================================================

export type EmployeeWithDetails = Prisma.EmployeeGetPayload<{
  include: {
    user: true
    dept: true
    reportingManager: {
      include: {
        user: true
      }
    }
  }
}>

export type EmployeeWithPayroll = Prisma.EmployeeGetPayload<{
  include: {
    user: true
    salaryComponents: true
    payslips: {
      orderBy: {
        createdAt: 'desc'
      }
      take: 6
    }
  }
}>

// ============================================================================
// PROJECT - Type Helpers
// ============================================================================

export type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: {
    members: {
      include: {
        employee: {
          include: {
            user: true
          }
        }
      }
    }
    projectManager: {
      include: {
        user: true
      }
    }
    tasks: {
      where: {
        status: {
          not: 'done'
        }
      }
    }
  }
}>

// ============================================================================
// INVOICE - Type Helpers
// ============================================================================

export type InvoiceWithItems = Prisma.InvoiceGetPayload<{
  include: {
    items: true
    payments: true
    creator: {
      include: {
        user: true
      }
    }
  }
}>

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate payment batch completion percentage
 */
export function calculateBatchCompletion(batch: {
  totalEmployees: number
  employeesPaid: number
}): number {
  if (batch.totalEmployees === 0) return 0
  return Math.round((batch.employeesPaid / batch.totalEmployees) * 100)
}

/**
 * Calculate reconciliation match percentage
 */
export function calculateMatchPercentage(reconciliation: {
  hrmsTotalEmployees: number
  matchedEmployees: number
}): number {
  if (reconciliation.hrmsTotalEmployees === 0) return 0
  return Math.round((reconciliation.matchedEmployees / reconciliation.hrmsTotalEmployees) * 100)
}

/**
 * Get aging bucket for unpaid salaries
 */
export function getAgingBucket(daysUnpaid: number): string {
  if (daysUnpaid <= 0) return 'Current'
  if (daysUnpaid <= 30) return '1-30 Days'
  if (daysUnpaid <= 60) return '31-60 Days'
  return '60+ Days'
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date
 */
export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format === 'short' ? 'short' : 'long'
  }).format(date)
}

// ============================================================================
// QUERY BUILDERS
// ============================================================================

/**
 * Build where clause for payslip filtering
 */
export function buildPayslipWhereClause(filters: {
  companyId: string
  payrollCycleId?: string
  employeeId?: string
  status?: string
  hasUtr?: boolean
  isFnf?: boolean
}): Prisma.PayslipWhereInput {
  const where: Prisma.PayslipWhereInput = {
    companyId: filters.companyId
  }

  if (filters.payrollCycleId) {
    where.payrollCycleId = filters.payrollCycleId
  }

  if (filters.employeeId) {
    where.employeeId = filters.employeeId
  }

  if (filters.status) {
    where.status = filters.status as any
  }

  if (filters.hasUtr !== undefined) {
    where.utrNumber = filters.hasUtr ? { not: null } : null
  }

  if (filters.isFnf !== undefined) {
    where.isFnf = filters.isFnf
  }

  return where
}

/**
 * Build where clause for payment batch filtering
 */
export function buildPaymentBatchWhereClause(filters: {
  companyId: string
  payrollCycleId?: string
  status?: string
  batchType?: string
}): Prisma.PaymentBatchWhereInput {
  const where: Prisma.PaymentBatchWhereInput = {
    companyId: filters.companyId
  }

  if (filters.payrollCycleId) {
    where.payrollCycleId = filters.payrollCycleId
  }

  if (filters.status) {
    where.status = filters.status as any
  }

  if (filters.batchType) {
    where.batchType = filters.batchType as any
  }

  return where
}

/**
 * Build where clause for unpaid salary filtering
 */
export function buildUnpaidSalaryWhereClause(filters: {
  companyId: string
  employeeId?: string
  isResolved?: boolean
  agingBucket?: string
  reason?: string
}): Prisma.UnpaidSalaryRegisterWhereInput {
  const where: Prisma.UnpaidSalaryRegisterWhereInput = {
    companyId: filters.companyId
  }

  if (filters.employeeId) {
    where.employeeId = filters.employeeId
  }

  if (filters.isResolved !== undefined) {
    where.isResolved = filters.isResolved
  }

  if (filters.agingBucket) {
    where.agingBucket = filters.agingBucket
  }

  if (filters.reason) {
    where.reason = filters.reason as any
  }

  return where
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate UTR number format
 */
export function isValidUTR(utr: string): boolean {
  // UTR is typically alphanumeric, 16-22 characters
  return /^[A-Z0-9]{16,22}$/i.test(utr)
}

/**
 * Validate batch number format
 */
export function isValidBatchNumber(batchNumber: string): boolean {
  // Example: BATCH-2024-11-001
  return /^BATCH-\d{4}-\d{2}-\d{3,}$/i.test(batchNumber)
}

/**
 * Validate payment amount
 */
export function isValidPaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000000 // Max 10M
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const AGING_BUCKETS = [
  'Current',
  '1-30 Days',
  '31-60 Days',
  '60+ Days'
] as const

export const PAYSLIP_STATUSES = [
  'pending',
  'processing',
  'on-hold',
  'paid',
  'failed',
  'partially-paid'
] as const

export const PAYMENT_BATCH_STATUSES = [
  'draft',
  'approved',
  'sent_to_bank',
  'processing',
  'completed',
  'failed',
  'partially_completed'
] as const

export const BATCH_TYPES = [
  'regular',
  'fnf',
  'bonus',
  'arrears',
  'advance',
  'reprocess'
] as const

export const RECONCILIATION_STATUSES = [
  'pending',
  'in-progress',
  'matched',
  'mismatched',
  'approved'
] as const

export const UNPAID_REASONS = [
  'on-hold',
  'payment-failed',
  'bank-issue',
  'compliance-issue',
  'documentation-pending',
  'other'
] as const

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isPayslipPaid(payslip: { status: string }): boolean {
  return payslip.status === 'paid'
}

export function isPayslipOnHold(payslip: { status: string }): boolean {
  return payslip.status === 'on-hold'
}

export function isBatchCompleted(batch: { status: string }): boolean {
  return batch.status === 'completed'
}

export function isReconciliationMatched(reconciliation: { status: string }): boolean {
  return reconciliation.status === 'matched' || reconciliation.status === 'approved'
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export type {
  Prisma,
}
