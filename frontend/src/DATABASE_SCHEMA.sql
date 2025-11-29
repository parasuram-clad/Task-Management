-- HR & Project Management System - Complete Database Schema
-- PostgreSQL Implementation
-- Version: 2.0 (Updated with Invoice Management, Accounting, Notifications, and Enhanced Configuration)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Companies (Multi-tenant)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    industry VARCHAR(100),
    size VARCHAR(20),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    plan VARCHAR(50) DEFAULT 'free', -- free, basic, professional, enterprise
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company Settings
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Security Settings
    require_mfa BOOLEAN DEFAULT false,
    password_expiry_days INTEGER DEFAULT 90,
    session_timeout_minutes INTEGER DEFAULT 30,
    ip_whitelist TEXT[], -- Array of allowed IP addresses
    max_login_attempts INTEGER DEFAULT 5,
    
    -- Notification Settings
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    
    -- Regional Settings
    date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(20) DEFAULT '24h',
    week_start_day VARCHAR(10) DEFAULT 'Monday',
    fiscal_year_start VARCHAR(10) DEFAULT '01-01',
    
    -- Other Settings
    enable_geolocation BOOLEAN DEFAULT false,
    enable_biometric BOOLEAN DEFAULT false,
    default_language VARCHAR(10) DEFAULT 'en',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id)
);

-- Company Features (Feature flags per company)
CREATE TABLE company_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Core HR
    employee_management BOOLEAN DEFAULT true,
    attendance BOOLEAN DEFAULT true,
    leave_management BOOLEAN DEFAULT true,
    document_management BOOLEAN DEFAULT true,
    payroll BOOLEAN DEFAULT false,
    
    -- Recruitment
    requisition_management BOOLEAN DEFAULT false,
    candidate_portal BOOLEAN DEFAULT false,
    interview_management BOOLEAN DEFAULT false,
    onboarding BOOLEAN DEFAULT false,
    
    -- Performance & Development
    performance_appraisals BOOLEAN DEFAULT false,
    goals_okr BOOLEAN DEFAULT false,
    skills_competencies BOOLEAN DEFAULT true,
    learning_development BOOLEAN DEFAULT false,
    
    -- Employee Services
    claims_reimbursement BOOLEAN DEFAULT false,
    shift_scheduling BOOLEAN DEFAULT false,
    travel_management BOOLEAN DEFAULT false,
    timesheet BOOLEAN DEFAULT true,
    
    -- Projects & Tasks
    project_management BOOLEAN DEFAULT true,
    task_management BOOLEAN DEFAULT true,
    leads_crm BOOLEAN DEFAULT false,
    
    -- Engagement
    surveys_polls BOOLEAN DEFAULT false,
    feedback_recognition BOOLEAN DEFAULT false,
    
    -- Finance & Accounting
    invoicing BOOLEAN DEFAULT false,
    accounting BOOLEAN DEFAULT false,
    expense_tracking BOOLEAN DEFAULT false,
    
    -- Reports & Analytics
    hr_reports BOOLEAN DEFAULT true,
    project_reports BOOLEAN DEFAULT true,
    financial_reports BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id)
);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    head_employee_id UUID,
    parent_department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

-- Users (Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    employee_id VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('employee', 'manager', 'hr', 'admin', 'finance', 'accounts')),
    department VARCHAR(100),
    designation VARCHAR(100),
    avatar TEXT,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    blood_group VARCHAR(5),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_super_admin BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id)
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees (Extended employee information)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL,
    department_id UUID REFERENCES departments(id),
    department VARCHAR(100),
    designation VARCHAR(100),
    reporting_manager_id UUID REFERENCES employees(id),
    date_of_joining DATE NOT NULL,
    date_of_exit DATE,
    employment_type VARCHAR(20) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern')),
    work_location VARCHAR(20) CHECK (work_location IN ('office', 'remote', 'hybrid')),
    salary_basic DECIMAL(12, 2),
    salary_hra DECIMAL(12, 2),
    salary_special_allowance DECIMAL(12, 2),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    pan_number VARCHAR(20),
    aadhar_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id)
);

