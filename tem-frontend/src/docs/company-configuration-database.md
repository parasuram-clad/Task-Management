# Company Configuration Database Schema

## Overview
This document details the database schema required for the Company Configuration system with multi-tenant architecture and complete data isolation.

---

## Database Technology Stack

- **Primary Database**: PostgreSQL 14+
- **ORM**: Prisma / TypeORM (recommended)
- **Caching**: Redis for configuration caching
- **File Storage**: AWS S3 / Azure Blob Storage for logos and assets
- **Search**: PostgreSQL Full-Text Search or Elasticsearch

---

## 1. Core Tables

### 1.1 `companies`

Main company/tenant table with general information.

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL,
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Classification
    industry VARCHAR(50),
    company_size VARCHAR(50),
    
    -- Contact
    website VARCHAR(255),
    established_date DATE,
    description TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, inactive
    subscription_plan VARCHAR(50) DEFAULT 'free', -- free, basic, premium, enterprise
    subscription_expires_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Indexes
    CONSTRAINT companies_status_check CHECK (status IN ('active', 'suspended', 'inactive'))
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL;
```

### 1.2 `company_addresses`

Stores multiple addresses for companies (headquarters, billing, etc.)

```sql
CREATE TABLE company_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Address Type
    address_type VARCHAR(50) NOT NULL, -- headquarters, billing, shipping
    
    -- Address Details
    street VARCHAR(255),
    street_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Geolocation (optional)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Flags
    is_primary BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT company_addresses_type_check CHECK (address_type IN ('headquarters', 'billing', 'shipping', 'other'))
);

CREATE INDEX idx_company_addresses_company_id ON company_addresses(company_id);
CREATE INDEX idx_company_addresses_type ON company_addresses(address_type);
```

### 1.3 `company_contacts`

Stores contact information for companies.

```sql
CREATE TABLE company_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Contact Type
    contact_type VARCHAR(50) NOT NULL, -- primary, support, billing, technical
    
    -- Contact Details
    email VARCHAR(255),
    phone VARCHAR(50),
    extension VARCHAR(20),
    
    -- Person Details (optional)
    contact_name VARCHAR(255),
    contact_title VARCHAR(100),
    
    -- Flags
    is_primary BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT company_contacts_type_check CHECK (contact_type IN ('primary', 'support', 'billing', 'technical', 'other'))
);

CREATE INDEX idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX idx_company_contacts_type ON company_contacts(contact_type);
```

---

## 2. Configuration Tables

### 2.1 `company_settings`

Stores general configuration settings.

```sql
CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Localization
    timezone VARCHAR(100) DEFAULT 'UTC',
    date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(10) DEFAULT '24h', -- 12h, 24h
    currency VARCHAR(10) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Business Settings
    fiscal_year_start VARCHAR(10) DEFAULT '01-01', -- MM-DD format
    week_start_day VARCHAR(10) DEFAULT 'monday',
    
    -- Working Hours
    working_hours_start TIME DEFAULT '09:00',
    working_hours_end TIME DEFAULT '17:00',
    working_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday"]',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT company_settings_time_format_check CHECK (time_format IN ('12h', '24h'))
);

CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);
```

### 2.2 `company_features`

Stores feature enablement configuration.

```sql
CREATE TABLE company_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Feature Details
    feature_id VARCHAR(100) NOT NULL, -- employee_management, attendance_tracking, etc.
    feature_category VARCHAR(50), -- core, attendance, projects, hr, finance, etc.
    
    -- Status
    enabled BOOLEAN DEFAULT false,
    is_required BOOLEAN DEFAULT false,
    
    -- Configuration (feature-specific settings)
    config JSONB,
    
    -- Limits (for subscription-based limits)
    usage_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    
    -- Metadata
    enabled_at TIMESTAMP,
    disabled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT company_features_unique UNIQUE (company_id, feature_id)
);

