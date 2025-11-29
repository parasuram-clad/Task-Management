# Company Configuration API Documentation

## Overview
This document details the API endpoints required for the Company Configuration system, which allows Super Admins to configure 40+ features across 8 categories with industry-based templates.

---

## Authentication & Authorization
- **Required Role**: Super Admin only
- **Authentication**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <token>`

---

## 1. General Settings APIs

### 1.1 Get Company General Settings
```http
GET /api/super-admin/companies/{companyId}/settings/general
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "companyName": "Acme Corporation",
    "legalName": "Acme Corporation Private Limited",
    "registrationNumber": "REG123456",
    "taxId": "TAX987654",
    "industry": "technology",
    "companySize": "50-200",
    "website": "https://acme.com",
    "establishedDate": "2020-01-15",
    "description": "Leading tech company",
    "addresses": {
      "headquarters": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "postalCode": "94105"
      },
      "billing": {
        "street": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "postalCode": "94105"
      }
    },
    "contact": {
      "email": "contact@acme.com",
      "phone": "+1-555-0100",
      "supportEmail": "support@acme.com",
      "supportPhone": "+1-555-0101"
    },
    "timezone": "America/Los_Angeles",
    "dateFormat": "MM/DD/YYYY",
    "timeFormat": "12h",
    "currency": "USD",
    "language": "en",
    "fiscalYearStart": "01-01",
    "updatedAt": "2025-11-21T10:30:00Z",
    "updatedBy": "user-uuid"
  }
}
```

### 1.2 Update Company General Settings
```http
PUT /api/super-admin/companies/{companyId}/settings/general
```

**Request Body:**
```json
{
  "companyName": "Acme Corporation",
  "legalName": "Acme Corporation Private Limited",
  "registrationNumber": "REG123456",
  "taxId": "TAX987654",
  "industry": "technology",
  "companySize": "50-200",
  "website": "https://acme.com",
  "establishedDate": "2020-01-15",
  "description": "Leading tech company",
  "addresses": {
    "headquarters": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "postalCode": "94105"
    },
    "billing": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "postalCode": "94105"
    }
  },
  "contact": {
    "email": "contact@acme.com",
    "phone": "+1-555-0100",
    "supportEmail": "support@acme.com",
    "supportPhone": "+1-555-0101"
  },
  "timezone": "America/Los_Angeles",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "currency": "USD",
  "language": "en",
  "fiscalYearStart": "01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "General settings updated successfully",
  "data": {
    "companyId": "uuid",
    "updatedAt": "2025-11-21T10:30:00Z"
  }
}
```

---

## 2. Features Configuration APIs

### 2.1 Get All Feature Configurations
```http
GET /api/super-admin/companies/{companyId}/settings/features
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "categories": {
      "core": {
        "name": "Core Features",
        "description": "Essential platform features",
        "features": [
          {
            "id": "employee_management",
            "name": "Employee Management",
            "description": "Manage employee profiles and information",
            "enabled": true,
            "required": true,
            "dependencies": []
          },
          {
            "id": "user_roles",
            "name": "User Roles & Permissions",
            "description": "Role-based access control",
            "enabled": true,
            "required": true,
            "dependencies": []
          }
        ]
      },
      "attendance": {
        "name": "Attendance & Time",
        "features": [
          {
            "id": "attendance_tracking",
            "name": "Attendance Tracking",
            "description": "Track employee attendance",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          },
          {
            "id": "timesheet_management",
            "name": "Timesheet Management",
            "description": "Manage employee timesheets",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          },
          {
            "id": "leave_management",
            "name": "Leave Management",
            "description": "Handle leave requests and approvals",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          }
        ]
      },
      "projects": {
        "name": "Projects & Tasks",
        "features": [
          {
            "id": "project_management",
            "name": "Project Management",
            "description": "Create and manage projects",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          },
          {
            "id": "task_management",
            "name": "Task Management",
            "description": "Task tracking and assignment",
            "enabled": true,
            "required": false,
            "dependencies": ["project_management"]
          },
          {
            "id": "kanban_boards",
            "name": "Kanban Boards",
            "description": "Visual task management boards",
            "enabled": true,
            "required": false,
            "dependencies": ["task_management"]
          }
        ]
      },
      "hr": {
        "name": "HR & Performance",
        "features": [
          {
            "id": "performance_reviews",
            "name": "Performance Reviews",
            "description": "Employee performance evaluation",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          },
          {
            "id": "appraisal_management",
            "name": "Appraisal Management",
            "description": "Manage employee appraisals",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          },
          {
            "id": "skills_management",
            "name": "Skills & Competencies",
            "description": "Track employee skills and competencies",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          }
        ]
      },
      "finance": {
        "name": "Finance & Payroll",
        "features": [
          {
            "id": "payroll_management",
            "name": "Payroll Management",
            "description": "Process employee payroll",
            "enabled": true,
            "required": false,
            "dependencies": ["employee_management"]
          },
          {
            "id": "invoice_management",
            "name": "Invoice Management",
            "description": "Create and manage invoices",
            "enabled": true,
            "required": false,
            "dependencies": []
          },
          {
            "id": "bookkeeping",
            "name": "Bookkeeping",
            "description": "Accounting and bookkeeping features",
            "enabled": true,
            "required": false,
            "dependencies": []
          },
          {
            "id": "expense_tracking",
            "name": "Expense Tracking",
            "description": "Track company expenses",
            "enabled": false,
            "required": false,
            "dependencies": []
          }
        ]
      },
      "documents": {
        "name": "Documents & Reports",
        "features": [
          {
            "id": "document_management",
            "name": "Document Management",
            "description": "Store and manage documents",
            "enabled": true,
            "required": false,
            "dependencies": []
          },
          {
            "id": "reporting",
            "name": "Reporting & Analytics",
            "description": "Generate reports and analytics",
            "enabled": true,
            "required": false,
            "dependencies": []
          }
        ]
      },
      "communication": {
        "name": "Communication",
        "features": [
          {
            "id": "notifications",
            "name": "Notifications",
            "description": "System notifications",
            "enabled": true,
            "required": true,
            "dependencies": []
          },
          {
            "id": "email_integration",
            "name": "Email Integration",
            "description": "Email notifications and integration",
            "enabled": true,
            "required": false,
            "dependencies": ["notifications"]
          },
          {
            "id": "chat",
            "name": "Internal Chat",
            "description": "Team communication chat",
            "enabled": false,
            "required": false,
            "dependencies": ["employee_management"]
          }
        ]
      },
      "advanced": {
        "name": "Advanced Features",
        "features": [
          {
            "id": "api_access",
            "name": "API Access",
            "description": "REST API access",
            "enabled": false,
            "required": false,
            "dependencies": []
          },
          {
            "id": "webhooks",
            "name": "Webhooks",
            "description": "Webhook integrations",
            "enabled": false,
            "required": false,
            "dependencies": ["api_access"]
          },
          {
            "id": "custom_fields",
            "name": "Custom Fields",
            "description": "Add custom fields to entities",
            "enabled": false,
            "required": false,
            "dependencies": []
          },
          {
            "id": "audit_logs",
            "name": "Audit Logs",
            "description": "Detailed activity audit logs",
            "enabled": true,
            "required": false,
            "dependencies": []
          }
        ]
      }
    },
    "lastUpdated": "2025-11-21T10:30:00Z"
  }
}
```

### 2.2 Update Feature Configuration
```http
PUT /api/super-admin/companies/{companyId}/settings/features
```

**Request Body:**
```json
{
  "features": {
    "attendance_tracking": true,
    "timesheet_management": true,
    "project_management": true,
    "task_management": true,
    "kanban_boards": true,
    "payroll_management": true,
    "invoice_management": true,
    "document_management": true,
    "chat": false,
    "api_access": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Features updated successfully",
  "data": {
    "companyId": "uuid",
    "updatedFeatures": 10,
    "warnings": [
      {
        "feature": "kanban_boards",
        "message": "Enabling kanban_boards also enabled dependency: task_management"
      }
    ]
  }
}
```

### 2.3 Apply Industry Template
```http
POST /api/super-admin/companies/{companyId}/settings/features/apply-template
```

**Request Body:**
```json
{
  "industry": "technology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Industry template applied successfully",
  "data": {
    "companyId": "uuid",
    "industry": "technology",
    "featuresEnabled": [
      "employee_management",
      "attendance_tracking",
      "timesheet_management",
      "project_management",
      "task_management",
      "kanban_boards",
      "skills_management",
      "document_management",
      "reporting"
    ],
    "featuresDisabled": [
      "invoice_management",
      "bookkeeping",
      "payroll_management"
    ]
  }
}
```

### 2.4 Get Industry Templates
```http
GET /api/super-admin/settings/industry-templates
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "technology",
        "name": "Technology",
        "description": "Software development and IT companies",
        "features": [
          "employee_management",
          "attendance_tracking",
          "project_management",
          "task_management",
          "kanban_boards",
          "skills_management"
        ]
      },
      {
        "id": "healthcare",
        "name": "Healthcare",
        "description": "Hospitals and medical facilities",
        "features": [
          "employee_management",
          "attendance_tracking",
          "leave_management",
          "document_management",
          "skills_management"
        ]
      },
      {
        "id": "manufacturing",
        "name": "Manufacturing",
        "description": "Manufacturing and production companies",
        "features": [
          "employee_management",
          "attendance_tracking",
          "inventory_management",
          "project_management"
        ]
      },
      {
        "id": "retail",
        "name": "Retail",
        "description": "Retail and e-commerce businesses",
        "features": [
          "employee_management",
          "attendance_tracking",
          "invoice_management",
          "bookkeeping"
        ]
      },
      {
        "id": "professional_services",
        "name": "Professional Services",
        "description": "Consulting and professional services firms",
        "features": [
          "employee_management",
          "timesheet_management",
          "project_management",
          "invoice_management",
          "reporting"
        ]
      }
    ]
  }
}
```

---

## 3. Branding APIs

### 3.1 Get Company Branding
```http
GET /api/super-admin/companies/{companyId}/settings/branding
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "logo": {
      "url": "https://cdn.example.com/logos/acme.png",
      "uploadedAt": "2025-11-21T10:00:00Z"
    },
    "favicon": {
      "url": "https://cdn.example.com/favicons/acme.ico",
      "uploadedAt": "2025-11-21T10:00:00Z"
    },
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#64748b",
      "accent": "#8b5cf6",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444",
      "background": "#ffffff",
      "foreground": "#0f172a"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "customCSS": "/* Custom styles */\n.custom-class { color: red; }",
    "loginPageCustomization": {
      "backgroundImage": "https://cdn.example.com/backgrounds/login.jpg",
      "welcomeMessage": "Welcome to Acme Corporation",
      "showLogo": true
    }
  }
}
```

### 3.2 Update Company Branding
```http
PUT /api/super-admin/companies/{companyId}/settings/branding
```

**Request Body:**
```json
{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#64748b",
    "accent": "#8b5cf6"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "customCSS": "/* Custom styles */",
  "loginPageCustomization": {
    "welcomeMessage": "Welcome to Acme Corporation",
    "showLogo": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branding updated successfully",
  "data": {
    "companyId": "uuid",
    "updatedAt": "2025-11-21T10:30:00Z"
  }
}
```

### 3.3 Upload Company Logo
```http
POST /api/super-admin/companies/{companyId}/settings/branding/logo
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary file data]
```

**Response:**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": {
    "url": "https://cdn.example.com/logos/acme.png",
    "uploadedAt": "2025-11-21T10:30:00Z",
    "size": 52480,
    "dimensions": {
      "width": 500,
      "height": 200
    }
  }
}
```

