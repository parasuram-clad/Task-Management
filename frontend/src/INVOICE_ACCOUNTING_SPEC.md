# Invoice Management & Accounting Backend Specification

## Table of Contents
1. [Invoice Management](#1-invoice-management)
2. [Accounting & Bookkeeping](#2-accounting--bookkeeping)

---

## 1. Invoice Management

### Data Models

```typescript
Invoice {
  id: string (UUID)
  company_id: string (foreign key)
  invoice_number: string (unique per company)
  client_id?: string (foreign key to Client/Lead)
  client_name: string
  client_email: string
  client_address?: text
  project_id?: string (foreign key to Project)
  project_name?: string
  
  issue_date: date
  due_date: date
  payment_terms: integer (days - e.g., 30, 45, 60)
  
  subtotal: decimal
  tax_rate: decimal
  tax_amount: decimal
  total_amount: decimal
  
  status: enum('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled')
  
  notes?: text
  terms_conditions?: text
  
  sent_at?: timestamp
  viewed_at?: timestamp
  paid_at?: timestamp
  
  created_by: string (foreign key to Employee)
  created_at: timestamp
  updated_at: timestamp
}

InvoiceItem {
  id: string (UUID)
  invoice_id: string (foreign key)
  description: string
  quantity: decimal
  rate: decimal
  amount: decimal (quantity * rate)
  order_index: integer
  created_at: timestamp
  updated_at: timestamp
}

InvoicePayment {
  id: string (UUID)
  invoice_id: string (foreign key)
  amount: decimal
  payment_date: date
  payment_method: enum('bank_transfer', 'credit_card', 'cash', 'cheque', 'other')
  reference_number?: string
  notes?: text
  recorded_by: string (foreign key to Employee)
  created_at: timestamp
}
```

### API Endpoints

#### POST /api/invoices
- Create new invoice (Finance/Accounts/Manager/Admin)
- Input: { client_name, client_email, items[], issue_date, payment_terms, tax_rate, notes, terms_conditions }
- Output: { invoice }

#### GET /api/invoices
- List all invoices
- Query: ?status=sent&client_name=Acme&page=1&limit=10
- Output: { invoices[], total, page, limit }

#### GET /api/invoices/:id
- Get invoice details
- Output: { invoice, items[], payments[], client?, project? }

#### PUT /api/invoices/:id
- Update invoice (Finance/Accounts/Admin)
- Input: { client_name, client_email, items[], due_date, notes, ... }
- Output: { invoice }

#### DELETE /api/invoices/:id
- Delete/Cancel invoice (Finance/Accounts/Admin)
- Output: { success: boolean }

#### POST /api/invoices/:id/send
- Send invoice to client via email
- Output: { invoice, sent: boolean }

#### POST /api/invoices/:id/mark-paid
- Mark invoice as paid
- Input: { payment_amount, payment_date, payment_method, reference_number }
- Output: { invoice, payment }

#### POST /api/invoices/:id/record-payment
- Record partial or full payment
- Input: { amount, payment_date, payment_method, reference_number, notes }
- Output: { payment, invoice }

#### GET /api/invoices/:id/download
- Download invoice as PDF
- Output: PDF file

#### GET /api/invoices/stats
- Get invoice statistics
- Query: ?year=2024&month=11
- Output: { 
    total_revenue, 
    pending_amount, 
    overdue_amount,
    paid_invoices_count,
    pending_invoices_count
  }

#### POST /api/invoices/generate-number
- Generate next invoice number
- Output: { invoice_number }

---

## 2. Accounting & Bookkeeping

### Data Models

```typescript
ChartOfAccounts {
  id: string (UUID)
  company_id: string (foreign key)
  account_code: string (unique per company)
  account_name: string
  account_type: enum('asset', 'liability', 'equity', 'revenue', 'expense')
  parent_account_id?: string (for sub-accounts)
  is_active: boolean
  description?: text
  created_at: timestamp
  updated_at: timestamp
}

JournalEntry {
  id: string (UUID)
  company_id: string (foreign key)
  entry_number: string (unique per company)
  entry_date: date
  description: text
  reference?: string (e.g., invoice number, payment reference)
  status: enum('draft', 'posted', 'reversed')
  posted_by?: string (foreign key to Employee)
  posted_at?: timestamp
  created_by: string (foreign key to Employee)
  created_at: timestamp
  updated_at: timestamp
}

JournalEntryLine {
  id: string (UUID)
  journal_entry_id: string (foreign key)
  account_id: string (foreign key to ChartOfAccounts)
  debit: decimal
  credit: decimal
  description?: text
  created_at: timestamp
}

LedgerEntry {
  id: string (UUID)
  company_id: string (foreign key)
  account_id: string (foreign key to ChartOfAccounts)
  journal_entry_id: string (foreign key)
  transaction_date: date
  description: text
  debit: decimal
  credit: decimal
  balance: decimal (running balance)
  reference?: string
  created_at: timestamp
}

TrialBalance {
  account_code: string
  account_name: string
  account_type: string
  debit_total: decimal
  credit_total: decimal
  balance: decimal
  period_start: date
  period_end: date
}

FinancialStatement {
  type: enum('balance_sheet', 'income_statement', 'cash_flow')
  period_start: date
  period_end: date
  data: jsonb
  generated_at: timestamp
}
```

### API Endpoints

#### POST /api/accounting/chart-of-accounts
- Create account (Finance/Accounts/Admin)
- Input: { account_code, account_name, account_type, parent_account_id?, description }
- Output: { account }

#### GET /api/accounting/chart-of-accounts
- List all accounts
- Query: ?account_type=asset&is_active=true
- Output: { accounts[] }

#### GET /api/accounting/chart-of-accounts/:id
- Get account details
- Output: { account, sub_accounts[], balance }

#### PUT /api/accounting/chart-of-accounts/:id
- Update account (Finance/Accounts/Admin)
- Input: { account_name, is_active, description }
- Output: { account }

#### POST /api/accounting/journal-entries
- Create journal entry (Finance/Accounts/Admin)
- Input: { entry_date, description, reference, lines: [{ account_id, debit, credit, description }] }
- Validation: Total debits must equal total credits
- Output: { journal_entry, lines[] }

#### GET /api/accounting/journal-entries
- List journal entries
- Query: ?status=posted&start_date=2024-11-01&end_date=2024-11-30
- Output: { journal_entries[] }

#### GET /api/accounting/journal-entries/:id
- Get journal entry details
- Output: { journal_entry, lines[] }

#### POST /api/accounting/journal-entries/:id/post
- Post journal entry (makes it final)
- Output: { journal_entry }

#### POST /api/accounting/journal-entries/:id/reverse
- Reverse journal entry
- Output: { original_entry, reversal_entry }

#### GET /api/accounting/ledger
- Get general ledger
- Query: ?account_id=xxx&start_date=2024-11-01&end_date=2024-11-30
- Output: { ledger_entries[], opening_balance, closing_balance }

#### GET /api/accounting/trial-balance
- Get trial balance
- Query: ?start_date=2024-11-01&end_date=2024-11-30
- Output: { trial_balance[], total_debits, total_credits, is_balanced }

#### GET /api/accounting/balance-sheet
- Get balance sheet
- Query: ?as_of_date=2024-11-30
- Output: { 
    assets: { current_assets, fixed_assets, total_assets },
    liabilities: { current_liabilities, long_term_liabilities, total_liabilities },
    equity: { owner_equity, retained_earnings, total_equity },
    total_liabilities_and_equity
  }

#### GET /api/accounting/income-statement
- Get profit & loss statement
- Query: ?start_date=2024-11-01&end_date=2024-11-30
- Output: { 
    revenue: { items[], total },
    expenses: { items[], total },
    gross_profit,
    operating_expenses,
    net_income
  }

#### GET /api/accounting/cash-flow
- Get cash flow statement
- Query: ?start_date=2024-11-01&end_date=2024-11-30
- Output: { 
    operating_activities,
    investing_activities,
    financing_activities,
    net_cash_flow
  }

#### GET /api/accounting/dashboard
- Get accounting dashboard data
- Query: ?period=current-month
- Output: { 
    total_revenue,
    total_expenses,
    net_income,
    profit_margin,
    account_balances[],
    recent_transactions[]
  }

#### POST /api/accounting/reconciliation
- Bank reconciliation
- Input: { bank_account_id, statement_date, ending_balance, transactions[] }
- Output: { reconciliation_report, differences[] }

#### GET /api/accounting/accounts-receivable
- Get accounts receivable aging
- Output: { 
    total_outstanding,
    current,
    days_30,
    days_60,
    days_90_plus,
    details[]
  }

#### GET /api/accounting/accounts-payable
- Get accounts payable aging
- Output: { 
    total_outstanding,
    current,
    days_30,
    days_60,
    days_90_plus,
    details[]
  }

---

## Business Logic

### Invoice Workflow
1. **Draft Creation**
   - Employee creates invoice in draft status
   - Can add/edit items
   - System calculates totals automatically

2. **Send Invoice**
   - Status changes from 'draft' to 'sent'
   - Email sent to client with PDF attachment
   - sent_at timestamp recorded

3. **Client Views**
   - When client opens email link
   - Status changes to 'viewed'
   - viewed_at timestamp recorded

4. **Record Payment**
   - Can record partial or full payment
   - If full amount paid → status = 'paid'
   - If partial → status = 'partial'

5. **Overdue Check**
   - Automated job runs daily
   - If current_date > due_date AND status NOT IN ('paid', 'cancelled')
   - Status = 'overdue'

### Accounting Double-Entry Rules
1. **Every Transaction Has Two Sides**
   - Total debits must equal total credits
   - Validation on journal entry creation

2. **Account Types**
   - Assets: Debit increases, Credit decreases
   - Liabilities: Credit increases, Debit decreases
   - Equity: Credit increases, Debit decreases
   - Revenue: Credit increases, Debit decreases
   - Expenses: Debit increases, Credit decreases

3. **Invoice to Accounting Integration**
   ```
   When invoice is created (draft):
   - No accounting entries

   When invoice is sent:
   - Debit: Accounts Receivable
   - Credit: Revenue

   When payment is recorded:
   - Debit: Cash/Bank
   - Credit: Accounts Receivable
   ```

4. **Payroll to Accounting Integration**
   ```
   When payroll is processed:
   - Debit: Salaries Expense
   - Credit: Cash/Bank
   - Credit: Tax Payable (for withheld taxes)
   - Credit: PF Payable (for provident fund)
   ```

5. **Trial Balance Validation**
   - Run periodically to ensure books balance
   - Total debits = Total credits
   - Generate error report if not balanced

---

## Database Schema (PostgreSQL)

```sql
-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, account_code)
);

-- Journal Entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    posted_by UUID REFERENCES employees(id),
    posted_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, entry_number)
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit DECIMAL(15, 2) DEFAULT 0 CHECK (debit >= 0),
    credit DECIMAL(15, 2) DEFAULT 0 CHECK (credit >= 0),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (debit = 0 OR credit = 0) -- Either debit or credit, not both
);

-- Ledger Entries (Generated from journal entries)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    client_id UUID REFERENCES leads(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_address TEXT,
    project_id UUID REFERENCES projects(id),
    project_name VARCHAR(255),
    
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms INTEGER NOT NULL,
    
    subtotal DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled')),
    
    notes TEXT,
    terms_conditions TEXT,
    
    sent_at TIMESTAMP,
    viewed_at TIMESTAMP,
    paid_at TIMESTAMP,
    
    created_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, invoice_number)
);

-- Invoice Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    rate DECIMAL(15, 2) NOT NULL CHECK (rate >= 0),
    amount DECIMAL(15, 2) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Payments
CREATE TABLE invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'cheque', 'other')),
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX idx_chart_of_accounts_account_type ON chart_of_accounts(account_type);
CREATE INDEX idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_ledger_entries_company_id ON ledger_entries(company_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(transaction_date);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_client_name ON invoices(client_name);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Triggers
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## RBAC (Role-Based Access Control)

### Finance Role
- Full access to Invoice Management
- Full access to Accounting & Bookkeeping
- Can create, edit, delete invoices
- Can create journal entries
- Can view financial reports
- Can approve payroll

### Accounts Role
- Full access to Invoice Management
- Full access to Accounting & Bookkeeping
- Can create, edit invoices
- Can create journal entries
- Can view financial reports
- Can process payroll

### Manager Role
- Can view own team's invoices
- Can create invoices for projects
- Read-only access to accounting dashboard
- Cannot modify journal entries

### Admin Role
- Full access to all financial data
- Can modify chart of accounts
- Can approve/reject all financial transactions
- Full access to all reports

---

## Integration Points

### 1. Invoice → Accounting
When invoice status changes:
```
Status: draft → sent
Action: Create journal entry
  Debit: Accounts Receivable (asset)
  Credit: Revenue

Status: sent/partial → paid
Action: Create journal entry
  Debit: Cash/Bank (asset)
  Credit: Accounts Receivable
```

### 2. Payroll → Accounting
When payroll is processed:
```
Action: Create journal entry
  Debit: Salaries Expense
  Credit: Cash/Bank
  Credit: Tax Payable
  Credit: PF Payable
```

### 3. Project → Invoice
- Link invoices to projects
- Track project billing
- Generate invoices from project milestones

---

## Reporting

### Financial Reports
1. **Balance Sheet**
   - Assets, Liabilities, Equity
   - As of specific date

2. **Income Statement (P&L)**
   - Revenue vs Expenses
   - Net Income/Loss
   - Period comparison

3. **Cash Flow Statement**
   - Operating, Investing, Financing activities
   - Net cash flow

4. **Trial Balance**
   - All accounts with debit/credit totals
   - Validation of books

5. **Accounts Receivable Aging**
   - Outstanding invoices by age
   - Current, 30, 60, 90+ days

6. **Revenue by Client**
   - Top clients by revenue
   - Client payment history

7. **Expense Analysis**
   - Expenses by category
   - Monthly trends

---

## Validation Rules

### Invoice
- Issue date cannot be in future
- Due date must be >= Issue date
- Items must have quantity > 0 and rate >= 0
- Total amount = (Subtotal + Tax)
- At least one item required

### Journal Entry
- Total debits must equal total credits (with tolerance of 0.01)
- Entry date cannot be before fiscal year start
- At least two lines required (one debit, one credit)
- Cannot post entry if not balanced

### Chart of Accounts
- Account code must be unique per company
- Parent account must be of compatible type
- Cannot delete account with transactions
- Can only deactivate accounts with existing data

---

## Performance Considerations

1. **Ledger Balance Calculation**
   - Use running balance in ledger_entries table
   - Update trigger to maintain balance
   - Avoid recalculation on every query

2. **Invoice Aging**
   - Scheduled job to update overdue status
   - Cache aging reports
   - Index on due_date and status

3. **Financial Reports**
   - Cache frequently requested reports
   - Generate and store monthly reports
   - Use materialized views for complex calculations

4. **Account Balance**
   - Maintain summary table for account balances
   - Update on journal entry posting
   - Periodic reconciliation

---

This specification provides complete backend API design for Invoice Management and Accounting/Bookkeeping functionality, integrated with the existing HR & PM system.