-- ============================================================================
-- ATTENDANCE & TIMESHEET
-- ============================================================================

-- Attendance Settings
CREATE TABLE attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_hours_per_day DECIMAL(4, 2) DEFAULT 8.0,
    grace_period_minutes INTEGER DEFAULT 15,
    half_day_threshold_hours DECIMAL(4, 2) DEFAULT 4.0,
    working_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]',
    shift_start_time TIME DEFAULT '09:00:00',
    shift_end_time TIME DEFAULT '18:00:00',
    track_location BOOLEAN DEFAULT false,
    auto_clock_out BOOLEAN DEFAULT false,
    allow_mobile_clock_in BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id)
);

-- Attendance Records
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP NOT NULL,
    clock_out TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'half-day', 'late', 'on-leave')),
    work_hours DECIMAL(5, 2),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    notes TEXT,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id, date)
);

-- Timesheets
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    total_hours DECIMAL(6, 2) DEFAULT 0,
    submitted_at TIMESTAMP,
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id, week_start_date)
);

-- Timesheet Entries
CREATE TABLE timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    task_id UUID,
    date DATE NOT NULL,
    hours DECIMAL(5, 2) NOT NULL CHECK (hours > 0 AND hours <= 24),
    description TEXT NOT NULL,
    billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- LEAVE MANAGEMENT
-- ============================================================================

-- Company Holidays
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('public', 'optional', 'restricted')),
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave Types
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    annual_quota INTEGER NOT NULL,
    max_consecutive_days INTEGER,
    min_notice_days INTEGER,
    carry_forward_enabled BOOLEAN DEFAULT false,
    max_carry_forward INTEGER,
    requires_approval BOOLEAN DEFAULT true,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, code)
);

-- Leave Balances
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    total_allocated DECIMAL(5, 2) NOT NULL,
    used DECIMAL(5, 2) DEFAULT 0,
    pending DECIMAL(5, 2) DEFAULT 0,
    available DECIMAL(5, 2) NOT NULL,
    carried_forward DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, employee_id, leave_type_id, year)
);

-- Leave Requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4, 1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approver_id UUID REFERENCES employees(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PAYROLL MANAGEMENT
-- ============================================================================

-- Payroll Cycles
CREATE TABLE payroll_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_employees INTEGER NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'initiated', 'pending_approval', 'approved', 'processed', 'finalized')),
    initiated_by UUID REFERENCES employees(id),
    initiated_date DATE,
    approved_by UUID REFERENCES employees(id),
    approved_date DATE,
    processed_date DATE,
    finalized_date DATE,
    rejection_reason TEXT,
    breakdown JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, month, year)
);

-- Payslips
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    payment_date DATE,
    
    -- Earnings
    basic_salary DECIMAL(12, 2) NOT NULL,
    hra DECIMAL(12, 2) DEFAULT 0,
    special_allowance DECIMAL(12, 2) DEFAULT 0,
    performance_bonus DECIMAL(12, 2) DEFAULT 0,
    overtime_pay DECIMAL(12, 2) DEFAULT 0,
    other_allowances DECIMAL(12, 2) DEFAULT 0,
    gross_salary DECIMAL(12, 2) NOT NULL,
    
    -- Deductions
    provident_fund DECIMAL(12, 2) DEFAULT 0,
    professional_tax DECIMAL(12, 2) DEFAULT 0,
    income_tax DECIMAL(12, 2) DEFAULT 0,
    insurance DECIMAL(12, 2) DEFAULT 0,
    loan_deduction DECIMAL(12, 2) DEFAULT 0,
    other_deductions DECIMAL(12, 2) DEFAULT 0,
    total_deductions DECIMAL(12, 2) NOT NULL,
    
    -- Net
    net_salary DECIMAL(12, 2) NOT NULL,
    
    -- Attendance
    working_days INTEGER NOT NULL,
    present_days INTEGER NOT NULL,
    leaves_taken INTEGER DEFAULT 0,
    loss_of_pay_days INTEGER DEFAULT 0,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('bank_transfer', 'cash', 'cheque')),
    transaction_id VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, payroll_cycle_id, employee_id)
);