CREATE INDEX idx_company_features_company_id ON company_features(company_id);
CREATE INDEX idx_company_features_feature_id ON company_features(feature_id);
CREATE INDEX idx_company_features_enabled ON company_features(enabled);
CREATE INDEX idx_company_features_category ON company_features(feature_category);
```

### 2.3 `feature_dependencies`

Defines dependencies between features.

```sql
CREATE TABLE feature_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id VARCHAR(100) NOT NULL,
    depends_on_feature_id VARCHAR(100) NOT NULL,
    dependency_type VARCHAR(20) DEFAULT 'required', -- required, optional, recommended
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT feature_dependencies_unique UNIQUE (feature_id, depends_on_feature_id),
    CONSTRAINT feature_dependencies_type_check CHECK (dependency_type IN ('required', 'optional', 'recommended'))
);

CREATE INDEX idx_feature_dependencies_feature_id ON feature_dependencies(feature_id);
CREATE INDEX idx_feature_dependencies_depends_on ON feature_dependencies(depends_on_feature_id);
```

### 2.4 `industry_templates`

Predefined feature templates for different industries.

```sql
CREATE TABLE industry_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Details
    industry_code VARCHAR(50) UNIQUE NOT NULL,
    industry_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Features
    default_features JSONB NOT NULL, -- Array of feature IDs
    recommended_features JSONB, -- Array of recommended feature IDs
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_industry_templates_code ON industry_templates(industry_code);
CREATE INDEX idx_industry_templates_active ON industry_templates(is_active);
```

---

## 3. Branding Tables

### 3.1 `company_branding`

Stores branding and theme configuration.

```sql
CREATE TABLE company_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Logo & Assets
    logo_url VARCHAR(500),
    logo_storage_key VARCHAR(255),
    logo_uploaded_at TIMESTAMP,
    
    favicon_url VARCHAR(500),
    favicon_storage_key VARCHAR(255),
    favicon_uploaded_at TIMESTAMP,
    
    background_image_url VARCHAR(500),
    background_storage_key VARCHAR(255),
    
    -- Colors (stored as hex values)
    color_primary VARCHAR(7) DEFAULT '#3b82f6',
    color_secondary VARCHAR(7) DEFAULT '#64748b',
    color_accent VARCHAR(7) DEFAULT '#8b5cf6',
    color_success VARCHAR(7) DEFAULT '#10b981',
    color_warning VARCHAR(7) DEFAULT '#f59e0b',
    color_error VARCHAR(7) DEFAULT '#ef4444',
    color_background VARCHAR(7) DEFAULT '#ffffff',
    color_foreground VARCHAR(7) DEFAULT '#0f172a',
    
    -- Additional color palette
    colors_extended JSONB, -- For additional color customizations
    
    -- Typography
    font_heading VARCHAR(100) DEFAULT 'Inter',
    font_body VARCHAR(100) DEFAULT 'Inter',
    font_config JSONB, -- Additional font configurations
    
    -- Custom CSS
    custom_css TEXT,
    
    -- Login Page Customization
    login_welcome_message TEXT,
    login_show_logo BOOLEAN DEFAULT true,
    login_config JSONB,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_branding_company_id ON company_branding(company_id);
```

---

## 4. Security Tables

### 4.1 `company_security_settings`

Stores security configuration.

```sql
CREATE TABLE company_security_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Password Policy
    password_min_length INTEGER DEFAULT 8,
    password_require_uppercase BOOLEAN DEFAULT true,
    password_require_lowercase BOOLEAN DEFAULT true,
    password_require_numbers BOOLEAN DEFAULT true,
    password_require_special_chars BOOLEAN DEFAULT false,
    password_expiry_days INTEGER DEFAULT 90,
    password_prevent_reuse INTEGER DEFAULT 5,
    
    -- MFA Configuration
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_required BOOLEAN DEFAULT false,
    mfa_methods JSONB DEFAULT '["totp", "email"]', -- totp, sms, email
    
    -- Session Management
    session_timeout_minutes INTEGER DEFAULT 30,
    max_concurrent_sessions INTEGER DEFAULT 3,
    remember_me_duration_days INTEGER DEFAULT 30,
    
    -- IP Whitelist
    ip_whitelist_enabled BOOLEAN DEFAULT false,
    allowed_ips JSONB, -- Array of IP addresses or CIDR ranges
    
    -- Login Restrictions
    max_failed_login_attempts INTEGER DEFAULT 5,
    account_lockout_duration_minutes INTEGER DEFAULT 30,
    allow_password_reset BOOLEAN DEFAULT true,
    
    -- Data Retention
    audit_log_retention_days INTEGER DEFAULT 365,
    backup_retention_days INTEGER DEFAULT 90,
    deleted_record_retention_days INTEGER DEFAULT 30,
    
    -- Encryption
    encrypt_data_at_rest BOOLEAN DEFAULT true,
    encrypt_backups BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_security_company_id ON company_security_settings(company_id);
