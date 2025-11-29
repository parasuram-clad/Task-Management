# UTR Tracking & Payroll Reconciliation Specification

## Executive Summary

This specification outlines the implementation of **Unique Transaction Reference (UTR) tracking** at the employee level within the payroll system to meet Internal Financial Control (IFC) requirements under the Companies Act, 2013, and to support statutory audit compliance under SA 315 and SA 330.

---

## Business Requirement

### Objective
Transform HRMS from a transactional data system into a validated control environment fully integrated with the company's financial reporting framework by implementing employee-level UTR tracking for every salary payment.

### Regulatory Context
- **Section 134(5)(e) – Companies Act, 2013**: Board responsibility for establishing adequate internal financial controls
- **Section 143(3)(i) – Companies Act, 2013 with CARO 2020 – Clause 3(xvii)**: Statutory auditor reporting on IFC adequacy
- **SA 315**: Identifying and Assessing the Risks of Material Misstatement
- **SA 330**: The Auditor's Responses to Assessed Risks

### Key Principle
**UTR numbers must be captured at the employee level within every batch of payment**, ensuring one-to-one linkage between HRMS, banking transactions, and accounting systems.

---

## Use Cases

### Use Case 1: Salary on Hold
**Scenario**: Employee salary placed on hold due to pending clearance or compliance issues.

**Workflow**:
1. Payroll cycle is processed including the on-hold employee
2. Payslip is generated but marked as "on-hold" status
3. Employee is excluded from payment batch
4. Salary payable liability remains in books
5. When released, UTR is captured separately for this employee
6. Payment status updated to "paid" with UTR reference
7. Liability cleared upon UTR confirmation

**System Requirements**:
- Flag payslips as "on-hold" with reason
- Track release authorization
- Capture UTR post-release
- Reconcile released payments

### Use Case 2: Full and Final Settlement (FnF)
**Scenario**: Employee exit with FnF payment separate from regular payroll.

**Workflow**:
1. FnF computation completed in HRMS
2. Special payslip generated marked as "FnF"
3. FnF payment processed in separate batch
4. Individual UTR captured for the FnF transaction
5. Settlement mapped to "Settlement Payable" ledger
6. Finance reconciles FnF payment with UTR evidence

**System Requirements**:
- FnF flag on payslips
- Separate payment batch handling
- Settlement-specific UTR tracking
- FnF reconciliation reports

### Use Case 3: Monthly Reconciliation
**Scenario**: Month-end reconciliation between HRMS, Bank, and ERP.

**Workflow**:
1. Payroll processed and approved
2. Payment batches sent to bank
3. Bank returns UTR numbers for each transaction
4. UTRs uploaded to HRMS against each employee
5. System auto-matches:
   - Employees with UTR = Paid (clear liability)
   - Employees without UTR = Unpaid (retain liability)
6. Reconciliation report generated showing:
   - Total payable as per payroll
   - Total paid as per UTR
   - Outstanding/unpaid salaries
   - Exceptions and mismatches

**System Requirements**:
- UTR upload interface (individual and bulk)
- Auto-reconciliation engine
- Exception management
- Detailed reconciliation reports

### Use Case 4: Partial Payment & Reprocessing
**Scenario**: Some payments fail in batch processing.

**Workflow**:
1. Batch of 500 employees sent to bank
2. 495 succeed, 5 fail (insufficient balance, account issues)
3. Bank provides UTRs for 495 successful transactions
4. Failed 5 remain in "processing" or "failed" status
5. Finance reprocesses failed payments
6. New UTRs captured for reprocessed payments
7. All 500 eventually marked as "paid" with UTR evidence

**System Requirements**:
- Track payment failures
- Reprocessing workflow
- Multiple UTR attempts tracking
- Payment history log

---

## Internal Financial Control (IFC) Framework

### A. Authorization & Master Data Control
**Objective**: Ensure only valid and approved employees are paid.

**Controls**:
- New joiner approval workflow
- Bank account validation
- Active employee verification before payroll inclusion
- Dual authorization for master data changes

**Evidence**: Approved employee master, bank account verification report

