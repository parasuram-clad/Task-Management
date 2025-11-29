# API Endpoints Complete Reference

## Authentication & User Management (16 endpoints)
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - Logout
- POST `/api/auth/refresh-token` - Refresh token
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/change-password` - Change password
- POST `/api/auth/verify-email` - Verify email address
- POST `/api/auth/resend-verification` - Resend verification email
- POST `/api/auth/setup-mfa` - Setup multi-factor authentication
- POST `/api/auth/verify-mfa` - Verify MFA code
- DELETE `/api/auth/disable-mfa` - Disable MFA
- GET `/api/auth/sessions` - List active sessions
- DELETE `/api/auth/sessions/:id` - Revoke session
- POST `/api/auth/impersonate` - Impersonate user (Super Admin only)

## Super Admin Management (12 endpoints)
- GET `/api/superadmin/dashboard` - Platform-wide statistics
- GET `/api/superadmin/companies` - List all companies
- POST `/api/superadmin/companies` - Create new company
- GET `/api/superadmin/companies/:id` - Get company details
- PUT `/api/superadmin/companies/:id` - Update company
- DELETE `/api/superadmin/companies/:id` - Delete/deactivate company
- GET `/api/superadmin/users` - List all platform users
- POST `/api/superadmin/users` - Create platform user
- POST `/api/superadmin/assign-user` - Assign user to company
- DELETE `/api/superadmin/unassign-user` - Remove user from company
- GET `/api/superadmin/analytics` - Platform analytics
- GET `/api/superadmin/audit-logs` - Platform audit logs

## Company Management (15 endpoints)
- POST `/api/companies` - Create company (Super Admin)
- GET `/api/companies` - List companies (Super Admin)
- GET `/api/companies/:id` - Get company details
- PUT `/api/companies/:id` - Update company (Admin)
- DELETE `/api/companies/:id` - Delete company (Super Admin)
- GET `/api/companies/:id/stats` - Company statistics
- GET `/api/companies/:id/members` - List company members
- POST `/api/companies/:id/invite` - Invite user to company
- DELETE `/api/companies/:id/members/:user_id` - Remove member
- PUT `/api/companies/:id/members/:user_id/role` - Update member role
- GET `/api/companies/:id/settings` - Get company settings
- PUT `/api/companies/:id/settings` - Update company settings
- POST `/api/companies/:id/logo` - Upload company logo
- GET `/api/companies/:id/departments` - List departments
- POST `/api/companies/:id/departments` - Create department

## Company Configuration (8 endpoints)
- GET `/api/companies/:id/configuration` - Get complete configuration
- PUT `/api/companies/:id/configuration` - Update full configuration
- GET `/api/companies/:id/features` - Get enabled features
- PUT `/api/companies/:id/features` - Update feature configuration
- GET `/api/companies/:id/branding` - Get branding settings
- PUT `/api/companies/:id/branding` - Update branding (colors, logo)
- GET `/api/companies/:id/security` - Get security settings
- PUT `/api/companies/:id/security` - Update security settings

## Employee Management (12 endpoints)
- POST `/api/employees` - Create employee (HR/Admin)
- GET `/api/employees` - List employees
- GET `/api/employees/:id` - Get employee details
- PUT `/api/employees/:id` - Update employee (HR/Admin)
- DELETE `/api/employees/:id` - Delete employee (HR/Admin)
- GET `/api/employees/:id/hierarchy` - Get reporting hierarchy
- GET `/api/employees/:id/team` - Get team members
- GET `/api/employees/:id/history` - Employment history
- POST `/api/employees/:id/promote` - Promote employee
- POST `/api/employees/:id/transfer` - Transfer employee
- POST `/api/employees/:id/terminate` - Terminate employee
- GET `/api/employees/export` - Export employee data

## Attendance Management (10 endpoints)
- POST `/api/attendance/clock-in` - Clock in
- POST `/api/attendance/clock-out` - Clock out
- GET `/api/attendance/my-attendance` - My attendance records
- GET `/api/attendance/calendar` - Calendar view
- GET `/api/attendance/team` - Team attendance (Manager)
- PUT `/api/attendance/:id/approve` - Approve attendance
- PUT `/api/attendance/:id/reject` - Reject attendance
- GET `/api/attendance/settings` - Get attendance settings
- PUT `/api/attendance/settings` - Update settings (Admin)
- GET `/api/attendance/report` - Generate attendance report

## Timesheet Management (14 endpoints)
- POST `/api/timesheets` - Create timesheet
- GET `/api/timesheets` - List timesheets
- GET `/api/timesheets/:id` - Get timesheet details
- PUT `/api/timesheets/:id` - Update timesheet
- DELETE `/api/timesheets/:id` - Delete timesheet
- POST `/api/timesheets/:id/entries` - Add time entry
- PUT `/api/timesheets/entries/:id` - Update entry
- DELETE `/api/timesheets/entries/:id` - Delete entry
- POST `/api/timesheets/:id/submit` - Submit for approval
- GET `/api/timesheets/pending-approvals` - Pending approvals (Manager)
- POST `/api/timesheets/:id/approve` - Approve timesheet
- POST `/api/timesheets/:id/reject` - Reject timesheet
- GET `/api/timesheets/report` - Timesheet report
- POST `/api/timesheets/export` - Export timesheets

## Leave Management (20 endpoints)
- GET `/api/leaves/types` - List leave types
- POST `/api/leaves/types` - Create leave type (HR/Admin)
- PUT `/api/leaves/types/:id` - Update leave type (HR/Admin)
- DELETE `/api/leaves/types/:id` - Delete leave type (HR/Admin)
- GET `/api/leaves/balance` - My leave balance
- GET `/api/leaves/balance/:employee_id` - Employee balance
- POST `/api/leaves/requests` - Apply for leave
- GET `/api/leaves/requests` - My leave requests
- GET `/api/leaves/requests/:id` - Get leave request
- PUT `/api/leaves/requests/:id` - Update leave request
- DELETE `/api/leaves/requests/:id` - Cancel leave request
- GET `/api/leaves/pending-approvals` - Pending approvals (Manager)
- POST `/api/leaves/requests/:id/approve` - Approve leave
- POST `/api/leaves/requests/:id/reject` - Reject leave
- POST `/api/leaves/allocate` - Allocate leaves (HR/Admin)
- GET `/api/leaves/calendar` - Leave calendar
- GET `/api/leaves/team-calendar` - Team leave calendar
- GET `/api/leaves/report` - Leave report
- POST `/api/leaves/carry-forward` - Carry forward leaves
- GET `/api/leaves/holidays` - Company holidays

## Payroll Management (25 endpoints)
- POST `/api/payroll/cycles` - Create payroll cycle (Finance/Admin)
- GET `/api/payroll/cycles` - List payroll cycles
- GET `/api/payroll/cycles/:id` - Get cycle details
- PUT `/api/payroll/cycles/:id` - Update cycle (Finance/Admin)
- DELETE `/api/payroll/cycles/:id` - Delete cycle (Finance/Admin)
- POST `/api/payroll/cycles/:id/initiate` - Initiate cycle (Finance)
- POST `/api/payroll/cycles/:id/approve` - Approve cycle (Admin/Finance)
- POST `/api/payroll/cycles/:id/reject` - Reject cycle (Admin/Finance)
- POST `/api/payroll/cycles/:id/process` - Process payroll
- POST `/api/payroll/cycles/:id/finalize` - Finalize payroll
- GET `/api/payroll/pending-approvals` - Pending approvals (Admin/Finance)
- GET `/api/payroll/my-payslips` - My payslips
- GET `/api/payroll/payslips/:id` - Get payslip
- GET `/api/payroll/payslips/:id/download` - Download PDF
- POST `/api/payroll/payslips/:id/email` - Email payslip
- GET `/api/payroll/employees` - Employees for payroll
- POST `/api/payroll/calculate` - Calculate payroll
- GET `/api/payroll/components/:employee_id` - Get salary components
- POST `/api/payroll/components` - Add salary component
- PUT `/api/payroll/components/:id` - Update component
- DELETE `/api/payroll/components/:id` - Delete component
- GET `/api/payroll/summary` - Payroll summary
- POST `/api/payroll/export` - Export payroll data
- GET `/api/payroll/statutory-reports` - Statutory reports
- POST `/api/payroll/bulk-process` - Bulk process payroll

## Payment Batch Management (7 endpoints) - NEW
- POST `/api/payroll/payment-batches` - Create payment batch (Finance/Accounts/Admin)
- GET `/api/payroll/payment-batches` - List all payment batches
- GET `/api/payroll/payment-batches/:id` - Get batch details with employee list
- POST `/api/payroll/payment-batches/:id/approve` - Approve payment batch (Finance/Admin)
- POST `/api/payroll/payment-batches/:id/send-to-bank` - Mark batch as sent to bank (Finance/Accounts/Admin)
- POST `/api/payroll/payment-batches/:id/generate-bank-file` - Generate bank payment file (NEFT/RTGS format)
- GET `/api/payroll/payment-batches/:id/status` - Get batch processing status

## UTR Tracking & Management (6 endpoints) - NEW
- POST `/api/payroll/payslips/:id/upload-utr` - Upload UTR for single payslip (Finance/Accounts/Admin)
- POST `/api/payroll/payment-batches/:id/upload-utrs` - Bulk upload UTRs for entire batch
- POST `/api/payroll/payment-batches/:id/upload-utr-file` - Upload bank response file with UTR mappings
- GET `/api/payroll/payslips/:id/utr-status` - Check UTR status and payment confirmation
- PUT `/api/payroll/payslips/:id/update-utr` - Update UTR details (corrections, Finance/Admin only)
- GET `/api/payroll/reports/utr-tracking` - UTR tracking report

## Salary Hold Management (3 endpoints) - NEW
- POST `/api/payroll/payslips/:id/hold` - Place salary on hold (HR/Finance/Admin)
- POST `/api/payroll/payslips/:id/release` - Release held salary (HR/Finance/Admin)
- GET `/api/payroll/held-salaries` - List all salaries on hold

## Payment Failure & Reprocessing (3 endpoints) - NEW
- POST `/api/payroll/payslips/:id/mark-failed` - Mark payment as failed (Finance/Accounts/Admin)
- POST `/api/payroll/payslips/:id/reprocess` - Reprocess failed payment
- GET `/api/payroll/failed-payments` - List all failed payments

## Payroll Reconciliation (6 endpoints) - NEW
- POST `/api/payroll/reconciliation/initiate` - Initiate reconciliation for payroll cycle (Finance/Admin)
- GET `/api/payroll/reconciliation/:id` - Get reconciliation details
- POST `/api/payroll/reconciliation/:id/approve` - Approve reconciliation (Finance/Admin)
- GET `/api/payroll/reconciliation/report` - Generate reconciliation report
- GET `/api/payroll/reconciliation/dashboard` - Reconciliation dashboard with KPIs
- GET `/api/payroll/reconciliation/three-way` - Three-way reconciliation (HRMS-Bank-ERP)

## Project Management (15 endpoints)
- POST `/api/projects` - Create project
- GET `/api/projects` - List projects
- GET `/api/projects/:id` - Get project details
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project
- POST `/api/projects/:id/members` - Add team member
- DELETE `/api/projects/:id/members/:member_id` - Remove member
- PUT `/api/projects/:id/members/:member_id` - Update member role
- GET `/api/projects/:id/activities` - Get activities
- GET `/api/projects/:id/kanban` - Kanban board view
- GET `/api/projects/:id/stats` - Project statistics
- PUT `/api/projects/:id/status` - Update status
- POST `/api/projects/:id/milestones` - Add milestone
- GET `/api/projects/:id/timeline` - Project timeline
- POST `/api/projects/:id/archive` - Archive project

## Task Management (16 endpoints)
- POST `/api/tasks` - Create task
- GET `/api/tasks` - List tasks
- GET `/api/tasks/:id` - Get task details
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task
- POST `/api/tasks/:id/comments` - Add comment
- PUT `/api/tasks/comments/:id` - Update comment
- DELETE `/api/tasks/comments/:id` - Delete comment
- POST `/api/tasks/:id/attachments` - Upload attachment
- DELETE `/api/tasks/attachments/:id` - Delete attachment
- PUT `/api/tasks/:id/status` - Update task status
- PUT `/api/tasks/:id/priority` - Update priority
- POST `/api/tasks/:id/assign` - Assign task
- GET `/api/tasks/my-tasks` - My tasks
- POST `/api/tasks/bulk-update` - Bulk update tasks
- GET `/api/tasks/:id/time-logs` - Get time logs

## Performance & Appraisal (18 endpoints)
- POST `/api/appraisals/cycles` - Create appraisal cycle (HR/Admin)
- GET `/api/appraisals/cycles` - List cycles
- GET `/api/appraisals/cycles/:id` - Get cycle details
- PUT `/api/appraisals/cycles/:id` - Update cycle (HR/Admin)
- DELETE `/api/appraisals/cycles/:id` - Delete cycle (HR/Admin)
- POST `/api/appraisals/cycles/:id/launch` - Launch cycle (HR/Admin)
- POST `/api/appraisals/cycles/:id/close` - Close cycle
- GET `/api/appraisals/templates` - List templates
- POST `/api/appraisals/templates` - Create template (HR/Admin)
- PUT `/api/appraisals/templates/:id` - Update template
- DELETE `/api/appraisals/templates/:id` - Delete template
- GET `/api/appraisals/my-appraisals` - My appraisals
- GET `/api/appraisals/:id` - Get appraisal details
- POST `/api/appraisals/:id/self-assessment` - Submit self assessment
- POST `/api/appraisals/:id/manager-review` - Submit manager review
- POST `/api/appraisals/:id/hr-review` - Submit HR review
- GET `/api/appraisals/pending-reviews` - Pending reviews
- GET `/api/appraisals/team-reviews` - Team reviews (Manager)

## Skills & Competencies (16 endpoints)
- POST `/api/skills` - Create skill (HR/Admin)
- GET `/api/skills` - List skills
- GET `/api/skills/:id` - Get skill details
- PUT `/api/skills/:id` - Update skill (HR/Admin)
- DELETE `/api/skills/:id` - Delete skill (HR/Admin)
- GET `/api/skills/categories` - List skill categories
- POST `/api/skills/categories` - Create category
- POST `/api/skills/employee` - Add employee skill
- PUT `/api/skills/employee/:id` - Update employee skill
- DELETE `/api/skills/employee/:id` - Delete employee skill
- GET `/api/skills/employee/:employee_id` - Get employee skills
- POST `/api/skills/endorse` - Endorse skill
- DELETE `/api/skills/endorse/:id` - Remove endorsement
- GET `/api/skills/matrix` - Skills matrix
- GET `/api/skills/gap-analysis` - Skills gap analysis
- POST `/api/skills/import` - Bulk import skills

## Document Management (12 endpoints)
- POST `/api/documents` - Upload document
- GET `/api/documents` - List documents
- GET `/api/documents/:id` - Get document details
- GET `/api/documents/:id/download` - Download document
- PUT `/api/documents/:id` - Update document metadata
- DELETE `/api/documents/:id` - Delete document
- GET `/api/documents/my-documents` - My documents
- POST `/api/documents/bulk-upload` - Bulk upload
- GET `/api/documents/categories` - List categories
- POST `/api/documents/categories` - Create category
- POST `/api/documents/:id/share` - Share document
- GET `/api/documents/:id/versions` - Document versions

## Permissions & Roles (12 endpoints)
- GET `/api/permissions` - List all permissions
- GET `/api/roles` - List roles
- POST `/api/roles` - Create role (Admin)
- GET `/api/roles/:id` - Get role details
- PUT `/api/roles/:id` - Update role (Admin)
- DELETE `/api/roles/:id` - Delete role (Admin)
- POST `/api/roles/assign` - Assign role to user (Admin)
- DELETE `/api/roles/unassign` - Unassign role
- GET `/api/roles/users` - List users with roles
- GET `/api/users/:id/permissions` - Get user permissions
- POST `/api/permissions/check` - Check permission
- GET `/api/roles/templates` - Role templates

## Reports & Analytics (21 endpoints)
- GET `/api/reports/attendance` - Attendance report
- GET `/api/reports/timesheet` - Timesheet report
- GET `/api/reports/leave` - Leave report
- GET `/api/reports/payroll` - Payroll report
- GET `/api/reports/project` - Project report
- GET `/api/reports/employee` - Employee report
- GET `/api/reports/performance` - Performance report
- GET `/api/reports/dashboard` - Dashboard analytics
- POST `/api/reports/export` - Export report
- GET `/api/reports/custom` - Custom reports
- POST `/api/reports/custom` - Create custom report
- GET `/api/reports/scheduled` - Scheduled reports
- POST `/api/reports/schedule` - Schedule report
- GET `/api/reports/headcount` - Headcount report
- GET `/api/reports/turnover` - Employee turnover report
- GET `/api/payroll/reports/payment-status` - Payment status summary (NEW)
- GET `/api/payroll/reports/unpaid-salaries` - Unpaid salary register with aging (NEW)
- GET `/api/payroll/reports/payment-audit-trail` - Complete payment audit trail (NEW)
- GET `/api/payroll/reports/fnf-tracking` - Full and Final settlement tracking (NEW)
- GET `/api/payroll/reports/bank-reconciliation` - Bank reconciliation statement (NEW)
- GET `/api/payroll/reports/ifc-compliance` - Internal Financial Control compliance report (NEW)

## Profile Management (8 endpoints)
- GET `/api/profile` - Get my profile
- PUT `/api/profile` - Update profile
- POST `/api/profile/avatar` - Upload avatar
- DELETE `/api/profile/avatar` - Remove avatar
- PUT `/api/profile/preferences` - Update preferences
- GET `/api/profile/activity` - Activity history
- POST `/api/profile/change-email` - Request email change
- POST `/api/profile/verify-email-change` - Verify email change

## Leads Management (12 endpoints)
- POST `/api/leads` - Create lead
- GET `/api/leads` - List leads
- GET `/api/leads/:id` - Get lead details
- PUT `/api/leads/:id` - Update lead
- DELETE `/api/leads/:id` - Delete lead
- POST `/api/leads/:id/activities` - Add activity
- PUT `/api/leads/activities/:id` - Update activity
- DELETE `/api/leads/activities/:id` - Delete activity
- POST `/api/leads/:id/convert` - Convert to project/client
- GET `/api/leads/pipeline` - Sales pipeline view
- POST `/api/leads/import` - Import leads
- GET `/api/leads/export` - Export leads

## Invoice Management (12 endpoints)
- POST `/api/invoices` - Create invoice (Finance/Accounts/Manager/Admin)
- GET `/api/invoices` - List all invoices
- GET `/api/invoices/:id` - Get invoice details
- PUT `/api/invoices/:id` - Update invoice (Finance/Accounts/Admin)
- DELETE `/api/invoices/:id` - Delete/Cancel invoice (Finance/Accounts/Admin)
- POST `/api/invoices/:id/send` - Send invoice to client via email
- POST `/api/invoices/:id/mark-paid` - Mark invoice as paid
- POST `/api/invoices/:id/record-payment` - Record partial/full payment
- GET `/api/invoices/:id/download` - Download invoice as PDF
- GET `/api/invoices/stats` - Get invoice statistics
- POST `/api/invoices/generate-number` - Generate next invoice number
- POST `/api/invoices/:id/duplicate` - Duplicate invoice

## Accounting & Bookkeeping (18 endpoints)
- POST `/api/accounting/chart-of-accounts` - Create account (Finance/Accounts/Admin)
- GET `/api/accounting/chart-of-accounts` - List all accounts
- GET `/api/accounting/chart-of-accounts/:id` - Get account details
- PUT `/api/accounting/chart-of-accounts/:id` - Update account (Finance/Accounts/Admin)
- DELETE `/api/accounting/chart-of-accounts/:id` - Delete account
- POST `/api/accounting/journal-entries` - Create journal entry (Finance/Accounts/Admin)
- GET `/api/accounting/journal-entries` - List journal entries
- GET `/api/accounting/journal-entries/:id` - Get journal entry details
- POST `/api/accounting/journal-entries/:id/post` - Post journal entry
- POST `/api/accounting/journal-entries/:id/reverse` - Reverse journal entry
- GET `/api/accounting/ledger` - Get general ledger
- GET `/api/accounting/trial-balance` - Get trial balance
- GET `/api/accounting/balance-sheet` - Get balance sheet
- GET `/api/accounting/income-statement` - Get profit & loss statement
- GET `/api/accounting/cash-flow` - Get cash flow statement
- GET `/api/accounting/dashboard` - Get accounting dashboard data
- POST `/api/accounting/reconciliation` - Bank reconciliation
- GET `/api/accounting/accounts-receivable` - Accounts receivable aging
- GET `/api/accounting/accounts-payable` - Accounts payable aging

## Notifications (8 endpoints)
- GET `/api/notifications` - List notifications
- GET `/api/notifications/unread` - Unread notifications
- PUT `/api/notifications/:id/read` - Mark as read
- PUT `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/:id` - Delete notification
- DELETE `/api/notifications/clear-all` - Clear all notifications
- GET `/api/notifications/settings` - Get notification preferences
- PUT `/api/notifications/settings` - Update notification preferences

## Audit & Compliance (6 endpoints)
- GET `/api/audit/logs` - Get audit logs (Admin)
- GET `/api/audit/user-activity` - User activity logs
- GET `/api/audit/data-changes` - Data change history
- POST `/api/audit/export` - Export audit logs
- GET `/api/compliance/data-retention` - Data retention policies
- POST `/api/compliance/data-export` - Export user data (GDPR)

---

## Total Endpoints: 330+

**New in v2.1 - UTR Tracking & IFC Compliance**: +31 endpoints for payment batch management, UTR tracking, salary hold management, payment reconciliation, and enhanced reporting for Internal Financial Control (IFC) compliance under Companies Act 2013.

## Database Tables Summary (50+ tables)

### Core Tables
1. `users` - User authentication and basic info
2. `companies` - Multi-tenant company data
3. `employees` - Employee details and employment info
4. `departments` - Company departments
5. `company_settings` - Company configuration and preferences
6. `company_features` - Enabled features per company

### Attendance & Time
7. `attendance` - Daily attendance records
8. `attendance_settings` - Company attendance configuration
9. `timesheets` - Weekly timesheets
10. `timesheet_entries` - Individual time entries
11. `time_logs` - Task-level time tracking

### Leave Management
12. `leave_types` - Leave type definitions
13. `leave_balances` - Employee leave balances
14. `leave_requests` - Leave applications
15. `holidays` - Company holidays

### Payroll
16. `payroll_cycles` - Monthly payroll cycles
17. `payslips` - Employee payslips (enhanced with UTR tracking)
18. `salary_components` - Salary structure (basic, HRA, allowances)
19. `payroll_deductions` - Deductions (tax, PF, etc.)
20. `payroll_approvals` - Approval workflow

### Payment Processing & UTR Tracking (NEW)
21. `payment_batches` - Payment batches for salary disbursement
22. `payroll_reconciliation` - Three-way reconciliation (HRMS-Bank-ERP)
23. `payment_audit_trail` - Complete audit trail for IFC compliance
24. `unpaid_salary_register` - Register of unpaid salaries with aging

### Projects & Tasks
25. `projects` - Project definitions
26. `project_members` - Project team members
27. `project_activities` - Project activity log
28. `project_milestones` - Project milestones
29. `tasks` - Task items
30. `task_comments` - Task comments
31. `task_attachments` - Task file attachments
32. `task_dependencies` - Task dependencies

### Performance
33. `appraisal_cycles` - Appraisal periods
34. `appraisal_templates` - Review templates
35. `appraisals` - Performance reviews
36. `performance_ratings` - Rating history

### Skills
37. `skills` - Master skill catalog
38. `skill_categories` - Skill categories
39. `employee_skills` - Employee skill proficiency
40. `skill_endorsements` - Peer skill endorsements

### Documents
41. `documents` - File storage metadata
42. `document_access` - Access control logs
43. `document_versions` - Version history
44. `document_categories` - Document categories

### Security & Access
45. `roles` - Role definitions
46. `permissions` - Permission catalog
47. `user_roles` - User-role mappings
48. `role_permissions` - Role-permission mappings
49. `audit_logs` - System audit trail
50. `user_sessions` - Active user sessions

### Leads & CRM
51. `leads` - Sales leads
52. `lead_activities` - Lead interactions and notes
53. `clients` - Client/customer records

### Finance & Accounting
54. `invoices` - Invoice headers
55. `invoice_items` - Invoice line items
56. `invoice_payments` - Payment records
57. `chart_of_accounts` - Chart of accounts
58. `journal_entries` - Journal entry headers
59. `journal_entry_lines` - Journal entry line items
60. `ledger_entries` - General ledger entries

### Notifications & Communications
61. `notifications` - In-app notifications
62. `email_logs` - Email sending logs
63. `notification_preferences` - User notification settings

---

## Key Features by Role

### Employee
✅ View & mark attendance
✅ Submit timesheets
✅ Apply for leaves
✅ View payslips
✅ Update assigned tasks
✅ Complete self-assessment
✅ Manage profile & skills
✅ View documents
✅ Track time on tasks
✅ View team calendar

### Manager
✅ All Employee features
✅ Approve team attendance/timesheets/leaves
✅ View team details and hierarchy
✅ Create & manage projects
✅ Assign and track tasks
✅ Conduct performance reviews
✅ Manage leads and pipeline
✅ View team reports
✅ Create invoices for projects
✅ Approve expense claims

### HR
✅ All Employee features
✅ Manage employees (CRUD operations)
✅ Configure leave types and policies
✅ Manage appraisal cycles and templates
✅ Upload & manage documents
✅ View all HR reports
✅ Manage skills catalog
✅ Employee onboarding workflows
✅ Requisition management
✅ Interview scheduling
✅ Skills gap analysis

### Finance
✅ All Employee features
✅ Full access to invoice management
✅ Full access to accounting & bookkeeping
✅ Create and manage invoices
✅ Record payments and reconciliation
✅ Process payroll cycles
✅ Approve payroll
✅ View financial reports (P&L, Balance Sheet)
✅ Manage chart of accounts
✅ Create journal entries
✅ Generate financial statements
✅ Accounts receivable/payable

### Accounts
✅ All Employee features
✅ Full access to invoice management
✅ Full access to accounting & bookkeeping
✅ Create and edit invoices
✅ Record payments
✅ Process payroll (cannot approve)
✅ Create journal entries
✅ View financial reports
✅ Bank reconciliation
✅ Expense tracking

### Admin
✅ Full system access
✅ Manage company settings and configuration
✅ Configure roles & permissions
✅ Approve payroll
✅ All HR/Manager/Finance functions
✅ User management
✅ Feature configuration
✅ Branding and theme customization
✅ Security settings
✅ Integration management
✅ View audit logs
✅ System reports

### Super Admin (Platform Level)
✅ Manage all companies
✅ Create and configure new companies
✅ Assign users to companies
✅ Platform-wide analytics
✅ Company configuration (40+ features across 8 categories)
✅ Industry-based feature templates
✅ Subscription management
✅ Platform audit logs
✅ User impersonation
✅ System-wide settings

---

## Workflow States

### Timesheet: Draft → Submitted → Approved/Rejected
### Leave: Pending → Approved/Rejected/Cancelled
### Payroll: Draft → Initiated → Pending Approval → Approved → Processed → Finalized
### Payment Batch: Draft → Approved → Sent to Bank → Processing → Completed/Partially Completed/Failed (NEW)
### Payslip Payment: Pending → Processing → Paid/On-Hold/Failed → (Reprocess if failed) (NEW)
### Reconciliation: Pending → In Progress → Matched/Mismatched → Approved (NEW)
### Appraisal: Pending → Self Submitted → Manager Submitted → HR Submitted → Completed
### Task: To Do → In Progress → Review → Done/Blocked
### Project: Planning → Active → On Hold → Completed/Cancelled
### Lead: New → Contacted → Qualified → Proposal → Won/Lost
### Invoice: Draft → Sent → Viewed → Partial/Paid/Overdue/Cancelled
### Journal Entry: Draft → Posted → Reversed

---

## Company Configuration Features (40+ features across 8 categories)

### Core HR (5 features)
- Employee Management - Employee directory, profiles, and organization chart
- Attendance & Time Tracking - Clock in/out, attendance calendar, and reports
- Leave Management - Leave requests, approvals, and balance tracking
- Document Management - Employee documents, policies, and file storage
- Payroll Management - Salary processing, pay slips, and deductions

### Recruitment (4 features)
- Requisition Management - Job requisitions and approvals
- Candidate Portal - Public career site and job applications
- Interview Management - Interview scheduling and feedback
- Employee Onboarding - 90-day onboarding journey and tasks

### Performance & Development (4 features)
- Performance Appraisals - Annual reviews and ratings
- Goals & OKRs - Objective and key result tracking
- Skills & Competencies - Skill matrix and competency management
- Learning & Development - Training courses and certificates

### Employee Services (4 features)
- Claims & Reimbursement - Expense claims and approvals
- Shift & Scheduling - Shift roster and swap management
- Travel Management - Travel requests and bookings
- Timesheet Management - Project time tracking and approvals

### Projects & Tasks (3 features)
- Project Management - Projects, sprints, and kanban boards
- Task Management - Task assignments and tracking
- Leads & CRM - Lead management and pipeline

### Employee Engagement (2 features)
- Surveys & Polls - Employee engagement surveys and eNPS
- Feedback & Recognition - 360 feedback and peer recognition

### Finance & Accounting (3 features)
- Invoicing - Invoice creation and management
- Accounting & Ledger - General ledger and bookkeeping
- Expense Tracking - Company expenses and budgets

### Reports & Analytics (3 features)
- HR Reports - Attendance, leave, and employee reports
- Project Reports - Project progress and time reports
- Financial Reports - P&L, balance sheet, and cash flow

### Industry Templates
Each template enables a pre-configured set of features optimized for:
- IT Services & Consulting
- Manufacturing
- Retail & E-commerce
- Healthcare
- Financial Services
- Education
- All Features (Enterprise)

---

## Configuration Categories

### General Settings
- Company name and slug
- Industry type
- Subscription plan (Free/Basic/Professional/Enterprise)
- Company status (Active/Inactive)
- Regional settings (timezone, currency)

### Branding
- Primary and secondary colors
- Company logo
- Custom themes
- Email templates

### Security
- Multi-factor authentication (MFA) requirement
- Password expiry policies
- Session timeout settings
- IP whitelisting
- Two-factor authentication

### Notifications
- Email notifications
- SMS notifications  
- Push notifications
- Webhook configurations
- Custom notification rules

### Integrations
- Slack integration
- Microsoft Teams integration
- Custom API keys
- Third-party OAuth
- SSO configuration

---

## Required Integrations

1. **Email Service** (SendGrid, AWS SES, Mailgun)
   - Password reset emails
   - Approval notifications
   - Deadline reminders
   - Invoice delivery
   - Payslip distribution
   - System notifications

2. **File Storage** (AWS S3, Azure Blob, Google Cloud Storage)
   - Document uploads
   - Payslip PDFs
   - Profile avatars
   - Task attachments
   - Invoice PDFs
   - Backup storage

3. **PDF Generation** (PDFKit, Puppeteer, wkhtmltopdf)
   - Payslip generation
   - Invoice generation
   - Report exports
   - Financial statements

4. **Background Jobs** (Bull, RabbitMQ, Celery)
   - Payroll processing
   - Report generation
   - Email sending
   - Data aggregation
   - Invoice status updates
   - Scheduled notifications

5. **Real-time** (Socket.io, WebSocket, Pusher) - Optional
   - Live notifications
   - Real-time updates
   - Collaborative editing
   - Live chat support

6. **Payment Gateway** (Stripe, PayPal, Razorpay)
   - Subscription billing
   - Invoice payments
   - Automatic renewals

7. **SMS Service** (Twilio, AWS SNS)
   - MFA codes
   - Critical alerts
   - SMS notifications

8. **Analytics** (Google Analytics, Mixpanel)
   - Usage tracking
   - Feature adoption
   - User behavior

---

## Security Considerations

✅ Multi-tenant data isolation (company_id in all queries)
✅ JWT authentication with refresh tokens
✅ Role-based access control (RBAC)
✅ Password hashing (bcrypt, argon2)
✅ Rate limiting on public endpoints
✅ SQL injection prevention (parameterized queries)
✅ XSS protection (input sanitization)
✅ CSRF tokens for sensitive operations
✅ File upload validation (size, type, virus scan)
✅ Audit logs for critical operations
✅ HTTPS only in production
✅ Secure headers (CORS, CSP, HSTS)
✅ Session management and timeout
✅ MFA/2FA support
✅ IP whitelisting
✅ Data encryption at rest and in transit
✅ Regular security audits
✅ GDPR compliance (data export, right to be forgotten)
✅ SOC 2 compliance ready

---

## Performance Optimization

✅ Database indexing on foreign keys and frequently queried fields
✅ Query optimization (N+1 prevention, eager loading)
✅ Caching (Redis) for:
   - Company settings
   - User sessions
   - Permission lookups
   - Feature flags
   - Dashboard statistics
✅ Pagination on all list endpoints
✅ CDN for static assets (logos, images)
✅ Database connection pooling
✅ Lazy loading for large datasets
✅ Background processing for heavy operations
✅ Materialized views for complex reports
✅ Database read replicas for reporting
✅ API response compression (gzip)
✅ Query result caching
✅ Batch processing for bulk operations
✅ Webhook retry mechanisms
✅ Rate limiting and throttling
✅ Database query monitoring
✅ Application performance monitoring (APM)

---

## Recommended Tech Stack

**Backend Framework:**
- Node.js (Express, NestJS, Fastify)
- Python (Django, FastAPI)
- PHP (Laravel)
- Java (Spring Boot)
- Ruby (Ruby on Rails)

**Database:**
- PostgreSQL (recommended for multi-tenant, JSONB support)
- MySQL (alternative relational database)
- MongoDB (for document storage use cases)

**Cache:**
- Redis (sessions, permissions, feature flags)
- Memcached (alternative caching)

**Queue:**
- Bull (Node.js)
- Celery (Python)
- Laravel Queue (PHP)
- RabbitMQ (language-agnostic)
- AWS SQS

**Storage:**
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- MinIO (self-hosted)

**Email:**
- SendGrid
- AWS SES
- Mailgun
- Postmark

**Search:**
- Elasticsearch (full-text search)
- Algolia (search as a service)

**Monitoring:**
- Sentry (error tracking)
- DataDog (APM)
- New Relic (performance monitoring)
- Prometheus + Grafana (metrics)

**CI/CD:**
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

---

## API Standards & Best Practices

### RESTful Conventions
- GET for retrieval
- POST for creation
- PUT/PATCH for updates
- DELETE for deletion

### Response Formats
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### HTTP Status Codes
- 200 OK - Successful GET, PUT, PATCH
- 201 Created - Successful POST
- 204 No Content - Successful DELETE
- 400 Bad Request - Validation error
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 409 Conflict - Resource already exists
- 422 Unprocessable Entity - Business logic error
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error

### Pagination
```
GET /api/employees?page=1&limit=10&sort=name&order=asc
```

### Filtering
```
GET /api/employees?department=Engineering&status=active
```

### Searching
```
GET /api/employees?search=john&fields=name,email
```

### Field Selection
```
GET /api/employees?fields=id,name,email
```

### Versioning
```
GET /api/v1/employees
GET /api/v2/employees
```

---

## Data Export Formats

- **CSV** - Spreadsheet data
- **Excel (XLSX)** - Rich formatting
- **PDF** - Reports and documents
- **JSON** - API data exchange
- **XML** - Legacy systems integration

---

## Compliance & Regulations

✅ **GDPR** - General Data Protection Regulation
- Data export functionality
- Right to be forgotten
- Consent management
- Data processing agreements

✅ **SOC 2** - System and Organization Controls
- Access controls
- Audit logging
- Data encryption
- Incident response

✅ **ISO 27001** - Information Security Management
- Security policies
- Risk assessment
- Access management

✅ **Labor Laws Compliance**
- Payroll statutory compliance
- Leave policies
- Working hours tracking
- Employment contracts

---

## Backup & Disaster Recovery

✅ Automated daily database backups
✅ Point-in-time recovery capability
✅ Backup retention policies (30/60/90 days)
✅ Offsite backup storage
✅ Disaster recovery plan
✅ Regular backup testing
✅ Database replication
✅ Failover mechanisms

---

## Multi-Tenant Architecture

### Data Isolation Strategies

1. **Database per Tenant** (Highest isolation)
   - Separate database for each company
   - Maximum data security
   - Higher costs

2. **Schema per Tenant** (Medium isolation)
   - Separate schema within same database
   - Good balance of security and cost
   - Easier management

3. **Row-Level Security** (Current implementation)
   - company_id column in all tables
   - Query filters on company_id
   - Most cost-effective
   - Requires careful implementation

### Tenant Management
- Company creation and provisioning
- Feature flag management per tenant
- Customizable branding per tenant
- Isolated data access
- Independent configuration
- Per-tenant analytics

---

This comprehensive specification provides complete coverage of all 300+ API endpoints across all modules of the HR & Project Management SaaS platform, including the latest invoice management, accounting/bookkeeping features, and Super Admin company configuration capabilities with 40+ features across 8 categories.