```

### 4.2 `login_attempts`

Tracks login attempts for security monitoring.

```sql
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Attempt Details
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Result
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100), -- invalid_password, account_locked, account_disabled, etc.
    
    -- Location (optional)
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Metadata
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_company_id ON login_attempts(company_id);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX idx_login_attempts_success ON login_attempts(success);
```

### 4.3 `account_lockouts`

Tracks account lockouts.

```sql
CREATE TABLE account_lockouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Lockout Details
    reason VARCHAR(100) DEFAULT 'max_failed_attempts',
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP NOT NULL,
    unlocked_at TIMESTAMP,
    
    -- Failed attempts count
    failed_attempts INTEGER DEFAULT 0,
    
    -- Unlocked by
    unlocked_by UUID REFERENCES users(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_account_lockouts_company_id ON account_lockouts(company_id);
CREATE INDEX idx_account_lockouts_user_id ON account_lockouts(user_id);
CREATE INDEX idx_account_lockouts_active ON account_lockouts(is_active);
```

---

## 5. Notification Tables

### 5.1 `company_notification_settings`

Stores notification configuration.

```sql
CREATE TABLE company_notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Email Channel
    email_enabled BOOLEAN DEFAULT true,
    email_provider VARCHAR(50) DEFAULT 'sendgrid', -- sendgrid, ses, mailgun
    email_from_name VARCHAR(255),
    email_from_address VARCHAR(255),
    email_reply_to VARCHAR(255),
    
    -- SMS Channel
    sms_enabled BOOLEAN DEFAULT false,
    sms_provider VARCHAR(50), -- twilio, sns
    
    -- Push Channel
    push_enabled BOOLEAN DEFAULT true,
    
    -- In-App Channel
    in_app_enabled BOOLEAN DEFAULT true,
    
    -- Digest Settings
    digest_enabled BOOLEAN DEFAULT true,
    digest_frequency VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly
    digest_time TIME DEFAULT '09:00',
    
    -- Reminder Settings
    reminders_enabled BOOLEAN DEFAULT true,
    timesheet_reminder_enabled BOOLEAN DEFAULT true,
    leave_approval_reminder_enabled BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notification_digest_frequency_check CHECK (digest_frequency IN ('hourly', 'daily', 'weekly'))
);

CREATE INDEX idx_company_notification_settings_company_id ON company_notification_settings(company_id);
```

### 5.2 `notification_templates`

Stores customizable notification templates.

```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Template Details
    template_key VARCHAR(100) NOT NULL, -- welcome_email, password_reset, leave_request, etc.
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(50), -- authentication, hr, projects, finance
    
    -- Channel
    channel VARCHAR(20) NOT NULL, -- email, sms, push, in_app
    
    -- Content
    subject VARCHAR(500), -- For email/push
    body TEXT NOT NULL,
    
    -- HTML version (for email)
    html_body TEXT,
    
    -- Variables
    available_variables JSONB, -- Array of available template variables
    
    -- Status
    enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- System default template
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notification_templates_channel_check CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
    CONSTRAINT notification_templates_unique UNIQUE (company_id, template_key, channel)
);

CREATE INDEX idx_notification_templates_company_id ON notification_templates(company_id);
CREATE INDEX idx_notification_templates_key ON notification_templates(template_key);
CREATE INDEX idx_notification_templates_enabled ON notification_templates(enabled);
```

### 5.3 `notification_preferences`

User-specific notification preferences (overrides company settings).

```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Channel Preferences
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,
    
    -- Category Preferences
    preferences JSONB, -- Granular preferences per notification type
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT notification_preferences_unique UNIQUE (company_id, user_id)
);