-- Salary Components
CREATE TABLE salary_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    component_type VARCHAR(20) CHECK (component_type IN ('earning', 'deduction')),
    component_name VARCHAR(100) NOT NULL,
    calculation_type VARCHAR(20) CHECK (calculation_type IN ('fixed', 'percentage', 'formula')),
    value DECIMAL(12, 2) NOT NULL,
    is_taxable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PROJECT & TASK MANAGEMENT
-- ============================================================================

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    project_manager_id UUID NOT NULL REFERENCES employees(id),
    client_id UUID,
    client_name VARCHAR(255),
    start_date DATE,
    end_date DATE,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    budget DECIMAL(15, 2),
    spent DECIMAL(15, 2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    tags JSONB,
    color VARCHAR(7),
    is_billable BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Members
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(100),
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    hourly_rate DECIMAL(10, 2),
    joined_date DATE NOT NULL,
    left_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, employee_id)
);

-- Project Milestones
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'delayed')),
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Activities
CREATE TABLE project_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) CHECK (activity_type IN ('created', 'updated', 'status_changed', 'member_added', 'member_removed', 'comment', 'milestone_completed')),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done', 'blocked')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assignee_id UUID REFERENCES employees(id),
    reporter_id UUID NOT NULL REFERENCES employees(id),
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2) DEFAULT 0,
    due_date DATE,
    start_date DATE,
    completed_date DATE,
    tags JSONB,
    parent_task_id UUID REFERENCES tasks(id),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Comments
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Attachments
CREATE TABLE task_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES employees(id),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Dependencies
CREATE TABLE task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish-to-start' CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, depends_on_task_id)
);

-- ============================================================================
-- PERFORMANCE & APPRAISAL
-- ============================================================================

-- Appraisal Templates
CREATE TABLE appraisal_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sections JSONB NOT NULL,
    rating_scale JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appraisal Cycles
CREATE TABLE appraisal_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter IN (1, 2, 3, 4)),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    self_assessment_deadline DATE NOT NULL,
    manager_review_deadline DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    template_id UUID NOT NULL REFERENCES appraisal_templates(id),
    created_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appraisals
CREATE TABLE appraisals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    manager_id UUID NOT NULL REFERENCES employees(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'self_assessment_submitted', 'manager_review_submitted', 'hr_review_submitted', 'completed')),
    
    -- Self Assessment
    self_assessment JSONB,
    self_assessment_submitted_at TIMESTAMP,
    
    -- Manager Review
    manager_review JSONB,
    manager_rating DECIMAL(3, 2),
    manager_comments TEXT,
    manager_review_submitted_at TIMESTAMP,
    
    -- HR Review
    hr_review JSONB,
    hr_rating DECIMAL(3, 2),
    hr_comments TEXT,
    hr_review_submitted_at TIMESTAMP,
    
    -- Final
    overall_rating DECIMAL(3, 2),
    promotion_recommended BOOLEAN DEFAULT false,
    increment_percentage DECIMAL(5, 2),
    development_areas TEXT,
    achievements TEXT,
    goals_next_period TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, cycle_id, employee_id)
);

-- Performance Ratings History
CREATE TABLE performance_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    appraisal_id UUID REFERENCES appraisals(id) ON DELETE CASCADE,
    rating_period DATE NOT NULL,
    rating DECIMAL(3, 2) NOT NULL,
    rating_category VARCHAR(50),
    rated_by UUID REFERENCES employees(id),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SKILLS & COMPETENCIES
-- ============================================================================