### B. Payroll Calculation Control
**Objective**: Ensure accuracy of gross pay, deductions, taxes, and net pay.

**Controls**:
- Automated payroll calculation with audit trail
- Monthly payroll review and approval
- TDS/EPF/ESI compliance verification
- Variance analysis month-over-month

**Evidence**: Payroll computation report, statutory compliance report

### C. Payment & Disbursement Control
**Objective**: Ensure payments are made only to legitimate employees in correct amounts.

**Controls**:
- **UTR-wise mapping to employee bank accounts** ✅ (PRIMARY CONTROL)
- Exception report for unprocessed payments
- Duplicate payment prevention
- Payment batch approval workflow
- Bank file generation with validation

**Evidence**: UTR mapping report, payment exception report, batch approval records

### D. Accounting & Reconciliation Control
**Objective**: Ensure payroll expense and liability accounts reconcile with HRMS and bank records.

**Controls**:
- **Employee-wise reconciliation using UTR data** ✅ (PRIMARY CONTROL)
- Monthly reconciliation of:
  - Salary Payable (ERP) vs Payroll Processed (HRMS)
  - Salary Paid (Bank) vs UTR Recorded (HRMS)
- Outstanding salary liability tracking
- Cut-off verification

**Evidence**: Monthly reconciliation statement, UTR-based payment proof

### E. Reporting & Disclosure Control
**Objective**: Ensure proper classification and disclosure in financial statements.

**Controls**:
- Monthly payroll MIS with UTR confirmation
- Provision for unpaid salaries (without UTR)
- Audit trail for all payment status changes
- Financial statement disclosure accuracy

**Evidence**: Payroll MIS, unpaid salary register, audit documentation

---

## Database Schema Changes

### 1. Enhanced Payslips Table

```sql
ALTER TABLE payslips
ADD COLUMN payment_batch_id UUID REFERENCES payment_batches(id),
ADD COLUMN utr_number VARCHAR(50),
ADD COLUMN utr_upload_date TIMESTAMP,
ADD COLUMN utr_uploaded_by UUID REFERENCES employees(id),
ADD COLUMN actual_payment_date DATE,
ADD COLUMN bank_reference VARCHAR(100),
ADD COLUMN payment_remarks TEXT,
ADD COLUMN is_fnf BOOLEAN DEFAULT false,
ADD COLUMN hold_reason TEXT,
ADD COLUMN hold_approved_by UUID REFERENCES employees(id),
ADD COLUMN released_at TIMESTAMP,
ADD COLUMN released_by UUID REFERENCES employees(id),
ADD COLUMN payment_attempt_count INTEGER DEFAULT 0,
ADD COLUMN last_payment_attempt_date TIMESTAMP,
ADD COLUMN payment_failure_reason TEXT;

-- Modify status enum to include more states
ALTER TABLE payslips
DROP CONSTRAINT IF EXISTS payslips_status_check,
ADD CONSTRAINT payslips_status_check 
CHECK (status IN ('pending', 'processing', 'on-hold', 'paid', 'failed', 'partially-paid'));

-- Add index for UTR lookup
CREATE INDEX idx_payslips_utr_number ON payslips(utr_number);
CREATE INDEX idx_payslips_payment_batch_id ON payslips(payment_batch_id);
CREATE INDEX idx_payslips_status ON payslips(status);
CREATE INDEX idx_payslips_is_fnf ON payslips(is_fnf);
```

### 2. New Table: Payment Batches