### 3.4 Upload Company Favicon
```http
POST /api/super-admin/companies/{companyId}/settings/branding/favicon
Content-Type: multipart/form-data
```

**Request:**
```
file: [binary file data]
```

**Response:**
```json
{
  "success": true,
  "message": "Favicon uploaded successfully",
  "data": {
    "url": "https://cdn.example.com/favicons/acme.ico",
    "uploadedAt": "2025-11-21T10:30:00Z",
    "size": 15360
  }
}
```

---

## 4. Security Settings APIs

### 4.1 Get Security Settings
```http
GET /api/super-admin/companies/{companyId}/settings/security
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireLowercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true,
      "expiryDays": 90,
      "preventReuse": 5
    },
    "mfa": {
      "enabled": false,
      "required": false,
      "allowedMethods": ["totp", "sms", "email"]
    },
    "sessionManagement": {
      "sessionTimeout": 30,
      "maxConcurrentSessions": 3,
      "rememberMeDuration": 30
    },
    "ipWhitelist": {
      "enabled": false,
      "allowedIPs": []
    },
    "loginRestrictions": {
      "maxFailedAttempts": 5,
      "lockoutDuration": 30,
      "allowPasswordReset": true
    },
    "dataRetention": {
      "auditLogRetention": 365,
      "backupRetention": 90,
      "deletedRecordRetention": 30
    },
    "encryption": {
      "encryptData": true,
      "encryptBackups": true
    }
  }
}
```