CREATE INDEX idx_notification_preferences_company_id ON notification_preferences(company_id);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
```

---

## 6. Integration Tables

### 6.1 `company_integrations`

Stores third-party integration configurations.

```sql
CREATE TABLE company_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Integration Details
    integration_id VARCHAR(100) NOT NULL, -- slack, google_workspace, quickbooks, etc.
    integration_name VARCHAR(255) NOT NULL,
    integration_category VARCHAR(50), -- communication, productivity, accounting, payment
    
    -- Status
    enabled BOOLEAN DEFAULT false,
    connected BOOLEAN DEFAULT false,
    
    -- Configuration (encrypted)
    config JSONB, -- Stores integration-specific configuration
    credentials JSONB, -- Encrypted credentials
    
    -- OAuth Details (if applicable)
    oauth_access_token TEXT,
    oauth_refresh_token TEXT,
    oauth_token_expires_at TIMESTAMP,
    oauth_scope TEXT,
    
    -- Sync Settings
    auto_sync_enabled BOOLEAN DEFAULT false,
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_at TIMESTAMP,
    last_sync_status VARCHAR(20), -- success, failed, in_progress
    
    -- Metadata
    connected_at TIMESTAMP,
    disconnected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT company_integrations_unique UNIQUE (company_id, integration_id)
);

CREATE INDEX idx_company_integrations_company_id ON company_integrations(company_id);
CREATE INDEX idx_company_integrations_integration_id ON company_integrations(integration_id);
CREATE INDEX idx_company_integrations_enabled ON company_integrations(enabled);
CREATE INDEX idx_company_integrations_connected ON company_integrations(connected);
```

### 6.2 `integration_sync_logs`

Logs integration sync operations.

```sql
CREATE TABLE integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES company_integrations(id) ON DELETE CASCADE,
    
    -- Sync Details
    sync_type VARCHAR(50), -- manual, scheduled, webhook
    sync_direction VARCHAR(20), -- inbound, outbound, bidirectional
    
    -- Status
    status VARCHAR(20) NOT NULL, -- started, success, failed, partial
    
    -- Metrics
    records_processed INTEGER DEFAULT 0,
    records_succeeded INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    
    -- Error Details
    error_message TEXT,
    error_details JSONB,
    
    -- Timing
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INTEGER,
    
    CONSTRAINT integration_sync_logs_status_check CHECK (status IN ('started', 'success', 'failed', 'partial'))
);

CREATE INDEX idx_integration_sync_logs_company_id ON integration_sync_logs(company_id);
CREATE INDEX idx_integration_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs(started_at);
CREATE INDEX idx_integration_sync_logs_status ON integration_sync_logs(status);
```

### 6.3 `api_keys`

Stores API keys for external integrations.

```sql
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Key Details
    key_name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed API key
    key_prefix VARCHAR(20) NOT NULL, -- First few characters for identification
    description TEXT,
    
    -- Permissions
    permissions JSONB DEFAULT '["read"]', -- read, write, delete
    allowed_ips JSONB, -- IP whitelist for this key
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_day INTEGER DEFAULT 10000,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Usage Tracking
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    
    -- Expiry
    expires_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id)
);

CREATE INDEX idx_api_keys_company_id ON api_keys(company_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);
```

### 6.4 `webhooks`

Stores webhook configurations.

```sql
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Webhook Details
    webhook_name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    
    -- Events
    events JSONB NOT NULL, -- Array of event types to listen to
    
    -- Authentication
    secret VARCHAR(255), -- Webhook signing secret
    headers JSONB, -- Custom headers to send
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Retry Configuration
    max_retries INTEGER DEFAULT 3,
    retry_interval_seconds INTEGER DEFAULT 60,
    
    -- Stats
    last_triggered_at TIMESTAMP,
    total_deliveries INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_webhooks_company_id ON webhooks(company_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
```

### 6.5 `webhook_deliveries`

Logs webhook delivery attempts.

```sql
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type VARCHAR(100) NOT NULL,
    event_id UUID NOT NULL,
    
    -- Request
    request_payload JSONB NOT NULL,
    request_headers JSONB,
    
    -- Response
    response_status_code INTEGER,
    response_body TEXT,
    response_headers JSONB,
    
    -- Status
    status VARCHAR(20) NOT NULL, -- pending, success, failed
    attempt_number INTEGER DEFAULT 1,
    
    -- Timing
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    
    -- Error
    error_message TEXT,
    
    -- Next Retry
    next_retry_at TIMESTAMP,
    
    CONSTRAINT webhook_deliveries_status_check CHECK (status IN ('pending', 'success', 'failed'))
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_company_id ON webhook_deliveries(company_id);
CREATE INDEX idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_sent_at ON webhook_deliveries(sent_at);
```

---

## 7. Audit & History Tables

### 7.1 `configuration_audit_log`

Tracks all configuration changes.

```sql
CREATE TABLE configuration_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Change Details
    section VARCHAR(50) NOT NULL, -- general, features, branding, security, notifications, integrations
    action VARCHAR(20) NOT NULL, -- create, update, delete, enable, disable
    entity_type VARCHAR(100), -- specific entity being changed
    entity_id VARCHAR(255), -- ID of the specific entity
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB, -- Array of field names that changed
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT configuration_audit_section_check CHECK (section IN ('general', 'features', 'branding', 'security', 'notifications', 'integrations')),
    CONSTRAINT configuration_audit_action_check CHECK (action IN ('create', 'update', 'delete', 'enable', 'disable', 'reset'))
);