```sql
CREATE TABLE payment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id),
    batch_number VARCHAR(50) NOT NULL,
    batch_name VARCHAR(255) NOT NULL,
    batch_type VARCHAR(30) DEFAULT 'regular' CHECK (batch_type IN ('regular', 'fnf', 'bonus', 'arrears', 'advance', 'reprocess')),
    
    -- Batch Details
    total_employees INTEGER NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    -- Batch Status
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent_to_bank', 'processing', 'completed', 'failed', 'partially_completed')),
    
    -- Workflow
    prepared_by UUID NOT NULL REFERENCES employees(id),
    prepared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    sent_to_bank_by UUID REFERENCES employees(id),
    sent_to_bank_at TIMESTAMP,
    
    -- Bank Integration
    bank_file_name VARCHAR(255),
    bank_file_path TEXT,
    bank_reference_number VARCHAR(100),
    bank_response_file TEXT,
    bank_response_received_at TIMESTAMP,
    
    -- Tracking
    employees_paid INTEGER DEFAULT 0,
    employees_failed INTEGER DEFAULT 0,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    amount_failed DECIMAL(15, 2) DEFAULT 0,
    
    -- Remarks
    remarks TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, batch_number)
);

CREATE INDEX idx_payment_batches_company_id ON payment_batches(company_id);
CREATE INDEX idx_payment_batches_payroll_cycle_id ON payment_batches(payroll_cycle_id);
CREATE INDEX idx_payment_batches_status ON payment_batches(status);
CREATE INDEX idx_payment_batches_batch_type ON payment_batches(batch_type);
```

### 3. New Table: Payment Reconciliation

```sql
CREATE TABLE payroll_reconciliation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id),
    reconciliation_date DATE NOT NULL,
    reconciliation_period VARCHAR(20) NOT NULL, -- e.g., "2024-11", "2024-Q4"
    
    -- HRMS Data
    hrms_total_payable DECIMAL(15, 2) NOT NULL,
    hrms_total_employees INTEGER NOT NULL,
    
    -- Bank Data (from UTRs)
    bank_total_paid DECIMAL(15, 2) NOT NULL,
    bank_total_transactions INTEGER NOT NULL,
    
    -- ERP Data
    erp_salary_expense DECIMAL(15, 2),
    erp_salary_payable DECIMAL(15, 2),
    
    -- Reconciliation Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'matched', 'mismatched', 'approved')),
    variance_amount DECIMAL(15, 2),
    variance_count INTEGER,
    
    -- Details
    matched_employees INTEGER DEFAULT 0,
    unmatched_employees INTEGER DEFAULT 0,
    on_hold_employees INTEGER DEFAULT 0,
    failed_payments INTEGER DEFAULT 0,
    
    -- Remarks
    reconciliation_notes TEXT,
    exception_details JSONB,
    
    -- Workflow
    reconciled_by UUID REFERENCES employees(id),
    reconciled_at TIMESTAMP,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(company_id, payroll_cycle_id, reconciliation_date)
);

CREATE INDEX idx_payroll_reconciliation_company_id ON payroll_reconciliation(company_id);
CREATE INDEX idx_payroll_reconciliation_cycle_id ON payroll_reconciliation(payroll_cycle_id);
CREATE INDEX idx_payroll_reconciliation_status ON payroll_reconciliation(status);
```

### 4. New Table: Payment Audit Trail

```sql
CREATE TABLE payment_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payslip_id UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    
    -- Change Details
    action VARCHAR(50) NOT NULL, -- 'status_change', 'utr_uploaded', 'hold_applied', 'hold_released', 'payment_failed', 'reprocessed'
    old_status VARCHAR(30),
    new_status VARCHAR(30),
    old_utr VARCHAR(50),
    new_utr VARCHAR(50),
    
    -- Context
    performed_by UUID NOT NULL REFERENCES employees(id),
    reason TEXT,
    remarks TEXT,
    metadata JSONB,
    
    -- Tracking
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_audit_trail_payslip_id ON payment_audit_trail(payslip_id);
CREATE INDEX idx_payment_audit_trail_action ON payment_audit_trail(action);
CREATE INDEX idx_payment_audit_trail_created_at ON payment_audit_trail(created_at);
```

### 5. New Table: Unpaid Salary Register