### 4.2 Update Security Settings
```http
PUT /api/super-admin/companies/{companyId}/settings/security
```

**Request Body:**
```json
{
  "passwordPolicy": {
    "minLength": 12,
    "requireUppercase": true,
    "requireLowercase": true,
    "requireNumbers": true,
    "requireSpecialChars": true,
    "expiryDays": 90,
    "preventReuse": 5
  },
  "mfa": {
    "enabled": true,
    "required": false,
    "allowedMethods": ["totp", "email"]
  },
  "sessionManagement": {
    "sessionTimeout": 30,
    "maxConcurrentSessions": 3,
    "rememberMeDuration": 30
  },
  "loginRestrictions": {
    "maxFailedAttempts": 5,
    "lockoutDuration": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Security settings updated successfully",
  "data": {
    "companyId": "uuid",
    "updatedAt": "2025-11-21T10:30:00Z",
    "warnings": [
      {
        "setting": "mfa.enabled",
        "message": "MFA enabled - users will be prompted to set up MFA on next login"
      }
    ]
  }
}
```

---

## 5. Notification Settings APIs

### 5.1 Get Notification Settings
```http
GET /api/super-admin/companies/{companyId}/settings/notifications
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "channels": {
      "email": {
        "enabled": true,
        "provider": "sendgrid",
        "fromName": "Acme Corporation",
        "fromEmail": "noreply@acme.com",
        "replyTo": "support@acme.com"
      },
      "sms": {
        "enabled": false,
        "provider": "twilio"
      },
      "push": {
        "enabled": true
      },
      "inApp": {
        "enabled": true
      }
    },
    "templates": {
      "welcomeEmail": {
        "enabled": true,
        "subject": "Welcome to Acme Corporation",
        "sendDelay": 0
      },
      "passwordReset": {
        "enabled": true,
        "subject": "Reset Your Password"
      },
      "leaveRequest": {
        "enabled": true,
        "notifyManager": true,
        "notifyHR": true
      },
      "timesheetApproval": {
        "enabled": true,
        "notifyEmployee": true
      },
      "invoiceCreated": {
        "enabled": true,
        "notifyFinance": true
      }
    },
    "preferences": {
      "digestEmails": {
        "enabled": true,
        "frequency": "daily",
        "time": "09:00"
      },
      "reminderEmails": {
        "enabled": true,
        "timesheetReminder": true,
        "leaveApprovalReminder": true
      }
    }
  }
}
```