-- Skill Categories
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES skill_categories(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    proficiency_levels JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Employee Skills
CREATE TABLE employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
    years_of_experience DECIMAL(4, 1),
    last_used DATE,
    endorsed_by JSONB,
    certification VARCHAR(255),
    notes TEXT,
    verified_by UUID REFERENCES employees(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, skill_id)
);

-- Skill Endorsements
CREATE TABLE skill_endorsements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_skill_id UUID NOT NULL REFERENCES employee_skills(id) ON DELETE CASCADE,
    endorsed_by UUID NOT NULL REFERENCES employees(id),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_skill_id, endorsed_by)
);

-- ============================================================================
-- DOCUMENT MANAGEMENT
-- ============================================================================

-- Document Categories
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES document_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('policy', 'handbook', 'form', 'certificate', 'personal', 'contract', 'other')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    access_level VARCHAR(20) DEFAULT 'employees' CHECK (access_level IN ('public', 'employees', 'managers', 'hr_only', 'personal')),
    uploaded_by UUID NOT NULL REFERENCES employees(id),
    employee_id UUID REFERENCES employees(id),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    expires_at DATE,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Versions
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES employees(id),
    change_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Access Log
CREATE TABLE document_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    access_type VARCHAR(20) CHECK (access_type IN ('view', 'download', 'edit', 'share')),
    ip_address INET,
    accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERMISSIONS & ROLES
-- ============================================================================

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, name)
);

-- Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- User Roles
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- ============================================================================
-- LEADS & CRM
-- ============================================================================

-- Clients
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    company_name VARCHAR(255),
    address TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    account_manager_id UUID REFERENCES employees(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    notes TEXT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    position VARCHAR(100),
    source VARCHAR(50) CHECK (source IN ('website', 'referral', 'linkedin', 'cold-call', 'event', 'advertisement', 'other')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    value DECIMAL(15, 2),
    probability INTEGER CHECK (probability >= 0 AND probability <= 100),
    assigned_to UUID REFERENCES employees(id),
    notes TEXT,
    next_follow_up DATE,
    converted_to_project_id UUID REFERENCES projects(id),
    converted_to_client_id UUID REFERENCES clients(id),
    lost_reason TEXT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead Activities
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    activity_type VARCHAR(50) CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'status_change', 'proposal_sent')),
    description TEXT NOT NULL,
    duration_minutes INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INVOICE MANAGEMENT
-- ============================================================================

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    client_id UUID REFERENCES clients(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_address TEXT,
    project_id UUID REFERENCES projects(id),
    project_name VARCHAR(255),
    
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_terms INTEGER NOT NULL, -- Days
    
    subtotal DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    amount_due DECIMAL(15, 2) NOT NULL,
    
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
    payment_method VARCHAR(20) CHECK (payment_method IN ('bank_transfer', 'credit_card', 'cash', 'cheque', 'upi', 'other')),
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ACCOUNTING & BOOKKEEPING
-- ============================================================================

-- Chart of Accounts
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    account_subtype VARCHAR(50),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    description TEXT,
    balance DECIMAL(15, 2) DEFAULT 0,
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
    reversed_entry_id UUID REFERENCES journal_entries(id),
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
    CHECK (debit = 0 OR credit = 0), -- Either debit or credit, not both
    CHECK (debit > 0 OR credit > 0)  -- At least one must be positive
);

-- Ledger Entries (Generated from journal entries when posted)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    debit DECIMAL(15, 2) DEFAULT 0,
    credit DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) NOT NULL, -- Running balance
    reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- leave_approval, timesheet_approval, task_assigned, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    icon VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, notification_type)
);

-- Email Logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
    sent_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

-- Integration Settings
CREATE TABLE integration_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- slack, teams, google, etc.
    is_enabled BOOLEAN DEFAULT false,
    config JSONB NOT NULL, -- Stores API keys, webhooks, etc. (encrypted)
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, integration_type)
);

-- Webhooks
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of event types
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhook Logs
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