```sql
CREATE TABLE unpaid_salary_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payslip_id UUID NOT NULL REFERENCES payslips(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id),
    
    -- Payslip Details
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    net_salary DECIMAL(12, 2) NOT NULL,
    
    -- Unpaid Status
    reason VARCHAR(50) CHECK (reason IN ('on-hold', 'payment-failed', 'bank-issue', 'compliance-issue', 'other')),
    reason_details TEXT,
    hold_applied_date DATE,
    hold_applied_by UUID REFERENCES employees(id),
    
    -- Resolution
    is_resolved BOOLEAN DEFAULT false,
    resolved_date DATE,
    resolved_by UUID REFERENCES employees(id),
    resolution_remarks TEXT,
    
    -- Aging
    days_unpaid INTEGER,
    aging_bucket VARCHAR(20), -- 'Current', '1-30 Days', '31-60 Days', '60+ Days'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(payslip_id)
);

CREATE INDEX idx_unpaid_salary_company_id ON unpaid_salary_register(company_id);
CREATE INDEX idx_unpaid_salary_employee_id ON unpaid_salary_register(employee_id);
CREATE INDEX idx_unpaid_salary_is_resolved ON unpaid_salary_register(is_resolved);
CREATE INDEX idx_unpaid_salary_aging_bucket ON unpaid_salary_register(aging_bucket);
```

---

## API Endpoints

### Payment Batch Management

#### POST /api/payroll/payment-batches
- Create payment batch for payroll cycle
- Input: { payroll_cycle_id, batch_name, batch_type, employee_ids[], remarks }
- Output: { batch }
- Access: Finance/Accounts/Admin

#### GET /api/payroll/payment-batches
- List all payment batches
- Query: ?payroll_cycle_id=xxx&status=approved&batch_type=regular
- Output: { batches[], total }
- Access: Finance/Accounts/Admin

#### GET /api/payroll/payment-batches/:id
- Get batch details with employee list
- Output: { batch, payslips[], summary }
- Access: Finance/Accounts/Admin

#### POST /api/payroll/payment-batches/:id/approve
- Approve payment batch
- Output: { batch }
- Access: Finance/Admin

#### POST /api/payroll/payment-batches/:id/send-to-bank
- Mark batch as sent to bank, generate bank file
- Output: { batch, bank_file_url }
- Access: Finance/Accounts/Admin

#### POST /api/payroll/payment-batches/:id/generate-bank-file
- Generate bank payment file (NEFT/RTGS format)
- Output: { file_url, file_name }
- Access: Finance/Accounts/Admin

### UTR Management

#### POST /api/payroll/payslips/:id/upload-utr
- Upload UTR for single payslip
- Input: { utr_number, actual_payment_date, bank_reference, remarks }
- Output: { payslip }
- Access: Finance/Accounts/Admin
- **Creates audit trail entry**

#### POST /api/payroll/payment-batches/:id/upload-utrs
- Bulk upload UTRs for entire batch
- Input: { utrs: [{ payslip_id, utr_number, payment_date, bank_reference }] }
- Output: { success_count, failed_count, errors[] }
- Access: Finance/Accounts/Admin
- **Creates audit trail entries for all**

#### POST /api/payroll/payment-batches/:id/upload-utr-file
- Upload bank response file (CSV/Excel) with UTR mappings
- Input: FormData with file
- Output: { processed: int, success: int, failed: int, errors[] }
- Access: Finance/Accounts/Admin
- **File format**: employee_id, payslip_id, utr_number, payment_date, amount, status

#### GET /api/payroll/payslips/:id/utr-status
- Check UTR status and payment confirmation
- Output: { payslip, has_utr: boolean, payment_status, utr_details }
- Access: Finance/Accounts/Admin/Employee (own)

#### PUT /api/payroll/payslips/:id/update-utr
- Update UTR details (corrections)
- Input: { utr_number, payment_date, remarks }
- Output: { payslip }
- Access: Finance/Admin only
- **Requires reason, creates audit trail**

### Salary Hold Management

#### POST /api/payroll/payslips/:id/hold
- Place salary on hold
- Input: { reason, reason_details, approved_by }
- Output: { payslip }
- Access: HR/Finance/Admin
- **Creates unpaid salary register entry**

#### POST /api/payroll/payslips/:id/release
- Release held salary
- Input: { release_reason, remarks }
- Output: { payslip }
- Access: HR/Finance/Admin
- **Updates unpaid salary register**

