-- ============================================================================
-- UTR TRACKING & PAYMENT RECONCILIATION ENHANCEMENT
-- ============================================================================
-- This file contains additional tables and modifications for UTR tracking
-- To be applied after the main DATABASE_SCHEMA.sql
-- Implements IFC compliance requirements under Companies Act 2013

-- ============================================================================
-- MODIFY EXISTING PAYSLIPS TABLE
-- ============================================================================

-- Add UTR tracking columns to payslips table
ALTER TABLE payslips
ADD COLUMN IF NOT EXISTS payment_batch_id UUID REFERENCES payment_batches(id),
ADD COLUMN IF NOT EXISTS utr_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS utr_upload_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS utr_uploaded_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS actual_payment_date DATE,
ADD COLUMN IF NOT EXISTS bank_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_remarks TEXT,
ADD COLUMN IF NOT EXISTS is_fnf BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hold_reason TEXT,
ADD COLUMN IF NOT EXISTS hold_approved_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS released_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS payment_attempt_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_attempt_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_failure_reason TEXT;

-- Modify status constraint to include new states
ALTER TABLE payslips
DROP CONSTRAINT IF EXISTS payslips_status_check;

ALTER TABLE payslips
ADD CONSTRAINT payslips_status_check 
CHECK (status IN ('pending', 'processing', 'on-hold', 'paid', 'failed', 'partially-paid'));

-- Add indexes for UTR tracking
CREATE INDEX IF NOT EXISTS idx_payslips_utr_number ON payslips(utr_number) WHERE utr_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payslips_payment_batch_id ON payslips(payment_batch_id) WHERE payment_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payslips_is_fnf ON payslips(is_fnf) WHERE is_fnf = true;
CREATE INDEX IF NOT EXISTS idx_payslips_actual_payment_date ON payslips(actual_payment_date);

-- Add unique constraint for UTR (one UTR per company)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payslips_company_utr 
ON payslips(company_id, utr_number) WHERE utr_number IS NOT NULL;