-- Audit Log (for tracking all critical changes)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'APPROVE', 'REJECT')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Activity Logs
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Core Tables
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_is_active ON companies(is_active);

-- Users
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_super_admin ON users(is_super_admin);

-- Sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);

-- Employees
CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_reporting_manager_id ON employees(reporting_manager_id);
CREATE INDEX idx_employees_is_active ON employees(is_active);

-- Departments
CREATE INDEX idx_departments_company_id ON departments(company_id);

-- Company Settings
CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX idx_company_features_company_id ON company_features(company_id);

-- Attendance
CREATE INDEX idx_attendance_company_id ON attendance(company_id);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Timesheets
CREATE INDEX idx_timesheets_company_id ON timesheets(company_id);
CREATE INDEX idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_week_start ON timesheets(week_start_date);

-- Leave Requests
CREATE INDEX idx_leave_requests_company_id ON leave_requests(company_id);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Payroll
CREATE INDEX idx_payroll_cycles_company_id ON payroll_cycles(company_id);
CREATE INDEX idx_payroll_cycles_status ON payroll_cycles(status);
CREATE INDEX idx_payslips_company_id ON payslips(company_id);
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_payroll_cycle_id ON payslips(payroll_cycle_id);

-- Projects
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager_id ON projects(project_manager_id);
CREATE INDEX idx_projects_is_archived ON projects(is_archived);