#### GET /api/payroll/held-salaries
- List all salaries on hold
- Query: ?employee_id=xxx&reason=compliance-issue
- Output: { held_salaries[], total }
- Access: HR/Finance/Admin

### Payment Failure Management

#### POST /api/payroll/payslips/:id/mark-failed
- Mark payment as failed
- Input: { failure_reason, remarks }
- Output: { payslip }
- Access: Finance/Accounts/Admin

#### POST /api/payroll/payslips/:id/reprocess
- Reprocess failed payment
- Input: { remarks }
- Output: { payslip }
- Access: Finance/Accounts/Admin

#### GET /api/payroll/failed-payments
- List all failed payments
- Query: ?payroll_cycle_id=xxx&employee_id=xxx
- Output: { failed_payments[], total }
- Access: Finance/Accounts/Admin

### Reconciliation

#### POST /api/payroll/reconciliation/initiate
- Initiate reconciliation for payroll cycle
- Input: { payroll_cycle_id, reconciliation_date }
- Output: { reconciliation }
- Access: Finance/Admin

#### GET /api/payroll/reconciliation/:id
- Get reconciliation details
- Output: { reconciliation, matched[], unmatched[], on_hold[], failed[] }
- Access: Finance/Admin

#### POST /api/payroll/reconciliation/:id/approve
- Approve reconciliation
- Input: { remarks }
- Output: { reconciliation }
- Access: Finance/Admin

#### GET /api/payroll/reconciliation/report
- Generate reconciliation report
- Query: ?payroll_cycle_id=xxx&format=pdf
- Output: PDF/Excel report
- Access: Finance/Admin

#### GET /api/payroll/reconciliation/dashboard
- Reconciliation dashboard with KPIs
- Query: ?period=2024-11
- Output: { 
    total_payable, 
    total_paid, 
    variance,
    matched_percentage,
    unpaid_count,
    on_hold_count,
    failed_count
  }
- Access: Finance/Admin

### Reports

#### GET /api/payroll/reports/utr-tracking
- UTR tracking report
- Query: ?payroll_cycle_id=xxx&status=paid&format=excel
- Output: Report with all payslips and UTR status
- Access: Finance/Admin

#### GET /api/payroll/reports/unpaid-salaries
- Unpaid salary register report
- Query: ?aging_bucket=60+ Days&format=pdf
- Output: Report of all unpaid salaries with aging
- Access: Finance/Admin

#### GET /api/payroll/reports/payment-status
- Payment status summary
- Query: ?payroll_cycle_id=xxx
- Output: { 
    total: int,
    paid: int,
    pending: int,
    on_hold: int,
    failed: int,
    details[]
  }
- Access: Finance/Admin

#### GET /api/payroll/reports/payment-audit-trail
- Payment audit trail report
- Query: ?payslip_id=xxx&from_date=2024-11-01&to_date=2024-11-30
- Output: Complete audit trail of payment status changes
- Access: Finance/Admin

#### GET /api/payroll/reports/fnf-tracking
- Full and Final settlement tracking
- Query: ?status=paid&month=2024-11
- Output: List of all FnF settlements with UTR details
- Access: Finance/HR/Admin

#### GET /api/payroll/reports/bank-reconciliation
- Bank reconciliation statement
- Query: ?payroll_cycle_id=xxx&include_erp_data=true
- Output: Three-way reconciliation (HRMS-Bank-ERP)
- Access: Finance/Admin

---

## UI Components Required

### 1. Payment Batch Management Screen
**Location**: `/payroll/payment-batches`

**Features**:
- Create new payment batch
- Select employees for batch
- Exclude on-hold employees
- Batch approval workflow
- Generate bank file
- Track batch status

### 2. UTR Upload Interface
**Location**: `/payroll/payment-batches/:id/upload-utr`

**Features**:
- **Individual UTR Upload**: Single payslip UTR entry
- **Bulk UTR Upload**: Manual entry for multiple employees
- **File Upload**: Import bank response file (CSV/Excel)
- Auto-mapping of employee_id/payslip_id to UTR
- Validation and error handling
- Success/failure summary