CREATE INDEX idx_config_audit_company_id ON configuration_audit_log(company_id);
CREATE INDEX idx_config_audit_section ON configuration_audit_log(section);
CREATE INDEX idx_config_audit_action ON configuration_audit_log(action);
CREATE INDEX idx_config_audit_performed_by ON configuration_audit_log(performed_by);
CREATE INDEX idx_config_audit_performed_at ON configuration_audit_log(performed_at);
```

### 7.2 `configuration_snapshots`

Stores point-in-time snapshots of complete configuration.

```sql
CREATE TABLE configuration_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Snapshot Details
    snapshot_name VARCHAR(255),
    snapshot_type VARCHAR(50) DEFAULT 'automatic', -- automatic, manual, backup
    
    -- Configuration Data
    configuration JSONB NOT NULL, -- Complete configuration at this point in time
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    
    -- Restoration
    restored_at TIMESTAMP,
    restored_by UUID REFERENCES users(id),
    
    CONSTRAINT configuration_snapshots_type_check CHECK (snapshot_type IN ('automatic', 'manual', 'backup', 'rollback'))
);

CREATE INDEX idx_config_snapshots_company_id ON configuration_snapshots(company_id);
CREATE INDEX idx_config_snapshots_type ON configuration_snapshots(snapshot_type);
CREATE INDEX idx_config_snapshots_created_at ON configuration_snapshots(created_at);
```

---

## 8. System Tables

### 8.1 `feature_catalog`

Master catalog of all available features in the system.

```sql
CREATE TABLE feature_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Feature Details
    feature_id VARCHAR(100) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    feature_category VARCHAR(50) NOT NULL,
    
    -- Classification
    is_core BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    required_plan VARCHAR(50), -- free, basic, premium, enterprise
    
    -- Dependencies
    dependencies JSONB, -- Array of feature IDs this feature depends on
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_catalog_feature_id ON feature_catalog(feature_id);
CREATE INDEX idx_feature_catalog_category ON feature_catalog(feature_category);
CREATE INDEX idx_feature_catalog_active ON feature_catalog(is_active);
```

### 8.2 `system_settings`

Global system settings (Super Admin level).

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Setting Details
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_category VARCHAR(50),
    description TEXT,
    
    -- Validation
    validation_rules JSONB, -- Rules for validating the setting value
    
    -- Metadata
    is_public BOOLEAN DEFAULT false, -- Can be accessed without authentication
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(setting_category);
```

---

## 9. Views

### 9.1 Active Companies View

```sql
CREATE VIEW v_active_companies AS
SELECT 
    c.id,
    c.company_name,
    c.slug,
    c.industry,
    c.status,
    c.subscription_plan,
    c.subscription_expires_at,
    c.created_at,
    COUNT(DISTINCT cf.id) FILTER (WHERE cf.enabled = true) as enabled_features_count,
    cb.logo_url,
    cb.color_primary
FROM companies c
LEFT JOIN company_features cf ON c.id = cf.company_id
LEFT JOIN company_branding cb ON c.id = cb.company_id
WHERE c.deleted_at IS NULL
  AND c.status = 'active'
GROUP BY c.id, cb.logo_url, cb.color_primary;
```

### 9.2 Company Configuration Summary View