### 5.2 Update Notification Settings
```http
PUT /api/super-admin/companies/{companyId}/settings/notifications
```

**Request Body:**
```json
{
  "channels": {
    "email": {
      "enabled": true,
      "fromName": "Acme Corporation",
      "fromEmail": "noreply@acme.com",
      "replyTo": "support@acme.com"
    },
    "sms": {
      "enabled": false
    },
    "push": {
      "enabled": true
    }
  },
  "templates": {
    "leaveRequest": {
      "enabled": true,
      "notifyManager": true,
      "notifyHR": true
    }
  },
  "preferences": {
    "digestEmails": {
      "enabled": true,
      "frequency": "daily",
      "time": "09:00"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "data": {
    "companyId": "uuid",
    "updatedAt": "2025-11-21T10:30:00Z"
  }
}
```

### 5.3 Test Notification
```http
POST /api/super-admin/companies/{companyId}/settings/notifications/test
```

**Request Body:**
```json
{
  "channel": "email",
  "recipient": "test@example.com",
  "template": "welcomeEmail"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test notification sent successfully",
  "data": {
    "sentAt": "2025-11-21T10:30:00Z",
    "messageId": "msg_123456"
  }
}
```

---

## 6. Integration Settings APIs

### 6.1 Get Integration Settings
```http
GET /api/super-admin/companies/{companyId}/settings/integrations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "integrations": {
      "slack": {
        "enabled": false,
        "connected": false,
        "config": null
      },
      "googleWorkspace": {
        "enabled": false,
        "connected": false,
        "config": null
      },
      "microsoftTeams": {
        "enabled": false,
        "connected": false,
        "config": null
      },
      "zoom": {
        "enabled": false,
        "connected": false,
        "config": null
      },
      "quickbooks": {
        "enabled": false,
        "connected": false,
        "config": null
      },
      "stripe": {
        "enabled": false,
        "connected": false,
        "config": null
      },
      "paypal": {
        "enabled": false,
        "connected": false,
        "config": null
      }
    },
    "sso": {
      "enabled": false,
      "provider": null,
      "config": null
    },
    "webhooks": {
      "enabled": false,
      "endpoints": []
    },
    "apiAccess": {
      "enabled": false,
      "keys": []
    }
  }
}
```