### 3. Reconciliation Dashboard
**Location**: `/payroll/reconciliation`

**Features**:
- Month/cycle selector
- KPI cards:
  - Total Payable
  - Total Paid (with UTR)
  - Outstanding
  - Variance
  - Match Percentage
- Status breakdown:
  - Paid (with UTR count)
  - Pending
  - On Hold
  - Failed
- Drill-down to employee details
- Export reconciliation report

### 4. Unpaid Salary Register
**Location**: `/payroll/unpaid-salaries`

**Features**:
- List of all unpaid salaries
- Aging analysis
- Filters by:
  - Reason (on-hold, failed, etc.)
  - Aging bucket
  - Department
  - Employee
- Mark as resolved
- Add resolution remarks
- Export to Excel

### 5. Salary Hold Management
**Location**: `/payroll/salary-holds`

**Features**:
- Apply hold with reason
- Approval workflow
- Release held salaries
- Track hold duration
- Bulk release option
- Hold history

### 6. Payment Status Tracker
**Location**: `/payroll/payslips/:id/payment-status`

**Features**:
- Visual payment status timeline
- UTR details display
- Payment attempts history
- Audit trail view
- Reprocess option (if failed)
- Download payment proof

### 7. FnF Settlement Module
**Location**: `/payroll/fnf-settlements`

**Features**:
- Create FnF calculation
- Generate FnF payslip
- Separate payment batch
- UTR tracking
- Settlement report
- Integration with exit process

### 8. Bank File Generation
**Location**: `/payroll/payment-batches/:id/bank-file`

**Features**:
- Select payment mode (NEFT/RTGS/IMPS)
- Generate bank-specific format
- Download bank file
- Track file sent status
- Upload bank response

---

## Workflow Diagrams

### Standard Salary Payment Flow with UTR

```
1. Payroll Processing
   └─> Generate Payslips (Status: pending)

2. Payment Batch Creation
   └─> Group employees into batch
   └─> Exclude on-hold employees
   └─> Batch Status: draft

3. Batch Approval
   └─> Finance review
   └─> Approval by Admin
   └─> Batch Status: approved

4. Bank File Generation
   └─> Generate payment file
   └─> Send to bank
   └─> Batch Status: sent_to_bank
   └─> Payslip Status: processing

5. Bank Processing
   └─> Bank processes payments
   └─> Bank returns response file with UTRs

6. UTR Upload
   └─> Upload bank response file OR
   └─> Manual UTR entry
   └─> System updates payslips
   └─> Payslip Status: paid
   └─> Update actual_payment_date
   └─> Create audit trail entry

7. Reconciliation
   └─> Compare HRMS vs Bank vs ERP
   └─> Match UTRs
   └─> Generate variance report
   └─> Finance approval

8. Month-End Closure
   └─> All UTRs confirmed
   └─> Liabilities cleared
   └─> Financial statements accurate
```

### Salary Hold & Release Flow

```
1. Hold Application
   └─> HR/Finance initiates hold
   └─> Enter hold reason
   └─> Get approval
   └─> Payslip Status: on-hold
   └─> Add to unpaid_salary_register

2. Regular Payroll Continues
   └─> On-hold employee excluded from payment batch
   └─> Liability remains in books

3. Hold Release
   └─> Issue resolved
   └─> HR/Finance releases hold
   └─> Payslip Status: pending
   └─> Update unpaid_salary_register

4. Separate Payment Processing
   └─> Create new batch OR add to next cycle
   └─> Process payment
   └─> Capture UTR
   └─> Payslip Status: paid
   └─> Clear liability
```

### Payment Failure & Reprocessing Flow