-- Tasks
CREATE INDEX idx_tasks_company_id ON tasks(company_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_reporter_id ON tasks(reporter_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Appraisals
CREATE INDEX idx_appraisals_company_id ON appraisals(company_id);
CREATE INDEX idx_appraisals_employee_id ON appraisals(employee_id);
CREATE INDEX idx_appraisals_cycle_id ON appraisals(cycle_id);
CREATE INDEX idx_appraisals_manager_id ON appraisals(manager_id);
CREATE INDEX idx_appraisals_status ON appraisals(status);

-- Skills
CREATE INDEX idx_skills_company_id ON skills(company_id);
CREATE INDEX idx_skills_category_id ON skills(category_id);
CREATE INDEX idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill_id ON employee_skills(skill_id);

-- Documents
CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_is_active ON documents(is_active);

-- Leads & Clients
CREATE INDEX idx_clients_company_id ON clients(company_id);
CREATE INDEX idx_clients_account_manager_id ON clients(account_manager_id);
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_source ON leads(source);

-- Invoices
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_client_name ON invoices(client_name);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);

-- Accounting
CREATE INDEX idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX idx_chart_of_accounts_account_type ON chart_of_accounts(account_type);
CREATE INDEX idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_account_id);
CREATE INDEX idx_journal_entries_company_id ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_ledger_entries_company_id ON ledger_entries(company_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(transaction_date);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit Logs
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- TRIGGERS for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_features_updated_at BEFORE UPDATE ON company_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_settings_updated_at BEFORE UPDATE ON attendance_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON timesheet_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_cycles_updated_at BEFORE UPDATE ON payroll_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salary_components_updated_at BEFORE UPDATE ON salary_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON project_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appraisal_templates_updated_at BEFORE UPDATE ON appraisal_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appraisal_cycles_updated_at BEFORE UPDATE ON appraisal_cycles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appraisals_updated_at BEFORE UPDATE ON appraisals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_categories_updated_at BEFORE UPDATE ON skill_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_skills_updated_at BEFORE UPDATE ON employee_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_settings_updated_at BEFORE UPDATE ON integration_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS & PROCEDURES
-- ============================================================================

-- Function to calculate leave balance
CREATE OR REPLACE FUNCTION calculate_leave_balance(
    p_employee_id UUID,
    p_leave_type_id UUID,
    p_year INTEGER
) RETURNS DECIMAL(5, 2) AS $$
DECLARE
    v_balance DECIMAL(5, 2);
BEGIN
    SELECT available INTO v_balance
    FROM leave_balances
    WHERE employee_id = p_employee_id
    AND leave_type_id = p_leave_type_id
    AND year = p_year;
    
    RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update project progress based on tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_project_id UUID;
    v_total_tasks INTEGER;
    v_completed_tasks INTEGER;
    v_progress INTEGER;
BEGIN
    v_project_id := NEW.project_id;
    
    SELECT COUNT(*) INTO v_total_tasks
    FROM tasks
    WHERE project_id = v_project_id;
    
    SELECT COUNT(*) INTO v_completed_tasks
    FROM tasks
    WHERE project_id = v_project_id
    AND status = 'done';
    
    IF v_total_tasks > 0 THEN
        v_progress := ROUND((v_completed_tasks::DECIMAL / v_total_tasks::DECIMAL) * 100);
    ELSE
        v_progress := 0;
    END IF;
    
    UPDATE projects
    SET progress = v_progress
    WHERE id = v_project_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_status_changed
AFTER UPDATE OF status ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_project_progress();

-- Function to auto-update invoice status based on payment
CREATE OR REPLACE FUNCTION update_invoice_status_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    v_invoice_total DECIMAL(15, 2);
    v_total_paid DECIMAL(15, 2);
BEGIN
    SELECT total_amount INTO v_invoice_total
    FROM invoices
    WHERE id = NEW.invoice_id;
    
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM invoice_payments
    WHERE invoice_id = NEW.invoice_id;
    
    IF v_total_paid >= v_invoice_total THEN
        UPDATE invoices
        SET status = 'paid', paid_at = CURRENT_TIMESTAMP, amount_paid = v_total_paid, amount_due = 0
        WHERE id = NEW.invoice_id;
    ELSIF v_total_paid > 0 THEN
        UPDATE invoices
        SET status = 'partial', amount_paid = v_total_paid, amount_due = v_invoice_total - v_total_paid
        WHERE id = NEW.invoice_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_payment_added
AFTER INSERT ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_status_on_payment();

-- ============================================================================
-- VIEWS for Common Queries
-- ============================================================================

-- View for employee details with user info
CREATE OR REPLACE VIEW v_employee_details AS
SELECT 
    e.id,
    e.company_id,
    e.employee_id,
    u.name,
    u.email,
    u.phone,
    u.role,
    e.department,
    e.designation,
    e.date_of_joining,
    e.employment_type,
    e.work_location,
    e.is_active,
    u.avatar,
    rm.name AS reporting_manager_name
FROM employees e
JOIN users u ON e.user_id = u.id
LEFT JOIN employees manager ON e.reporting_manager_id = manager.id
LEFT JOIN users rm ON manager.user_id = rm.id;

-- View for project statistics
CREATE OR REPLACE VIEW v_project_stats AS
SELECT 
    p.id,
    p.company_id,
    p.name,
    p.status,
    p.progress,
    COUNT(DISTINCT pm.employee_id) AS team_size,
    COUNT(DISTINCT t.id) AS total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) AS completed_tasks,
    SUM(COALESCE(t.actual_hours, 0)) AS total_hours,
    p.budget,
    p.spent
FROM projects p
LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.is_active = true
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id;

-- View for invoice aging report
CREATE OR REPLACE VIEW v_invoice_aging AS
SELECT 
    i.id,
    i.company_id,
    i.invoice_number,
    i.client_name,
    i.issue_date,
    i.due_date,
    i.total_amount,
    i.amount_paid,
    i.amount_due,
    i.status,
    CURRENT_DATE - i.due_date AS days_overdue,
    CASE 
        WHEN i.status = 'paid' THEN 'Paid'
        WHEN CURRENT_DATE <= i.due_date THEN 'Current'
        WHEN CURRENT_DATE - i.due_date BETWEEN 1 AND 30 THEN '1-30 Days'
        WHEN CURRENT_DATE - i.due_date BETWEEN 31 AND 60 THEN '31-60 Days'
        WHEN CURRENT_DATE - i.due_date BETWEEN 61 AND 90 THEN '61-90 Days'
        ELSE '90+ Days'
    END AS aging_bucket