```sql
CREATE VIEW v_company_configuration_summary AS
SELECT 
    c.id as company_id,
    c.company_name,
    c.status,
    -- Settings
    cs.timezone,
    cs.currency,
    cs.language,
    -- Features
    COUNT(DISTINCT cf.id) FILTER (WHERE cf.enabled = true) as enabled_features,
    COUNT(DISTINCT cf.id) as total_features,
    -- Integrations
    COUNT(DISTINCT ci.id) FILTER (WHERE ci.enabled = true AND ci.connected = true) as active_integrations,
    -- Security
    css.mfa_enabled,
    css.password_min_length,
    -- Branding
    CASE WHEN cb.logo_url IS NOT NULL THEN true ELSE false END as has_custom_branding,
    -- Last Updated
    GREATEST(
        c.updated_at,
        cs.updated_at,
        cb.updated_at,
        css.updated_at
    ) as last_configuration_update
FROM companies c
LEFT JOIN company_settings cs ON c.id = cs.company_id
LEFT JOIN company_features cf ON c.id = cf.company_id
LEFT JOIN company_integrations ci ON c.id = ci.company_id
LEFT JOIN company_branding cb ON c.id = cb.company_id
LEFT JOIN company_security_settings css ON c.id = css.company_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.company_name, c.status, cs.timezone, cs.currency, cs.language,
         css.mfa_enabled, css.password_min_length, cb.logo_url, c.updated_at,
         cs.updated_at, cb.updated_at, css.updated_at;
```

---

## 10. Indexes & Performance Optimization

### 10.1 Composite Indexes

```sql
-- For feature lookup by company and category
CREATE INDEX idx_company_features_company_category 
ON company_features(company_id, feature_category) 
WHERE enabled = true;

-- For integration status lookup
CREATE INDEX idx_company_integrations_company_status 
ON company_integrations(company_id, enabled, connected);

-- For audit log searching
CREATE INDEX idx_config_audit_company_section_date 
ON configuration_audit_log(company_id, section, performed_at DESC);

-- For webhook delivery status
CREATE INDEX idx_webhook_deliveries_webhook_status_date 
ON webhook_deliveries(webhook_id, status, sent_at DESC);
```

### 10.2 Partial Indexes

```sql
-- Only index active companies
CREATE INDEX idx_companies_active 
ON companies(id, company_name) 
WHERE deleted_at IS NULL AND status = 'active';

-- Only index active features
CREATE INDEX idx_company_features_active 
ON company_features(company_id, feature_id) 
WHERE enabled = true;

-- Only index active API keys
CREATE INDEX idx_api_keys_active_lookup 
ON api_keys(company_id, key_hash) 
WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);
```

---

## 11. Data Retention & Archival

### 11.1 Archival Strategy

```sql
-- Archive old audit logs (run monthly)
CREATE TABLE configuration_audit_log_archive (
    LIKE configuration_audit_log INCLUDING ALL
);

-- Archive old webhook deliveries (run weekly)
CREATE TABLE webhook_deliveries_archive (
    LIKE webhook_deliveries INCLUDING ALL
);

-- Archive old login attempts (run monthly)
CREATE TABLE login_attempts_archive (
    LIKE login_attempts INCLUDING ALL
);
```

### 11.2 Retention Policies

```sql
-- Delete old audit logs beyond retention period
-- (to be run as scheduled job based on company_security_settings.audit_log_retention_days)

-- Delete old webhook deliveries after 90 days
-- DELETE FROM webhook_deliveries WHERE sent_at < NOW() - INTERVAL '90 days';

-- Delete old login attempts after 1 year
-- DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '1 year';
```

---

## 12. Triggers

### 12.1 Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_features_updated_at BEFORE UPDATE ON company_features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... apply to other tables as needed
```

### 12.2 Feature Dependency Validation Trigger

```sql
CREATE OR REPLACE FUNCTION validate_feature_dependencies()
RETURNS TRIGGER AS $$
DECLARE
    missing_deps TEXT[];