```
1. Batch Processing
   └─> 500 employees in batch
   └─> Sent to bank

2. Bank Returns Response
   └─> 495 successful with UTRs
   └─> 5 failed (reasons: account closed, insufficient details, etc.)

3. System Updates
   └─> 495 Payslips Status: paid (UTR recorded)
   └─> 5 Payslips Status: failed
   └─> Record failure reasons
   └─> Notify Finance team

4. Investigation & Correction
   └─> Finance reviews failed payments
   └─> Correct bank details if needed
   └─> Update employee master

5. Reprocessing
   └─> Create reprocess batch
   └─> Send failed 5 to bank again
   └─> Increment payment_attempt_count

6. UTR Capture
   └─> Bank returns new UTRs
   └─> Update payslips
   └─> Status: paid
   └─> Audit trail updated

7. Complete Reconciliation
   └─> All 500 now paid
   └─> All UTRs recorded
```

---

## Integration Points

### 1. Banking System Integration
**Outbound**:
- Payment file generation (NEFT/RTGS format)
- Payment instruction transmission

**Inbound**:
- Bank response file with UTRs
- Payment status updates
- Transaction confirmations

**File Formats**:
- NEFT: As per NPCI format
- RTGS: As per RBI format
- Custom bank formats (ICICI, HDFC, SBI, etc.)

### 2. ERP Integration
**Outbound (HRMS → ERP)**:
- Salary expense posting
- Employee-wise UTR data
- Payment batch details

**Inbound (ERP → HRMS)**:
- Chart of accounts mapping
- Cost center allocations
- Ledger balances for reconciliation

**Integration Method**:
- REST API
- File-based (CSV/Excel)
- Database views/procedures

### 3. Accounting System
**Data Synchronization**:
- Salary payable vs paid reconciliation
- UTR-based payment proof
- Liability clearing entries

**Reconciliation Flow**:
```
HRMS (Payroll Processed) 
  ↓
  UTR Upload
  ↓
Bank Statement (UTR Match)
  ↓
ERP (Accounting Entry)
  ↓
Three-Way Reconciliation
```

---

## Security & Access Control

### Role-Based Permissions

| Action | Finance | Accounts | HR | Admin | Employee |
|--------|---------|----------|----|----|----------|
| Create Payment Batch | ✅ | ✅ | ❌ | ✅ | ❌ |
| Approve Payment Batch | ✅ | ❌ | ❌ | ✅ | ❌ |
| Upload UTR (Single) | ✅ | ✅ | ❌ | ✅ | ❌ |
| Upload UTR (Bulk) | ✅ | ✅ | ❌ | ✅ | ❌ |
| Apply Salary Hold | ✅ | ❌ | ✅ | ✅ | ❌ |
| Release Salary Hold | ✅ | ❌ | ✅ | ✅ | ❌ |
| View UTR Details | ✅ | ✅ | ❌ | ✅ | Own Only |
| Reconciliation | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Unpaid Register | ✅ | ✅ | ✅ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reprocess Payments | ✅ | ✅ | ❌ | ✅ | ❌ |
| Audit Trail View | ✅ | ❌ | ❌ | ✅ | ❌ |

### Audit Trail Requirements

**Every action must be logged**:
- Who performed the action
- When (timestamp)
- What changed (old value → new value)
- Why (reason/remarks)
- From where (IP address)

**Critical Actions Requiring Audit**:
- UTR upload/update
- Salary hold/release
- Payment batch approval
- Status changes
- Reconciliation approval

---

## Reporting Requirements

### 1. Daily Reports
- Payment batches sent today
- UTRs uploaded today
- Failed payments today

### 2. Monthly Reports
- **UTR Tracking Report**: All payslips with UTR status
- **Unpaid Salary Register**: Aging analysis of unpaid salaries
- **Payment Status Summary**: Paid vs Pending breakdown
- **Reconciliation Statement**: HRMS-Bank-ERP matching
- **Exception Report**: Mismatches, failures, holds

### 3. Audit Reports
- **Payment Audit Trail**: Complete history of payment status changes
- **UTR Upload Log**: Who uploaded which UTRs when
- **Hold/Release History**: All salary holds and releases
- **Reprocessing Log**: Failed payment reprocessing history

### 4. Compliance Reports
- **IFC Control Testing**: Evidence for SA 315/330 compliance
- **Statutory Audit Support**: Documentation for auditors
- **Board Reporting**: Summary for Section 134(5)(e) compliance

