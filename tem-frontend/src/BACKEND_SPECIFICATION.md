# Backend API Specification - HR & Project Management System

## Table of Contents
1. [Authentication & User Management](#1-authentication--user-management)
2. [Company Management (Multi-Tenant)](#2-company-management-multi-tenant)
3. [Employee Management](#3-employee-management)
4. [Attendance Management](#4-attendance-management)
5. [Timesheet Management](#5-timesheet-management)
6. [Leave Management](#6-leave-management)
7. [Payroll Management](#7-payroll-management)
8. [Project Management](#8-project-management)
9. [Task Management](#9-task-management)
10. [Performance & Appraisal](#10-performance--appraisal)
11. [Skills & Competencies](#11-skills--competencies)
12. [Document Management](#12-document-management)
13. [Permissions & Roles](#13-permissions--roles)
14. [Reports & Analytics](#14-reports--analytics)
15. [Profile Management](#15-profile-management)
16. [Leads Management](#16-leads-management)

---

## 1. Authentication & User Management

### Data Models

```typescript
User {
  id: string (UUID)
  company_id: string (foreign key)
  employee_id: string (unique per company)
  email: string (unique)
  password_hash: string
  name: string
  role: enum('employee', 'manager', 'hr', 'admin', 'finance', 'accounts')
  department: string
  designation: string
  avatar?: string (URL)
  phone?: string
  address?: string
  date_of_birth?: date
  blood_group?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  bio?: string
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/auth/register
- Create new user account
- Input: { email, password, name, company_id }
- Output: { user, token }

#### POST /api/auth/login
- User login
- Input: { email, password }
- Output: { user, token, company }

#### POST /api/auth/logout
- Logout user
- Input: { token }
- Output: { success: boolean }

#### POST /api/auth/refresh-token
- Refresh authentication token
- Input: { refresh_token }
- Output: { token }

#### POST /api/auth/forgot-password
- Send password reset email
- Input: { email }
- Output: { success: boolean }

#### POST /api/auth/reset-password
- Reset user password
- Input: { token, new_password }
- Output: { success: boolean }

#### GET /api/auth/me
- Get current user profile
- Headers: Authorization
- Output: { user }

#### PUT /api/auth/change-password
- Change user password
- Input: { current_password, new_password }
- Output: { success: boolean }

---

## 2. Company Management (Multi-Tenant)

### Data Models

```typescript
Company {
  id: string (UUID)
  name: string
  subdomain: string (unique)
  logo?: string (URL)
  primary_color: string (hex)
  secondary_color: string (hex)
  industry?: string
  size?: enum('1-10', '11-50', '51-200', '201-500', '500+')
  address?: string
  phone?: string
  email?: string
  website?: string
  timezone: string
  currency: string
  is_active: boolean
  subscription_plan?: string
  subscription_ends_at?: timestamp
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/companies
- Create new company (Super Admin only)
- Input: { name, subdomain, industry, size }
- Output: { company }

#### GET /api/companies
- List all companies (Super Admin only)
- Query: ?page=1&limit=10&search=query
- Output: { companies[], total, page, limit }

#### GET /api/companies/:id
- Get company details
- Output: { company }

#### PUT /api/companies/:id
- Update company details (Admin only)
- Input: { name, logo, primary_color, secondary_color, ... }
- Output: { company }

#### DELETE /api/companies/:id
- Deactivate company (Super Admin only)
- Output: { success: boolean }

#### GET /api/companies/:id/stats
- Get company statistics (Admin only)
- Output: { total_employees, active_employees, departments, ... }

---

## 3. Employee Management

### Data Models

```typescript
Employee {
  id: string (UUID)
  company_id: string (foreign key)
  user_id: string (foreign key to User)
  employee_id: string (unique per company)
  department: string
  designation: string
  reporting_manager_id?: string (foreign key to Employee)
  date_of_joining: date
  employment_type: enum('full-time', 'part-time', 'contract', 'intern')
  work_location: enum('office', 'remote', 'hybrid')
  salary_basic: decimal
  salary_hra: decimal
  salary_special_allowance: decimal
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/employees
- Create new employee (HR/Admin)
- Input: { user_data, employee_data }
- Output: { employee }

#### GET /api/employees
- List all employees
- Query: ?page=1&limit=10&department=Engineering&search=query
- Output: { employees[], total, page, limit }

#### GET /api/employees/:id
- Get employee details
- Output: { employee, user, reporting_manager }

#### PUT /api/employees/:id
- Update employee details (HR/Admin)
- Input: { department, designation, salary_basic, ... }
- Output: { employee }

#### DELETE /api/employees/:id
- Deactivate employee (HR/Admin)
- Output: { success: boolean }

#### GET /api/employees/:id/hierarchy
- Get employee hierarchy (manager chain)
- Output: { managers[], subordinates[] }

#### GET /api/employees/:id/team
- Get employee's team members (Manager)
- Output: { team_members[] }

---

## 4. Attendance Management

### Data Models

```typescript
Attendance {
  id: string (UUID)
  company_id: string (foreign key)
  employee_id: string (foreign key)
  date: date
  clock_in: timestamp
  clock_out?: timestamp
  status: enum('present', 'absent', 'half-day', 'late', 'on-leave')
  work_hours?: decimal
  location_lat?: decimal
  location_lng?: decimal
  notes?: text
  approved_by?: string (foreign key to Employee)
  approved_at?: timestamp
  created_at: timestamp
  updated_at: timestamp
}

AttendanceSettings {
  id: string (UUID)
  company_id: string (foreign key)
  work_hours_per_day: decimal (default: 8)
  grace_period_minutes: integer (default: 15)
  half_day_threshold_hours: decimal (default: 4)
  working_days: json (array of day names)
  shift_start_time: time
  shift_end_time: time
  track_location: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/attendance/clock-in
- Clock in for the day
- Input: { location_lat?, location_lng?, notes? }
- Output: { attendance }

#### POST /api/attendance/clock-out
- Clock out for the day
- Input: { attendance_id }
- Output: { attendance, work_hours }

#### GET /api/attendance/my-attendance
- Get current user's attendance records
- Query: ?month=11&year=2024
- Output: { attendance[], stats }

#### GET /api/attendance/calendar
- Get attendance calendar view
- Query: ?month=11&year=2024
- Output: { attendance_by_date{}, stats }

#### GET /api/attendance/team
- Get team attendance (Manager)
- Query: ?date=2024-11-18&department=Engineering
- Output: { team_attendance[] }

#### PUT /api/attendance/:id/approve
- Approve attendance (Manager/HR)
- Input: { status }
- Output: { attendance }

#### GET /api/attendance/settings
- Get attendance settings (Admin/HR)
- Output: { settings }

#### PUT /api/attendance/settings
- Update attendance settings (Admin/HR)
- Input: { work_hours_per_day, grace_period_minutes, ... }
- Output: { settings }

#### GET /api/attendance/report
- Generate attendance report (Manager/HR/Admin)
- Query: ?start_date=2024-11-01&end_date=2024-11-30&department=Engineering
- Output: { report_data[], summary }

---

## 5. Timesheet Management

### Data Models

```typescript
Timesheet {
  id: string (UUID)
  company_id: string (foreign key)
  employee_id: string (foreign key)
  week_start_date: date
  week_end_date: date
  status: enum('draft', 'submitted', 'approved', 'rejected')
  total_hours: decimal
  submitted_at?: timestamp
  approved_by?: string (foreign key to Employee)
  approved_at?: timestamp
  rejection_reason?: text
  created_at: timestamp
  updated_at: timestamp
}

TimesheetEntry {
  id: string (UUID)
  timesheet_id: string (foreign key)
  project_id: string (foreign key)
  task_id?: string (foreign key)
  date: date
  hours: decimal
  description: text
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/timesheets
- Create new timesheet
- Input: { week_start_date }
- Output: { timesheet }

#### GET /api/timesheets
- List user's timesheets
- Query: ?status=submitted&year=2024
- Output: { timesheets[] }

#### GET /api/timesheets/:id
- Get timesheet details
- Output: { timesheet, entries[] }

#### POST /api/timesheets/:id/entries
- Add timesheet entry
- Input: { project_id, task_id?, date, hours, description }
- Output: { entry }

#### PUT /api/timesheets/entries/:id
- Update timesheet entry
- Input: { hours, description }
- Output: { entry }

#### DELETE /api/timesheets/entries/:id
- Delete timesheet entry
- Output: { success: boolean }

#### POST /api/timesheets/:id/submit
- Submit timesheet for approval
- Output: { timesheet }

#### GET /api/timesheets/pending-approvals
- Get pending timesheet approvals (Manager)
- Output: { timesheets[] }

#### POST /api/timesheets/:id/approve
- Approve timesheet (Manager)
- Output: { timesheet }

#### POST /api/timesheets/:id/reject
- Reject timesheet (Manager)
- Input: { rejection_reason }
- Output: { timesheet }

---

## 6. Leave Management

### Data Models

```typescript
LeaveType {
  id: string (UUID)
  company_id: string (foreign key)
  name: string
  code: string
  color: string (hex)
  annual_quota: integer
  max_consecutive_days?: integer
  min_notice_days?: integer
  carry_forward_enabled: boolean
  max_carry_forward?: integer
  requires_approval: boolean
  is_paid: boolean
  is_active: boolean
  description?: text
  created_at: timestamp
  updated_at: timestamp
}

LeaveBalance {
  id: string (UUID)
  company_id: string (foreign key)
  employee_id: string (foreign key)
  leave_type_id: string (foreign key)
  year: integer
  total_allocated: decimal
  used: decimal
  pending: decimal
  available: decimal
  carried_forward: decimal
  created_at: timestamp
  updated_at: timestamp
}

LeaveRequest {
  id: string (UUID)
  company_id: string (foreign key)
  employee_id: string (foreign key)
  leave_type_id: string (foreign key)
  start_date: date
  end_date: date
  total_days: decimal
  reason: text
  status: enum('pending', 'approved', 'rejected', 'cancelled')
  approver_id?: string (foreign key to Employee)
  approved_at?: timestamp
  rejection_reason?: text
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### GET /api/leaves/types
- Get all leave types
- Output: { leave_types[] }

#### POST /api/leaves/types
- Create leave type (HR/Admin)
- Input: { name, code, color, annual_quota, ... }
- Output: { leave_type }

#### PUT /api/leaves/types/:id
- Update leave type (HR/Admin)
- Input: { name, annual_quota, ... }
- Output: { leave_type }

#### DELETE /api/leaves/types/:id
- Deactivate leave type (HR/Admin)
- Output: { success: boolean }

#### GET /api/leaves/balance
- Get user's leave balances
- Output: { balances[] }

#### GET /api/leaves/balance/:employee_id
- Get employee leave balance (Manager/HR)
- Output: { balances[] }

#### POST /api/leaves/requests
- Apply for leave
- Input: { leave_type_id, start_date, end_date, reason }
- Output: { leave_request }

#### GET /api/leaves/requests
- Get user's leave requests
- Query: ?status=pending&year=2024
- Output: { leave_requests[] }

#### GET /api/leaves/requests/:id
- Get leave request details
- Output: { leave_request, employee, leave_type }

#### PUT /api/leaves/requests/:id
- Update leave request (if pending)
- Input: { start_date, end_date, reason }
- Output: { leave_request }

#### DELETE /api/leaves/requests/:id
- Cancel leave request
- Output: { success: boolean }

#### GET /api/leaves/pending-approvals
- Get pending leave approvals (Manager)
- Output: { leave_requests[] }

#### POST /api/leaves/requests/:id/approve
- Approve leave request (Manager/HR)
- Output: { leave_request }

#### POST /api/leaves/requests/:id/reject
- Reject leave request (Manager/HR)
- Input: { rejection_reason }
- Output: { leave_request }

#### POST /api/leaves/allocate
- Allocate leaves to employees (HR/Admin)
- Input: { employee_ids[], leave_type_id, amount, year }
- Output: { success: boolean }

#### GET /api/leaves/calendar
- Get leave calendar
- Query: ?month=11&year=2024&department=Engineering
- Output: { leaves_by_date{} }

---

## 7. Payroll Management

### Data Models

```typescript
PayrollCycle {
  id: string (UUID)
  company_id: string (foreign key)
  month: string
  year: integer
  period_start: date
  period_end: date
  total_employees: integer
  total_amount: decimal
  status: enum('draft', 'initiated', 'pending_approval', 'approved', 'processed')
  initiated_by?: string (foreign key to Employee)
  initiated_date?: date
  approved_by?: string (foreign key to Employee)
  approved_date?: date
  processed_date?: date
  rejection_reason?: text
  breakdown: json {
    total_basic: decimal
    total_allowances: decimal
    total_bonuses: decimal
    total_deductions: decimal
  }
  created_at: timestamp
  updated_at: timestamp
}

Payslip {
  id: string (UUID)
  company_id: string (foreign key)
  payroll_cycle_id: string (foreign key)
  employee_id: string (foreign key)
  month: string
  year: integer
  payment_date: date
  
  // Earnings
  basic_salary: decimal
  hra: decimal
  special_allowance: decimal
  performance_bonus: decimal
  other_allowances: decimal
  gross_salary: decimal
  
  // Deductions
  provident_fund: decimal
  professional_tax: decimal
  income_tax: decimal
  insurance: decimal
  other_deductions: decimal
  total_deductions: decimal
  
  // Net
  net_salary: decimal
  
  // Attendance data
  working_days: integer
  present_days: integer
  leaves_taken: integer
  
  status: enum('pending', 'processing', 'paid')
  payment_method?: enum('bank_transfer', 'cash', 'cheque')
  transaction_id?: string
  
  created_at: timestamp
  updated_at: timestamp
}

SalaryComponent {
  id: string (UUID)
  company_id: string (foreign key)
  employee_id: string (foreign key)
  component_type: enum('earning', 'deduction')
  component_name: string
  calculation_type: enum('fixed', 'percentage', 'formula')
  value: decimal
  is_taxable: boolean
  is_active: boolean
  effective_from: date
  effective_to?: date
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/payroll/cycles
- Create payroll cycle (Finance/Accounts/Admin)
- Input: { month, year, period_start, period_end }
- Output: { payroll_cycle }

#### GET /api/payroll/cycles
- List payroll cycles
- Query: ?status=draft&year=2024
- Output: { cycles[] }

#### GET /api/payroll/cycles/:id
- Get payroll cycle details
- Output: { cycle, employee_payrolls[] }

#### PUT /api/payroll/cycles/:id
- Update payroll cycle (Finance/Accounts/Admin)
- Input: { period_start, period_end, ... }
- Output: { cycle }

#### POST /api/payroll/cycles/:id/initiate
- Initiate payroll cycle (Finance/Accounts)
- Output: { cycle }

#### POST /api/payroll/cycles/:id/approve
- Approve payroll cycle (Admin/Finance)
- Output: { cycle }

#### POST /api/payroll/cycles/:id/reject
- Reject payroll cycle (Admin/Finance)
- Input: { rejection_reason }
- Output: { cycle }

#### POST /api/payroll/cycles/:id/process
- Process payroll (generate payslips)
- Output: { cycle, payslips_generated: integer }

#### GET /api/payroll/pending-approvals
- Get pending payroll approvals (Admin/Finance)
- Output: { cycles[] }

#### GET /api/payroll/my-payslips
- Get employee's payslips
- Query: ?year=2024
- Output: { payslips[] }

#### GET /api/payroll/payslips/:id
- Get payslip details
- Output: { payslip, employee }

#### GET /api/payroll/payslips/:id/download
- Download payslip as PDF
- Output: PDF file

#### GET /api/payroll/employees
- Get employees for payroll processing (Finance/Accounts)
- Query: ?cycle_id=xxx&department=Engineering
- Output: { employees[], payroll_data[] }

#### POST /api/payroll/calculate
- Calculate employee payroll
- Input: { employee_id, month, year, working_days, present_days }
- Output: { earnings{}, deductions{}, net_salary }

#### GET /api/payroll/components/:employee_id
- Get employee salary components
- Output: { components[] }

#### POST /api/payroll/components
- Add salary component (HR/Admin)
- Input: { employee_id, component_type, component_name, value, ... }
- Output: { component }

#### PUT /api/payroll/components/:id
- Update salary component (HR/Admin)
- Input: { value, is_active, ... }
- Output: { component }

#### DELETE /api/payroll/components/:id
- Delete salary component (HR/Admin)
- Output: { success: boolean }

---

## 8. Project Management

### Data Models

```typescript
Project {
  id: string (UUID)
  company_id: string (foreign key)
  name: string
  description?: text
  status: enum('planning', 'active', 'on-hold', 'completed', 'cancelled')
  priority: enum('low', 'medium', 'high', 'critical')
  project_manager_id: string (foreign key to Employee)
  client_name?: string
  start_date?: date
  end_date?: date
  estimated_hours?: integer
  actual_hours?: integer
  budget?: decimal
  spent?: decimal
  progress: integer (0-100)
  tags?: json (array)
  color?: string (hex)
  is_archived: boolean
  created_at: timestamp
  updated_at: timestamp
}

ProjectMember {
  id: string (UUID)
  project_id: string (foreign key)
  employee_id: string (foreign key)
  role: string (e.g., 'Developer', 'Designer', 'QA')
  allocation_percentage: integer (0-100)
  joined_date: date
  left_date?: date
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}

ProjectActivity {
  id: string (UUID)
  project_id: string (foreign key)
  employee_id: string (foreign key)
  activity_type: enum('created', 'updated', 'status_changed', 'member_added', 'comment')
  description: text
  metadata?: json
  created_at: timestamp
}
```

### API Endpoints

#### POST /api/projects
- Create new project (Manager/Admin)
- Input: { name, description, status, priority, project_manager_id, ... }
- Output: { project }

#### GET /api/projects
- List projects
- Query: ?status=active&page=1&limit=10&search=query
- Output: { projects[], total, page, limit }

#### GET /api/projects/:id
- Get project details
- Output: { project, members[], tasks_summary, activities[] }

#### PUT /api/projects/:id
- Update project (Manager/Admin)
- Input: { name, status, priority, ... }
- Output: { project }

#### DELETE /api/projects/:id
- Archive project (Manager/Admin)
- Output: { success: boolean }

#### POST /api/projects/:id/members
- Add project member (Manager)
- Input: { employee_id, role, allocation_percentage }
- Output: { member }

#### DELETE /api/projects/:id/members/:member_id
- Remove project member (Manager)
- Output: { success: boolean }

#### GET /api/projects/:id/activities
- Get project activity log
- Query: ?page=1&limit=20
- Output: { activities[] }

#### GET /api/projects/:id/kanban
- Get project Kanban board
- Output: { columns{}, tasks[] }

#### GET /api/projects/:id/stats
- Get project statistics
- Output: { total_tasks, completed_tasks, hours_logged, ... }

---

## 9. Task Management

### Data Models

```typescript
Task {
  id: string (UUID)
  company_id: string (foreign key)
  project_id: string (foreign key)
  title: string
  description?: text
  status: enum('todo', 'in-progress', 'review', 'done', 'blocked')
  priority: enum('low', 'medium', 'high', 'urgent')
  assignee_id?: string (foreign key to Employee)
  reporter_id: string (foreign key to Employee)
  estimated_hours?: decimal
  actual_hours?: decimal
  due_date?: date
  start_date?: date
  completed_date?: date
  tags?: json (array)
  parent_task_id?: string (foreign key to Task)
  order_index: integer
  created_at: timestamp
  updated_at: timestamp
}

TaskComment {
  id: string (UUID)
  task_id: string (foreign key)
  employee_id: string (foreign key)
  comment: text
  created_at: timestamp
  updated_at: timestamp
}

TaskAttachment {
  id: string (UUID)
  task_id: string (foreign key)
  uploaded_by: string (foreign key to Employee)
  file_name: string
  file_url: string
  file_size: integer
  file_type: string
  created_at: timestamp
}
```

### API Endpoints

#### POST /api/tasks
- Create new task
- Input: { project_id, title, description, status, priority, assignee_id, ... }
- Output: { task }

#### GET /api/tasks
- List tasks
- Query: ?project_id=xxx&assignee_id=me&status=in-progress
- Output: { tasks[] }

#### GET /api/tasks/:id
- Get task details
- Output: { task, comments[], attachments[], history[] }

#### PUT /api/tasks/:id
- Update task
- Input: { title, status, priority, assignee_id, ... }
- Output: { task }

#### DELETE /api/tasks/:id
- Delete task
- Output: { success: boolean }

#### POST /api/tasks/:id/comments
- Add comment to task
- Input: { comment }
- Output: { comment }

#### POST /api/tasks/:id/attachments
- Upload task attachment
- Input: FormData { file }
- Output: { attachment }

#### DELETE /api/tasks/attachments/:id
- Delete attachment
- Output: { success: boolean }

#### PUT /api/tasks/:id/status
- Update task status
- Input: { status }
- Output: { task }

#### GET /api/tasks/my-tasks
- Get current user's tasks
- Query: ?status=in-progress
- Output: { tasks[] }

---

## 10. Performance & Appraisal

### Data Models

```typescript
AppraisalCycle {
  id: string (UUID)
  company_id: string (foreign key)
  name: string
  year: integer
  quarter?: integer
  start_date: date
  end_date: date
  self_assessment_deadline: date
  manager_review_deadline: date
  status: enum('draft', 'active', 'completed', 'cancelled')
  template_id: string (foreign key)
  created_by: string (foreign key to Employee)
  created_at: timestamp
  updated_at: timestamp
}

AppraisalTemplate {
  id: string (UUID)
  company_id: string (foreign key)
  name: string
  description?: text
  sections: json [
    {
      id: string
      title: string
      description: string
      questions: [
        {
          id: string
          question: string
          type: enum('rating', 'text', 'objective')
          weight: integer
          required: boolean
        }
      ]
    }
  ]
  rating_scale: json {
    min: integer
    max: integer
    labels: { value: integer, label: string }[]
  }
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}

Appraisal {
  id: string (UUID)
  company_id: string (foreign key)
  cycle_id: string (foreign key)
  employee_id: string (foreign key)
  manager_id: string (foreign key to Employee)
  status: enum('pending', 'self_assessment_submitted', 'manager_review_submitted', 'hr_review_submitted', 'completed')
  
  // Self Assessment
  self_assessment?: json
  self_assessment_submitted_at?: timestamp
  
  // Manager Review
  manager_review?: json
  manager_rating: decimal
  manager_comments?: text
  manager_review_submitted_at?: timestamp
  
  // HR Review
  hr_review?: json
  hr_rating?: decimal
  hr_comments?: text
  hr_review_submitted_at?: timestamp
  
  // Final
  overall_rating: decimal
  promotion_recommended: boolean
  increment_percentage?: decimal
  development_areas?: text
  achievements?: text
  goals_next_period?: text
  
  created_at: timestamp
  updated_at: timestamp
}
```

### API Endpoints

#### POST /api/appraisals/cycles
- Create appraisal cycle (HR/Admin)
- Input: { name, year, quarter, start_date, end_date, template_id, ... }
- Output: { cycle }

#### GET /api/appraisals/cycles
- List appraisal cycles
- Query: ?status=active&year=2024
- Output: { cycles[] }

#### GET /api/appraisals/cycles/:id
- Get cycle details
- Output: { cycle, template, appraisals_summary }

#### PUT /api/appraisals/cycles/:id
- Update appraisal cycle (HR/Admin)
- Input: { name, deadlines, ... }
- Output: { cycle }

#### POST /api/appraisals/cycles/:id/launch
- Launch appraisal cycle (HR/Admin)
- Output: { cycle }

#### GET /api/appraisals/templates
- List appraisal templates (HR/Admin)
- Output: { templates[] }

#### POST /api/appraisals/templates
- Create appraisal template (HR/Admin)
- Input: { name, sections, rating_scale }
- Output: { template }

#### GET /api/appraisals/my-appraisals
- Get employee's appraisals
- Output: { appraisals[] }

#### GET /api/appraisals/:id
- Get appraisal details
- Output: { appraisal, employee, manager, cycle, template }

#### POST /api/appraisals/:id/self-assessment
- Submit self-assessment
- Input: { self_assessment (json) }
- Output: { appraisal }

#### POST /api/appraisals/:id/manager-review
- Submit manager review
- Input: { manager_review, manager_rating, manager_comments }
- Output: { appraisal }

#### POST /api/appraisals/:id/hr-review
- Submit HR review (HR/Admin)
- Input: { hr_review, hr_rating, hr_comments, overall_rating, increment_percentage }
- Output: { appraisal }

#### GET /api/appraisals/pending-reviews
- Get pending reviews (Manager/HR)
- Output: { appraisals[] }

#### GET /api/appraisals/team-reviews
- Get team appraisals (Manager)
- Query: ?cycle_id=xxx
- Output: { appraisals[] }

---

## 11. Skills & Competencies

### Data Models

```typescript
Skill {
  id: string (UUID)
  company_id: string (foreign key)
  name: string
  category: string
  description?: text
  proficiency_levels: json [
    { level: integer, label: string, description: string }
  ]
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}

EmployeeSkill {
  id: string (UUID)
  employee_id: string (foreign key)
  skill_id: string (foreign key)
  proficiency_level: integer
  years_of_experience?: decimal
  last_used?: date
  endorsed_by?: json (array of employee_ids)
  certification?: string
  notes?: text
  verified_by?: string (foreign key to Employee)
  verified_at?: timestamp
  created_at: timestamp
  updated_at: timestamp
}

SkillEndorsement {
  id: string (UUID)
  employee_skill_id: string (foreign key)
  endorsed_by: string (foreign key to Employee)
  comments?: text
  created_at: timestamp
}
```

### API Endpoints

#### POST /api/skills
- Create skill (HR/Admin)
- Input: { name, category, description, proficiency_levels }
- Output: { skill }

#### GET /api/skills
- List all skills
- Query: ?category=Technical&search=query
- Output: { skills[] }

#### GET /api/skills/:id
- Get skill details
- Output: { skill, employees_with_skill[] }

#### PUT /api/skills/:id
- Update skill (HR/Admin)
- Input: { name, category, description }
- Output: { skill }

#### DELETE /api/skills/:id
- Deactivate skill (HR/Admin)
- Output: { success: boolean }

#### GET /api/skills/categories
- Get skill categories
- Output: { categories[] }

#### POST /api/skills/employee
- Add skill to employee profile
- Input: { employee_id, skill_id, proficiency_level, years_of_experience }
- Output: { employee_skill }

#### PUT /api/skills/employee/:id
- Update employee skill
- Input: { proficiency_level, years_of_experience }
- Output: { employee_skill }

#### DELETE /api/skills/employee/:id
- Remove employee skill
- Output: { success: boolean }

#### GET /api/skills/employee/:employee_id
- Get employee skills
- Output: { skills[] }

#### POST /api/skills/endorse
- Endorse employee skill
- Input: { employee_skill_id, comments }
- Output: { endorsement }

#### GET /api/skills/matrix
- Get skills matrix (HR/Manager)
- Query: ?department=Engineering
- Output: { matrix_data[], skills[], employees[] }

#### GET /api/skills/gap-analysis
- Get skills gap analysis (HR/Manager)
- Query: ?department=Engineering
- Output: { required_skills[], available_skills[], gaps[] }

---

## 12. Document Management

### Data Models

```typescript
Document {
  id: string (UUID)
  company_id: string (foreign key)
  title: string
  description?: text
  category: enum('policy', 'handbook', 'form', 'certificate', 'personal', 'other')
  file_name: string
  file_url: string
  file_size: integer
  file_type: string
  access_level: enum('public', 'employees', 'managers', 'hr_only', 'personal')
  uploaded_by: string (foreign key to Employee)
  employee_id?: string (for personal documents)
  version: integer
  is_active: boolean
  expires_at?: date
  tags?: json (array)
  created_at: timestamp
  updated_at: timestamp
}

DocumentAccess {
  id: string (UUID)
  document_id: string (foreign key)
  employee_id: string (foreign key)
  access_type: enum('view', 'download', 'edit')
  accessed_at: timestamp
}
```

### API Endpoints

#### POST /api/documents
- Upload document (HR/Admin or Employee for personal)
- Input: FormData { file, title, description, category, access_level }
- Output: { document }

#### GET /api/documents
- List documents
- Query: ?category=policy&access_level=public
- Output: { documents[] }

#### GET /api/documents/:id
- Get document details
- Output: { document }

#### GET /api/documents/:id/download
- Download document
- Output: File stream

#### PUT /api/documents/:id
- Update document metadata (HR/Admin)
- Input: { title, description, category, access_level }
- Output: { document }

#### DELETE /api/documents/:id
- Delete document (HR/Admin)
- Output: { success: boolean }

#### GET /api/documents/my-documents
- Get employee's personal documents
- Output: { documents[] }

#### POST /api/documents/bulk-upload
- Bulk upload documents (HR/Admin)
- Input: FormData { files[], category, access_level }
- Output: { documents[], failed[] }

#### GET /api/documents/categories
- Get document categories
- Output: { categories[] }

---

## 13. Permissions & Roles

### Data Models

```typescript
Role {
  id: string (UUID)
  company_id: string (foreign key)
  name: string (unique per company)
  display_name: string
  description?: text
  permissions: json (array of permission IDs)
  is_system: boolean (cannot be deleted)
  created_at: timestamp
  updated_at: timestamp
}

Permission {
  id: string (UUID)
  module: string
  action: string
  description: text
  code: string (e.g., 'employees.create')
}

UserRole {
  id: string (UUID)
  user_id: string (foreign key)
  role_id: string (foreign key)
  assigned_by: string (foreign key to User)
  assigned_at: timestamp
}
```

### API Endpoints

#### GET /api/permissions
- List all permissions
- Output: { permissions[] }

#### GET /api/roles
- List roles
- Output: { roles[] }

#### POST /api/roles
- Create custom role (Admin)
- Input: { name, display_name, description, permissions[] }
- Output: { role }

#### GET /api/roles/:id
- Get role details
- Output: { role, users_count }

#### PUT /api/roles/:id
- Update role (Admin, not system roles)
- Input: { display_name, description, permissions[] }
- Output: { role }

#### DELETE /api/roles/:id
- Delete role (Admin, not system roles)
- Output: { success: boolean }

#### POST /api/roles/assign
- Assign role to user (Admin)
- Input: { user_id, role_id }
- Output: { user_role }

#### GET /api/roles/users
- Get users with role assignments
- Query: ?role_id=xxx
- Output: { users[] }

#### GET /api/users/:id/permissions
- Get user's effective permissions
- Output: { permissions[] }

---

## 14. Reports & Analytics

### API Endpoints

#### GET /api/reports/attendance
- Attendance report
- Query: ?start_date=2024-11-01&end_date=2024-11-30&department=Engineering
- Output: { report_data[], summary, charts_data }

#### GET /api/reports/timesheet
- Timesheet report
- Query: ?start_date=2024-11-01&end_date=2024-11-30&project_id=xxx
- Output: { report_data[], summary }

#### GET /api/reports/leave
- Leave report
- Query: ?year=2024&department=Engineering
- Output: { report_data[], summary }

#### GET /api/reports/payroll
- Payroll report
- Query: ?month=11&year=2024
- Output: { report_data[], summary }

#### GET /api/reports/project
- Project report
- Query: ?project_id=xxx&start_date=2024-11-01
- Output: { report_data[], summary }

#### GET /api/reports/employee
- Employee report
- Query: ?department=Engineering
- Output: { report_data[], summary }

#### GET /api/reports/performance
- Performance report
- Query: ?year=2024&cycle_id=xxx
- Output: { report_data[], summary }

#### GET /api/reports/dashboard
- Dashboard analytics
- Output: { 
    total_employees,
    attendance_today,
    pending_approvals,
    active_projects,
    charts_data
  }

#### POST /api/reports/export
- Export report
- Input: { report_type, format: 'pdf' | 'excel' | 'csv', filters }
- Output: File download

---

## 15. Profile Management

### API Endpoints

#### GET /api/profile
- Get user profile
- Output: { user, employee, skills[], stats }

#### PUT /api/profile
- Update user profile
- Input: { name, phone, address, bio, emergency_contact_name, ... }
- Output: { user }

#### POST /api/profile/avatar
- Upload profile avatar
- Input: FormData { avatar }
- Output: { avatar_url }

#### PUT /api/profile/preferences
- Update user preferences
- Input: { timezone, language, notification_preferences }
- Output: { preferences }

---

## 16. Leads Management

### Data Models

```typescript
Lead {
  id: string (UUID)
  company_id: string (foreign key)
  name: string
  email: string
  phone?: string
  company_name?: string
  position?: string
  source: enum('website', 'referral', 'linkedin', 'cold-call', 'event', 'other')
  status: enum('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')
  value?: decimal
  probability?: integer (0-100)
  assigned_to?: string (foreign key to Employee)
  notes?: text
  next_follow_up?: date
  converted_to_project_id?: string (foreign key to Project)
  lost_reason?: text
  tags?: json (array)
  created_at: timestamp
  updated_at: timestamp
}

LeadActivity {
  id: string (UUID)
  lead_id: string (foreign key)
  employee_id: string (foreign key)
  activity_type: enum('call', 'email', 'meeting', 'note', 'status_change')
  description: text
  metadata?: json
  created_at: timestamp
}
```

### API Endpoints

#### POST /api/leads
- Create lead (Manager/Admin)
- Input: { name, email, company_name, source, status, assigned_to }
- Output: { lead }

#### GET /api/leads
- List leads
- Query: ?status=new&assigned_to=me&page=1
- Output: { leads[], total }

#### GET /api/leads/:id
- Get lead details
- Output: { lead, activities[], stats }

#### PUT /api/leads/:id
- Update lead
- Input: { status, probability, notes, next_follow_up }
- Output: { lead }

#### DELETE /api/leads/:id
- Delete lead
- Output: { success: boolean }

#### POST /api/leads/:id/activities
- Add lead activity
- Input: { activity_type, description }
- Output: { activity }

#### POST /api/leads/:id/convert
- Convert lead to project
- Input: { project_details }
- Output: { project, lead }

#### GET /api/leads/pipeline
- Get sales pipeline
- Output: { pipeline_by_status{}, total_value }

---

## Business Logic & Rules

### RBAC (Role-Based Access Control)

**Employee:**
- Can view own attendance, timesheets, leaves, payslips, tasks, appraisals
- Can mark attendance, submit timesheets, apply leaves
- Can update own profile and skills
- Can view company documents (public/employee level)

**Manager:**
- All Employee permissions
- Can approve team attendance, timesheets, leaves
- Can view team members' details
- Can create and manage projects
- Can assign tasks and review team performance
- Can manage leads

**HR:**
- All Employee permissions
- Can manage employees (CRUD)
- Can manage leave types and policies
- Can manage appraisal cycles
- Can view all attendance, leave reports
- Can manage documents
- Can view/manage skills

**Finance/Accounts:**
- Can process payroll
- Can view all payroll data
- Can initiate payroll cycles
- Finance can also approve payroll

**Admin:**
- Full system access
- Can manage company settings
- Can manage roles and permissions
- Can approve payroll
- Can perform all HR, Manager, Finance functions

### Workflow Rules

**Timesheet Approval:**
1. Employee submits weekly timesheet
2. Manager receives notification
3. Manager approves/rejects
4. If rejected, employee can resubmit

**Leave Approval:**
1. Employee applies for leave
2. Check leave balance
3. Manager receives notification
4. Manager approves/rejects
5. Update leave balance

**Payroll Processing:**
1. Finance creates payroll cycle (Draft)
2. Finance initiates cycle → Status: Pending Approval
3. Admin/Finance approves → Status: Approved
4. System generates payslips → Status: Processed
5. Employees can view payslips

**Appraisal Cycle:**
1. HR creates and launches cycle
2. Employees submit self-assessment
3. Managers submit reviews
4. HR submits final review
5. Status: Completed

### Validation Rules

**Attendance:**
- Cannot clock in twice on same day
- Cannot clock in for future dates
- Grace period: 15 minutes default
- Half-day if hours < 4

**Leave:**
- Check leave balance before approval
- Check minimum notice period
- Check max consecutive days
- Update balance after approval

**Timesheet:**
- Total hours per day <= 24
- Cannot log time for future dates
- Must be associated with active project

**Payroll:**
- Salary components must sum correctly
- Deductions cannot exceed gross salary
- Must have attendance data for calculation

---

## Data Relationships Summary

```
Company (1) → (*) Employees
Company (1) → (*) Projects
Company (1) → (*) Leave Types
Company (1) → (*) Skills

Employee (1) → (*) Attendance
Employee (1) → (*) Timesheets
Employee (1) → (*) Leave Requests
Employee (1) → (*) Payslips
Employee (1) → (*) Tasks (assigned)
Employee (1) → (*) Appraisals
Employee (1) → (*) Employee Skills
Employee (1) → (*) Documents (personal)

Project (1) → (*) Tasks
Project (1) → (*) Project Members
Project (1) → (*) Timesheet Entries

Payroll Cycle (1) → (*) Payslips
Appraisal Cycle (1) → (*) Appraisals

Manager (Employee) (1) → (*) Team Members (Employees)
```

---

## Notes for Backend Implementation

1. **Multi-Tenancy**: All queries must be scoped by `company_id` except Super Admin operations
2. **Authentication**: Use JWT tokens with refresh token mechanism
3. **Authorization**: Implement middleware to check user permissions for each endpoint
4. **Audit Logs**: Track all critical operations (create, update, delete)
5. **Soft Deletes**: Use `is_active` or `deleted_at` instead of hard deletes
6. **Pagination**: Implement cursor or offset pagination for list endpoints
7. **File Storage**: Use cloud storage (S3, Azure Blob) for documents and avatars
8. **Notifications**: Implement email/in-app notifications for approvals, deadlines
9. **Background Jobs**: Use queues for payroll processing, report generation
10. **Caching**: Cache frequently accessed data like company settings, permissions
11. **Rate Limiting**: Implement rate limiting on public endpoints
12. **Data Validation**: Validate all inputs on backend
13. **Error Handling**: Return consistent error responses with proper HTTP status codes
14. **API Versioning**: Version your APIs (e.g., /api/v1/)
15. **Documentation**: Generate API documentation (Swagger/OpenAPI)

---

## HTTP Status Codes

- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized (authenticated but no permission)
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```