BEGIN
    -- When disabling a feature, check if other features depend on it
    IF NEW.enabled = false AND OLD.enabled = true THEN
        SELECT array_agg(cf.feature_id)
        INTO missing_deps
        FROM company_features cf
        JOIN feature_dependencies fd ON cf.feature_id = fd.feature_id
        WHERE cf.company_id = NEW.company_id
          AND cf.enabled = true
          AND fd.depends_on_feature_id = NEW.feature_id
          AND fd.dependency_type = 'required';
        
        IF array_length(missing_deps, 1) > 0 THEN
            RAISE EXCEPTION 'Cannot disable feature %. Required by: %', 
                NEW.feature_id, array_to_string(missing_deps, ', ');
        END IF;
    END IF;
    
    -- When enabling a feature, ensure dependencies are met
    IF NEW.enabled = true AND OLD.enabled = false THEN
        SELECT array_agg(fd.depends_on_feature_id)
        INTO missing_deps
        FROM feature_dependencies fd
        LEFT JOIN company_features cf ON 
            cf.company_id = NEW.company_id AND 
            cf.feature_id = fd.depends_on_feature_id AND 
            cf.enabled = true
        WHERE fd.feature_id = NEW.feature_id
          AND fd.dependency_type = 'required'
          AND cf.id IS NULL;
        
        IF array_length(missing_deps, 1) > 0 THEN
            RAISE EXCEPTION 'Cannot enable feature %. Missing dependencies: %', 
                NEW.feature_id, array_to_string(missing_deps, ', ');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_feature_dependencies_trigger
    BEFORE UPDATE ON company_features
    FOR EACH ROW
    EXECUTE FUNCTION validate_feature_dependencies();