FROM invoices i
WHERE i.status != 'cancelled';

-- ============================================================================
-- DEFAULT DATA / SEED DATA
-- ============================================================================

-- Insert default permissions
INSERT INTO permissions (module, action, description, code) VALUES
('employees', 'view', 'View employees', 'employees.view'),
('employees', 'create', 'Create employees', 'employees.create'),
('employees', 'edit', 'Edit employees', 'employees.edit'),
('employees', 'delete', 'Delete employees', 'employees.delete'),
('attendance', 'view', 'View attendance', 'attendance.view'),
('attendance', 'mark', 'Mark attendance', 'attendance.mark'),
('attendance', 'approve', 'Approve attendance', 'attendance.approve'),
('leave', 'view', 'View leave requests', 'leave.view'),
('leave', 'apply', 'Apply for leave', 'leave.apply'),
('leave', 'approve', 'Approve leave', 'leave.approve'),
('payroll', 'view', 'View payroll', 'payroll.view'),
('payroll', 'process', 'Process payroll', 'payroll.process'),
('payroll', 'approve', 'Approve payroll', 'payroll.approve'),
('projects', 'view', 'View projects', 'projects.view'),
('projects', 'create', 'Create projects', 'projects.create'),
('projects', 'edit', 'Edit projects', 'projects.edit'),
('projects', 'delete', 'Delete projects', 'projects.delete'),
('tasks', 'view', 'View tasks', 'tasks.view'),
('tasks', 'create', 'Create tasks', 'tasks.create'),
('tasks', 'edit', 'Edit tasks', 'tasks.edit'),
('invoices', 'view', 'View invoices', 'invoices.view'),
('invoices', 'create', 'Create invoices', 'invoices.create'),
('invoices', 'edit', 'Edit invoices', 'invoices.edit'),
('accounting', 'view', 'View accounting', 'accounting.view'),
('accounting', 'manage', 'Manage accounting', 'accounting.manage'),
('reports', 'view', 'View reports', 'reports.view'),
('settings', 'manage', 'Manage settings', 'settings.manage');

-- ============================================================================
-- COMMENTS for Documentation
-- ============================================================================

COMMENT ON TABLE companies IS 'Multi-tenant companies/organizations';
COMMENT ON TABLE company_settings IS 'Company-specific configuration settings';
COMMENT ON TABLE company_features IS 'Feature flags for each company (40+ features)';
COMMENT ON TABLE users IS 'User authentication and basic profile';
COMMENT ON TABLE employees IS 'Extended employee information and employment details';
COMMENT ON TABLE attendance IS 'Daily attendance records with clock in/out';
COMMENT ON TABLE timesheets IS 'Weekly timesheet records for project time tracking';
COMMENT ON TABLE leave_requests IS 'Leave application and approval workflow';
COMMENT ON TABLE payroll_cycles IS 'Monthly payroll processing cycles';
COMMENT ON TABLE payslips IS 'Individual employee pay slips';
COMMENT ON TABLE projects IS 'Project management and tracking';
COMMENT ON TABLE tasks IS 'Task management with kanban workflow';
COMMENT ON TABLE appraisals IS 'Performance appraisal and reviews';
COMMENT ON TABLE skills IS 'Master skill catalog';
COMMENT ON TABLE employee_skills IS 'Employee skill proficiency tracking';
COMMENT ON TABLE documents IS 'Document management system';
COMMENT ON TABLE leads IS 'CRM leads and pipeline management';
COMMENT ON TABLE invoices IS 'Invoice management and billing';
COMMENT ON TABLE chart_of_accounts IS 'Chart of accounts for accounting';
COMMENT ON TABLE journal_entries IS 'Double-entry bookkeeping journal entries';
COMMENT ON TABLE notifications IS 'In-app notification system';
COMMENT ON TABLE audit_logs IS 'Complete audit trail for compliance';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