### 5. Management Reports
- **Payroll Dashboard**: High-level KPIs
- **Variance Analysis**: Budget vs Actual with UTR proof
- **Cost Center Wise**: Salary expenses by department
- **Trend Analysis**: Payment efficiency over time

---

## Data Validation Rules

### UTR Number
- Format: Alphanumeric, typically 16-22 characters
- Must be unique across company
- Cannot be blank when marking as paid
- Cannot be changed without proper authorization and reason

### Payment Date
- Cannot be before payslip creation date
- Cannot be in future
- Should match bank statement date

### Payment Amount
- Must match net salary in payslip
- Variance beyond threshold (e.g., ₹1) requires explanation

### Bank Reference
- Optional but recommended
- Cross-reference with bank statements

### Batch Validation
- Cannot send batch without approval
- Cannot approve batch with on-hold employees included
- Cannot mark batch as completed without all UTRs

---

## Benefits Realization

### 1. Error and Fraud Prevention
- **Before**: Risk of duplicate payments, unauthorized payments
- **After**: One-to-one UTR mapping prevents duplication

### 2. Improved Reconciliation Efficiency
- **Before**: Manual reconciliation taking 5-10 days
- **After**: Automated reconciliation in 1-2 hours

### 3. Accurate Liability Recognition
- **Before**: Salary payable cleared in ERP without proof of payment
- **After**: Liability cleared only when UTR is recorded

### 4. Audit Readiness
- **Before**: Difficulty in providing payment evidence to auditors
- **After**: Complete audit trail with UTR proof available instantly

### 5. Compliance Assurance
- **Before**: Potential IFC deficiency findings
- **After**: Meets SA 315/330 and Companies Act requirements

### 6. Financial Statement Accuracy
- **Before**: Overstated/understated payables due to timing differences
- **After**: Accurate cut-off with UTR-based recognition

---

## Implementation Phases

### Phase 1: Database & API (2 weeks)
- Create new tables
- Modify existing tables
- Develop core APIs
- Unit testing

### Phase 2: UI Development (3 weeks)
- Payment batch screens
- UTR upload interface
- Reconciliation dashboard
- Hold management screens

### Phase 3: Bank Integration (2 weeks)
- Bank file generation
- Response file parsing
- UTR auto-mapping
- Integration testing

### Phase 4: Reporting & Analytics (2 weeks)
- Develop all reports
- Dashboard KPIs
- Export functionality
- Report scheduling

### Phase 5: Testing & UAT (2 weeks)
- End-to-end testing
- User acceptance testing
- Performance testing
- Security audit

### Phase 6: Training & Rollout (1 week)
- User training
- Documentation
- Gradual rollout
- Support and monitoring

**Total Duration**: 12 weeks

---

## Success Metrics

### Operational Metrics
- **UTR Capture Rate**: Target 100% within 48 hours of payment
- **Reconciliation Time**: Reduce from 5 days to 1 day
- **Payment Failure Rate**: Track and reduce month-over-month
- **Hold Resolution Time**: Average time to release held salaries

### Compliance Metrics
- **Audit Findings**: Zero findings related to payment controls
- **IFC Rating**: "Adequate and operating effectively"
- **Documentation Completeness**: 100% UTR evidence available

### Financial Metrics
- **Liability Accuracy**: Zero variance in salary payable
- **Month-End Closure**: 2 days faster
- **Cost Savings**: Reduced manual effort

---

## Conclusion

Implementation of employee-level UTR tracking transforms the HRMS from a standalone transactional system into a fully integrated, validated control environment. This enhancement:

✅ Meets IFC requirements under Companies Act, 2013  
✅ Supports SA 315/330 audit requirements  
✅ Provides complete audit trail for statutory compliance  
✅ Enables three-way reconciliation (HRMS-Bank-ERP)  
✅ Prevents errors, fraud, and duplicate payments  
✅ Ensures accurate financial reporting  
✅ Supports diverse use cases (holds, FnF, failures)  

**Without UTR tracking**: HRMS remains a record of intent  
**With UTR tracking**: HRMS becomes validated proof of execution  

This specification provides the complete blueprint for implementation.