```

### 12.3 Audit Log Trigger

```sql
CREATE OR REPLACE FUNCTION log_configuration_change()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuration_audit_log (
        company_id,
        section,
        action,
        entity_type,
        old_values,
        new_values,
        performed_by
    ) VALUES (
        COALESCE(NEW.company_id, OLD.company_id),
        TG_ARGV[0], -- section name passed as trigger argument
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'create'
            WHEN TG_OP = 'UPDATE' THEN 'update'
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        TG_TABLE_NAME,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        COALESCE(NEW.updated_by, current_setting('app.current_user_id', true)::UUID)
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to configuration tables
CREATE TRIGGER log_company_settings_changes
    AFTER INSERT OR UPDATE OR DELETE ON company_settings
    FOR EACH ROW EXECUTE FUNCTION log_configuration_change('general');

CREATE TRIGGER log_company_features_changes
    AFTER INSERT OR UPDATE OR DELETE ON company_features
    FOR EACH ROW EXECUTE FUNCTION log_configuration_change('features');

CREATE TRIGGER log_company_branding_changes
    AFTER INSERT OR UPDATE OR DELETE ON company_branding
    FOR EACH ROW EXECUTE FUNCTION log_configuration_change('branding');

-- ... apply to other configuration tables
```

---

## 13. Constraints & Data Integrity

### 13.1 Check Constraints

```sql
-- Ensure valid email formats
ALTER TABLE company_contacts 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Ensure valid hex colors
ALTER TABLE company_branding 
ADD CONSTRAINT check_color_format 
CHECK (
    color_primary ~* '^#[0-9A-Fa-f]{6}$' AND
    color_secondary ~* '^#[0-9A-Fa-f]{6}$' AND
    color_accent ~* '^#[0-9A-Fa-f]{6}$'
);

-- Ensure positive limits
ALTER TABLE api_keys 
ADD CONSTRAINT check_positive_limits 
CHECK (
    rate_limit_per_minute > 0 AND
    rate_limit_per_day > 0
);

-- Ensure password policy minimums
ALTER TABLE company_security_settings 
ADD CONSTRAINT check_password_policy 
CHECK (
    password_min_length >= 8 AND
    password_expiry_days > 0 AND
    password_prevent_reuse >= 0
);
```

---

## 14. Sample Data & Seed Scripts

### 14.1 Feature Catalog Seed Data

```sql
-- Seed core features
INSERT INTO feature_catalog (feature_id, feature_name, description, feature_category, is_core, required_plan) VALUES
('employee_management', 'Employee Management', 'Manage employee profiles and information', 'core', true, 'free'),
('user_roles', 'User Roles & Permissions', 'Role-based access control', 'core', true, 'free'),
('attendance_tracking', 'Attendance Tracking', 'Track employee attendance', 'attendance', false, 'basic'),
('timesheet_management', 'Timesheet Management', 'Manage employee timesheets', 'attendance', false, 'basic'),
('leave_management', 'Leave Management', 'Handle leave requests and approvals', 'hr', false, 'basic'),
('project_management', 'Project Management', 'Create and manage projects', 'projects', false, 'premium'),
('task_management', 'Task Management', 'Task tracking and assignment', 'projects', false, 'premium'),
('kanban_boards', 'Kanban Boards', 'Visual task management boards', 'projects', false, 'premium'),
('payroll_management', 'Payroll Management', 'Process employee payroll', 'finance', false, 'premium'),
('invoice_management', 'Invoice Management', 'Create and manage invoices', 'finance', false, 'premium'),
('document_management', 'Document Management', 'Store and manage documents', 'documents', false, 'basic'),
('reporting', 'Reporting & Analytics', 'Generate reports and analytics', 'documents', false, 'premium');
```

### 14.2 Feature Dependencies Seed Data

```sql
INSERT INTO feature_dependencies (feature_id, depends_on_feature_id, dependency_type) VALUES
('attendance_tracking', 'employee_management', 'required'),
('timesheet_management', 'employee_management', 'required'),
('leave_management', 'employee_management', 'required'),
('task_management', 'project_management', 'required'),
('kanban_boards', 'task_management', 'required'),
('payroll_management', 'employee_management', 'required');
```

### 14.3 Industry Templates Seed Data

```sql
INSERT INTO industry_templates (industry_code, industry_name, description, default_features) VALUES
('technology', 'Technology', 'Software development and IT companies', 
 '["employee_management", "user_roles", "attendance_tracking", "timesheet_management", "project_management", "task_management", "kanban_boards", "document_management", "reporting"]'),
('healthcare', 'Healthcare', 'Hospitals and medical facilities',
 '["employee_management", "user_roles", "attendance_tracking", "leave_management", "document_management", "reporting"]'),
('manufacturing', 'Manufacturing', 'Manufacturing and production companies',
 '["employee_management", "user_roles", "attendance_tracking", "project_management", "document_management"]'),
('retail', 'Retail', 'Retail and e-commerce businesses',
 '["employee_management", "user_roles", "attendance_tracking", "invoice_management", "document_management"]');
```

---

## 15. Backup & Recovery

### 15.1 Backup Strategy

```bash
# Daily full backup
pg_dump -h localhost -U postgres -d hrpm_db -F c -b -v -f backup_$(date +%Y%m%d).dump

# Backup specific schemas
pg_dump -h localhost -U postgres -d hrpm_db -n public -F c -f schema_backup.dump
```

### 15.2 Point-in-Time Recovery

Enable WAL archiving in postgresql.conf:
```
wal_level = replica
archive_mode = on
archive_command = 'cp %p /path/to/archive/%f'
```

---

## 16. Security Considerations

1. **Row-Level Security (RLS)**: Implement RLS policies to ensure data isolation
2. **Encryption**: Encrypt sensitive columns (credentials, API keys) at rest
3. **Audit Logging**: All configuration changes are logged
4. **Access Control**: Restrict Super Admin access with additional authentication
5. **Data Masking**: Mask sensitive data in logs and exports

---

## 17. Migration Strategy

### 17.1 Initial Migration Order

1. Create core tables: `companies`, `users`
2. Create configuration tables
3. Create audit tables
4. Create indexes
5. Create views
6. Create triggers
7. Seed static data (features, templates)

### 17.2 Sample Migration (using Prisma/TypeORM style)

```typescript
// 001_create_companies_table.ts
export async function up(db: Database) {
  await db.schema.createTable('companies', (table) => {
    table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
    table.string('company_name', 255).notNullable();
    table.string('slug', 100).unique().notNullable();
    // ... other fields
    table.timestamps(true, true);
  });
}
```

---

## Notes

1. **Multi-Tenancy**: All company-specific tables include `company_id` for tenant isolation
2. **Soft Deletes**: Use `deleted_at` timestamp for soft deletion
3. **JSONB Usage**: Store flexible configuration in JSONB for extensibility
4. **Indexing**: Indexes are critical for multi-tenant queries
5. **Partitioning**: Consider table partitioning for large tables (audit logs, webhooks)
6. **Caching**: Use Redis to cache company configurations for better performance