### 6.2 Update Integration Settings
```http
PUT /api/super-admin/companies/{companyId}/settings/integrations/{integrationId}
```

**Request Body:**
```json
{
  "enabled": true,
  "config": {
    "apiKey": "sk_test_xxxxx",
    "webhookSecret": "whsec_xxxxx",
    "options": {
      "syncInterval": 3600,
      "autoSync": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Integration updated successfully",
  "data": {
    "companyId": "uuid",
    "integrationId": "slack",
    "enabled": true,
    "connected": false,
    "updatedAt": "2025-11-21T10:30:00Z"
  }
}
```

### 6.3 Connect Integration (OAuth)
```http
POST /api/super-admin/companies/{companyId}/settings/integrations/{integrationId}/connect
```

**Request Body:**
```json
{
  "redirectUri": "https://app.example.com/settings/integrations/callback"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://slack.com/oauth/authorize?client_id=xxx&redirect_uri=xxx&state=xxx",
    "state": "random_state_token"
  }
}
```

### 6.4 Disconnect Integration
```http
POST /api/super-admin/companies/{companyId}/settings/integrations/{integrationId}/disconnect
```

**Response:**
```json
{
  "success": true,
  "message": "Integration disconnected successfully",
  "data": {
    "companyId": "uuid",
    "integrationId": "slack",
    "disconnectedAt": "2025-11-21T10:30:00Z"
  }
}
```

### 6.5 Generate API Key
```http
POST /api/super-admin/companies/{companyId}/settings/integrations/api-keys
```