-- ============================================================================
-- NEW TABLE: PAYMENT BATCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_batches (
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

-- Indexes for payment_batches
CREATE INDEX idx_payment_batches_company_id ON payment_batches(company_id);
CREATE INDEX idx_payment_batches_payroll_cycle_id ON payment_batches(payroll_cycle_id);
CREATE INDEX idx_payment_batches_status ON payment_batches(status);
CREATE INDEX idx_payment_batches_batch_type ON payment_batches(batch_type);
CREATE INDEX idx_payment_batches_sent_to_bank_at ON payment_batches(sent_to_bank_at);

-- Comment
COMMENT ON TABLE payment_batches IS 'Payment batches for salary disbursement with UTR tracking';

-- ============================================================================
-- NEW TABLE: PAYROLL RECONCILIATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS payroll_reconciliation (
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

-- Indexes for payroll_reconciliation
CREATE INDEX idx_payroll_reconciliation_company_id ON payroll_reconciliation(company_id);
CREATE INDEX idx_payroll_reconciliation_cycle_id ON payroll_reconciliation(payroll_cycle_id);
CREATE INDEX idx_payroll_reconciliation_status ON payroll_reconciliation(status);
CREATE INDEX idx_payroll_reconciliation_date ON payroll_reconciliation(reconciliation_date);

-- Comment
COMMENT ON TABLE payroll_reconciliation IS 'Three-way reconciliation between HRMS, Bank, and ERP for IFC compliance';

-- ============================================================================
-- NEW TABLE: PAYMENT AUDIT TRAIL
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payslip_id UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    
    -- Change Details
    action VARCHAR(50) NOT NULL, -- 'status_change', 'utr_uploaded', 'utr_updated', 'hold_applied', 'hold_released', 'payment_failed', 'reprocessed'
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

-- Indexes for payment_audit_trail
CREATE INDEX idx_payment_audit_trail_company_id ON payment_audit_trail(company_id);
CREATE INDEX idx_payment_audit_trail_payslip_id ON payment_audit_trail(payslip_id);
CREATE INDEX idx_payment_audit_trail_action ON payment_audit_trail(action);
CREATE INDEX idx_payment_audit_trail_created_at ON payment_audit_trail(created_at);
CREATE INDEX idx_payment_audit_trail_performed_by ON payment_audit_trail(performed_by);

-- Comment
COMMENT ON TABLE payment_audit_trail IS 'Complete audit trail for all payment-related actions for SA 315/330 compliance';

-- ============================================================================
-- NEW TABLE: UNPAID SALARY REGISTER
-- ============================================================================

CREATE TABLE IF NOT EXISTS unpaid_salary_register (
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
    reason VARCHAR(50) CHECK (reason IN ('on-hold', 'payment-failed', 'bank-issue', 'compliance-issue', 'documentation-pending', 'other')),
    reason_details TEXT,
    hold_applied_date DATE,
    hold_applied_by UUID REFERENCES employees(id),
    
    -- Resolution
    is_resolved BOOLEAN DEFAULT false,
    resolved_date DATE,
    resolved_by UUID REFERENCES employees(id),
    resolution_remarks TEXT,
    
    -- Aging Analysis
    days_unpaid INTEGER,
    aging_bucket VARCHAR(20), -- 'Current', '1-30 Days', '31-60 Days', '60+ Days'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(payslip_id)
);

-- Indexes for unpaid_salary_register
CREATE INDEX idx_unpaid_salary_company_id ON unpaid_salary_register(company_id);
CREATE INDEX idx_unpaid_salary_employee_id ON unpaid_salary_register(employee_id);
CREATE INDEX idx_unpaid_salary_payroll_cycle_id ON unpaid_salary_register(payroll_cycle_id);
CREATE INDEX idx_unpaid_salary_is_resolved ON unpaid_salary_register(is_resolved);
CREATE INDEX idx_unpaid_salary_aging_bucket ON unpaid_salary_register(aging_bucket);
CREATE INDEX idx_unpaid_salary_reason ON unpaid_salary_register(reason);

-- Comment
COMMENT ON TABLE unpaid_salary_register IS 'Register of all unpaid salaries with aging analysis for liability tracking';

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Trigger for payment_batches
CREATE TRIGGER update_payment_batches_updated_at 
BEFORE UPDATE ON payment_batches 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payroll_reconciliation
CREATE TRIGGER update_payroll_reconciliation_updated_at 
BEFORE UPDATE ON payroll_reconciliation 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for unpaid_salary_register
CREATE TRIGGER update_unpaid_salary_register_updated_at 
BEFORE UPDATE ON unpaid_salary_register 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS & PROCEDURES FOR UTR TRACKING
-- ============================================================================

-- Function to auto-update payment_batch status
CREATE OR REPLACE FUNCTION update_payment_batch_status()
RETURNS TRIGGER AS $$
DECLARE
    v_batch_id UUID;
    v_total_employees INTEGER;
    v_paid_count INTEGER;
    v_failed_count INTEGER;
    v_paid_amount DECIMAL(15, 2);
    v_failed_amount DECIMAL(15, 2);
BEGIN
    -- Get batch_id from the payslip
    v_batch_id := NEW.payment_batch_id;
    
    IF v_batch_id IS NOT NULL THEN
        -- Count employees by status
        SELECT COUNT(*) INTO v_total_employees
        FROM payslips
        WHERE payment_batch_id = v_batch_id;
        
        SELECT COUNT(*), COALESCE(SUM(net_salary), 0) INTO v_paid_count, v_paid_amount
        FROM payslips
        WHERE payment_batch_id = v_batch_id AND status = 'paid';
        
        SELECT COUNT(*), COALESCE(SUM(net_salary), 0) INTO v_failed_count, v_failed_amount
        FROM payslips
        WHERE payment_batch_id = v_batch_id AND status = 'failed';
        
        -- Update batch tracking
        UPDATE payment_batches
        SET employees_paid = v_paid_count,
            employees_failed = v_failed_count,
            amount_paid = v_paid_amount,
            amount_failed = v_failed_amount,
            status = CASE
                WHEN v_paid_count = v_total_employees THEN 'completed'
                WHEN v_paid_count > 0 THEN 'partially_completed'
                WHEN v_failed_count = v_total_employees THEN 'failed'
                ELSE status
            END
        WHERE id = v_batch_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update batch status when payslip status changes
CREATE TRIGGER payslip_status_changed
AFTER UPDATE OF status ON payslips
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_payment_batch_status();

-- Function to auto-create audit trail entry
CREATE OR REPLACE FUNCTION create_payment_audit_entry()
RETURNS TRIGGER AS $$
BEGIN
    -- Create audit trail entry for significant changes
    IF (TG_OP = 'UPDATE') THEN
        -- Status change
        IF (OLD.status IS DISTINCT FROM NEW.status) THEN
            INSERT INTO payment_audit_trail (
                company_id, payslip_id, action, 
                old_status, new_status, 
                performed_by, remarks
            ) VALUES (
                NEW.company_id, NEW.id, 'status_change',
                OLD.status, NEW.status,
                NEW.utr_uploaded_by, -- Assuming this is the last modifier
                NEW.payment_remarks
            );
        END IF;
        
        -- UTR uploaded or updated
        IF (OLD.utr_number IS DISTINCT FROM NEW.utr_number) THEN
            INSERT INTO payment_audit_trail (
                company_id, payslip_id, 
                action, old_utr, new_utr, 
                performed_by, remarks
            ) VALUES (
                NEW.company_id, NEW.id,
                CASE WHEN OLD.utr_number IS NULL THEN 'utr_uploaded' ELSE 'utr_updated' END,
                OLD.utr_number, NEW.utr_number,
                NEW.utr_uploaded_by,
                NEW.payment_remarks
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for audit trail
CREATE TRIGGER payment_audit_trigger
AFTER UPDATE ON payslips
FOR EACH ROW
EXECUTE FUNCTION create_payment_audit_entry();

-- Function to auto-update unpaid salary register
CREATE OR REPLACE FUNCTION manage_unpaid_salary_register()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- When status changes to on-hold, add to register
        IF (NEW.status = 'on-hold' AND OLD.status != 'on-hold') THEN
            INSERT INTO unpaid_salary_register (
                company_id, payslip_id, employee_id, payroll_cycle_id,
                month, year, net_salary, reason, reason_details,
                hold_applied_date, hold_applied_by, days_unpaid, aging_bucket
            ) VALUES (
                NEW.company_id, NEW.id, NEW.employee_id, NEW.payroll_cycle_id,
                NEW.month, NEW.year, NEW.net_salary, 
                COALESCE(NEW.hold_reason, 'other'), NEW.payment_remarks,
                CURRENT_DATE, NEW.hold_approved_by, 0, 'Current'
            )
            ON CONFLICT (payslip_id) DO NOTHING;
        
        -- When status changes from on-hold to paid, mark as resolved
        ELSIF (NEW.status = 'paid' AND OLD.status = 'on-hold') THEN
            UPDATE unpaid_salary_register
            SET is_resolved = true,
                resolved_date = CURRENT_DATE,
                resolved_by = NEW.utr_uploaded_by,
                resolution_remarks = 'Payment completed with UTR: ' || NEW.utr_number
            WHERE payslip_id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for unpaid salary register
CREATE TRIGGER unpaid_salary_register_trigger
AFTER UPDATE ON payslips
FOR EACH ROW
EXECUTE FUNCTION manage_unpaid_salary_register();

-- Function to calculate aging for unpaid salaries
CREATE OR REPLACE FUNCTION update_unpaid_salary_aging()
RETURNS void AS $$
BEGIN
    UPDATE unpaid_salary_register
    SET days_unpaid = CURRENT_DATE - hold_applied_date,
        aging_bucket = CASE
            WHEN CURRENT_DATE - hold_applied_date <= 0 THEN 'Current'
            WHEN CURRENT_DATE - hold_applied_date BETWEEN 1 AND 30 THEN '1-30 Days'
            WHEN CURRENT_DATE - hold_applied_date BETWEEN 31 AND 60 THEN '31-60 Days'
            ELSE '60+ Days'
        END
    WHERE is_resolved = false;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily (use pg_cron or external scheduler)
-- SELECT cron.schedule('update-unpaid-aging', '0 2 * * *', 'SELECT update_unpaid_salary_aging()');

-- ============================================================================
-- VIEWS FOR UTR TRACKING & RECONCILIATION
-- ============================================================================

-- View: Payment Status Summary
CREATE OR REPLACE VIEW v_payment_status_summary AS
SELECT 
    pc.id AS payroll_cycle_id,
    pc.company_id,
    pc.month,
    pc.year,
    COUNT(p.id) AS total_employees,
    SUM(p.net_salary) AS total_payable,
    
    COUNT(CASE WHEN p.status = 'paid' THEN 1 END) AS paid_count,
    SUM(CASE WHEN p.status = 'paid' THEN p.net_salary ELSE 0 END) AS paid_amount,
    
    COUNT(CASE WHEN p.status = 'pending' THEN 1 END) AS pending_count,
    SUM(CASE WHEN p.status = 'pending' THEN p.net_salary ELSE 0 END) AS pending_amount,
    
    COUNT(CASE WHEN p.status = 'on-hold' THEN 1 END) AS on_hold_count,
    SUM(CASE WHEN p.status = 'on-hold' THEN p.net_salary ELSE 0 END) AS on_hold_amount,
    
    COUNT(CASE WHEN p.status = 'failed' THEN 1 END) AS failed_count,
    SUM(CASE WHEN p.status = 'failed' THEN p.net_salary ELSE 0 END) AS failed_amount,
    
    COUNT(CASE WHEN p.utr_number IS NOT NULL THEN 1 END) AS utr_captured_count,
    SUM(CASE WHEN p.utr_number IS NOT NULL THEN p.net_salary ELSE 0 END) AS utr_captured_amount
    
FROM payroll_cycles pc
LEFT JOIN payslips p ON pc.id = p.payroll_cycle_id
GROUP BY pc.id, pc.company_id, pc.month, pc.year;

-- View: Unpaid Salaries with Employee Details
CREATE OR REPLACE VIEW v_unpaid_salaries_detail AS
SELECT 
    usr.id,
    usr.company_id,
    usr.employee_id,
    e.employee_id AS emp_code,
    u.name AS employee_name,
    u.email,
    e.department,
    e.designation,
    usr.month,
    usr.year,
    usr.net_salary,
    usr.reason,
    usr.reason_details,
    usr.hold_applied_date,
    usr.days_unpaid,
    usr.aging_bucket,
    usr.is_resolved,
    usr.resolved_date,
    holder.name AS held_by_name,
    resolver.name AS resolved_by_name
FROM unpaid_salary_register usr
JOIN employees e ON usr.employee_id = e.id
JOIN users u ON e.user_id = u.id
LEFT JOIN employees hold_emp ON usr.hold_applied_by = hold_emp.id
LEFT JOIN users holder ON hold_emp.user_id = holder.id
LEFT JOIN employees resolve_emp ON usr.resolved_by = resolve_emp.id
LEFT JOIN users resolver ON resolve_emp.user_id = resolver.id;

-- View: Payment Batch Status
CREATE OR REPLACE VIEW v_payment_batch_status AS
SELECT 
    pb.id AS batch_id,
    pb.company_id,
    pb.batch_number,
    pb.batch_name,
    pb.batch_type,
    pb.status,
    pb.total_employees,
    pb.total_amount,
    pb.employees_paid,
    pb.employees_failed,
    pb.amount_paid,
    pb.amount_failed,
    pb.prepared_at,
    preparer.name AS prepared_by_name,
    pb.approved_at,
    approver.name AS approved_by_name,
    pb.sent_to_bank_at,
    pc.month,
    pc.year,
    ROUND((pb.employees_paid::DECIMAL / NULLIF(pb.total_employees, 0)) * 100, 2) AS completion_percentage
FROM payment_batches pb
JOIN payroll_cycles pc ON pb.payroll_cycle_id = pc.id
JOIN employees prep_emp ON pb.prepared_by = prep_emp.id
JOIN users preparer ON prep_emp.user_id = preparer.id
LEFT JOIN employees app_emp ON pb.approved_by = app_emp.id
LEFT JOIN users approver ON app_emp.user_id = approver.id;

-- View: Reconciliation Summary
CREATE OR REPLACE VIEW v_reconciliation_summary AS
SELECT 
    pr.id,
    pr.company_id,
    pr.payroll_cycle_id,
    pc.month,
    pc.year,
    pr.reconciliation_date,
    pr.status,
    pr.hrms_total_payable,
    pr.hrms_total_employees,
    pr.bank_total_paid,
    pr.bank_total_transactions,
    pr.variance_amount,
    pr.matched_employees,
    pr.unmatched_employees,
    pr.on_hold_employees,
    pr.failed_payments,
    ROUND((pr.matched_employees::DECIMAL / NULLIF(pr.hrms_total_employees, 0)) * 100, 2) AS match_percentage,
    reconciler.name AS reconciled_by_name,
    pr.reconciled_at,
    approver.name AS approved_by_name,
    pr.approved_at
FROM payroll_reconciliation pr
JOIN payroll_cycles pc ON pr.payroll_cycle_id = pc.id
LEFT JOIN employees rec_emp ON pr.reconciled_by = rec_emp.id
LEFT JOIN users reconciler ON rec_emp.user_id = reconciler.id
LEFT JOIN employees app_emp ON pr.approved_by = app_emp.id
LEFT JOIN users approver ON app_emp.user_id = approver.id;

-- ============================================================================
-- SAMPLE QUERIES FOR REPORTING
-- ============================================================================

-- Query: UTR Tracking Report for a Payroll Cycle
/*
SELECT 
    e.employee_id,
    u.name AS employee_name,
    p.month,
    p.year,
    p.net_salary,
    p.status,
    p.utr_number,
    p.actual_payment_date,
    p.bank_reference,
    pb.batch_number,
    pb.batch_name,
    CASE WHEN p.utr_number IS NOT NULL THEN 'Yes' ELSE 'No' END AS utr_captured
FROM payslips p
JOIN employees e ON p.employee_id = e.id
JOIN users u ON e.user_id = u.id
LEFT JOIN payment_batches pb ON p.payment_batch_id = pb.id
WHERE p.payroll_cycle_id = '<payroll_cycle_id>'
ORDER BY e.employee_id;
*/

-- Query: Unpaid Salaries Aging Report
/*
SELECT 
    aging_bucket,
    COUNT(*) AS employee_count,
    SUM(net_salary) AS total_amount,
    AVG(days_unpaid) AS avg_days_unpaid
FROM unpaid_salary_register
WHERE is_resolved = false
  AND company_id = '<company_id>'
GROUP BY aging_bucket
ORDER BY 
    CASE aging_bucket
        WHEN 'Current' THEN 1
        WHEN '1-30 Days' THEN 2
        WHEN '31-60 Days' THEN 3
        WHEN '60+ Days' THEN 4
    END;
*/

-- Query: Three-Way Reconciliation (HRMS-Bank-ERP)
/*
SELECT 
    pc.month,
    pc.year,
    pc.total_amount AS hrms_payable,
    pr.bank_total_paid AS bank_paid,
    pr.erp_salary_expense AS erp_expense,
    (pc.total_amount - pr.bank_total_paid) AS hrms_bank_variance,
    (pr.bank_total_paid - pr.erp_salary_expense) AS bank_erp_variance,
    pr.status AS reconciliation_status
FROM payroll_cycles pc
LEFT JOIN payroll_reconciliation pr ON pc.id = pr.payroll_cycle_id
WHERE pc.company_id = '<company_id>'
  AND pc.year = 2024
ORDER BY pc.year DESC, 
    CASE pc.month
        WHEN 'January' THEN 1 WHEN 'February' THEN 2 WHEN 'March' THEN 3
        WHEN 'April' THEN 4 WHEN 'May' THEN 5 WHEN 'June' THEN 6
        WHEN 'July' THEN 7 WHEN 'August' THEN 8 WHEN 'September' THEN 9
        WHEN 'October' THEN 10 WHEN 'November' THEN 11 WHEN 'December' THEN 12
    END DESC;
*/

-- ============================================================================
-- END OF UTR TRACKING ENHANCEMENT
-- ============================================================================