**Request Body:**
```json
{
  "name": "Production API Key",
  "description": "API key for production integrations",
  "permissions": ["read", "write"],
  "expiresAt": "2026-11-21T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "keyId": "key_uuid",
    "key": "ak_live_xxxxxxxxxxxxxxxxxxxxx",
    "name": "Production API Key",
    "permissions": ["read", "write"],
    "createdAt": "2025-11-21T10:30:00Z",
    "expiresAt": "2026-11-21T00:00:00Z",
    "warning": "This key will only be shown once. Please store it securely."
  }
}
```

### 6.6 Revoke API Key
```http
DELETE /api/super-admin/companies/{companyId}/settings/integrations/api-keys/{keyId}
```

**Response:**
```json
{
  "success": true,
  "message": "API key revoked successfully",
  "data": {
    "keyId": "key_uuid",
    "revokedAt": "2025-11-21T10:30:00Z"
  }
}
```

---

## 7. Configuration Management APIs

### 7.1 Export Configuration
```http
GET /api/super-admin/companies/{companyId}/settings/export
```

**Response:**
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "exportedAt": "2025-11-21T10:30:00Z",
    "configuration": {
      "general": { },
      "features": { },
      "branding": { },
      "security": { },
      "notifications": { },
      "integrations": { }
    }
  }
}
```

### 7.2 Import Configuration
```http
POST /api/super-admin/companies/{companyId}/settings/import
```

**Request Body:**
```json
{
  "configuration": {
    "general": { },
    "features": { },
    "branding": { },
    "security": { }
  },
  "overwrite": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration imported successfully",
  "data": {
    "companyId": "uuid",
    "importedAt": "2025-11-21T10:30:00Z",
    "sectionsImported": ["general", "features", "branding", "security"]
  }
}
```

### 7.3 Reset Configuration Section
```http
POST /api/super-admin/companies/{companyId}/settings/{section}/reset
```

**Response:**
```json
{
  "success": true,
  "message": "Configuration section reset to defaults",
  "data": {
    "companyId": "uuid",
    "section": "features",
    "resetAt": "2025-11-21T10:30:00Z"
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions (not Super Admin) |
| `COMPANY_NOT_FOUND` | 404 | Company ID does not exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DEPENDENCY_ERROR` | 400 | Feature dependency not satisfied |
| `INTEGRATION_ERROR` | 500 | Integration connection failed |
| `FILE_UPLOAD_ERROR` | 400 | File upload failed (size, format, etc.) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Example Error Response
```json
{
  "success": false,
  "error": {
    "code": "DEPENDENCY_ERROR",
    "message": "Cannot disable feature with active dependencies",
    "details": {
      "feature": "task_management",
      "dependencies": ["kanban_boards"],
      "suggestion": "Disable dependent features first"
    }
  }
}
```

---

## Rate Limiting

- **Rate Limit**: 100 requests per minute per Super Admin
- **Headers**:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1700568600 (Unix timestamp)

---

## Webhooks

When configuration changes occur, webhooks can be triggered:

### Event Types
- `company.settings.general.updated`
- `company.settings.features.updated`
- `company.settings.branding.updated`
- `company.settings.security.updated`
- `company.settings.notifications.updated`
- `company.settings.integrations.updated`

### Webhook Payload
```json
{
  "event": "company.settings.features.updated",
  "timestamp": "2025-11-21T10:30:00Z",
  "data": {
    "companyId": "uuid",
    "section": "features",
    "changes": {
      "attendance_tracking": {
        "old": false,
        "new": true
      }
    },
    "updatedBy": "super-admin-uuid"
  }
}
```

---

## Notes

1. **Authentication**: All endpoints require Super Admin role
2. **Data Isolation**: Super Admin can only modify companies they have access to
3. **Audit Trail**: All configuration changes are logged
4. **Validation**: Feature dependencies are automatically validated
5. **Caching**: Configuration data is cached for 5 minutes
6. **Versioning**: API version is included in the base URL: `/api/v1/`
