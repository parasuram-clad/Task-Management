# Super Admin SaaS Platform

## Overview

The HR & Project Management system now includes a **Super Admin** layer that transforms it into a complete **SaaS platform** similar to Jira, where a platform administrator can manage multiple companies (tenants), users, and platform-wide settings.

## Architecture

### Two-Tier User System

1. **Super Admin (Platform Level)**
   - Manages all companies on the platform
   - Creates and configures companies/tenants
   - Manages users and assigns them to companies
   - Views platform-wide analytics
   - Configures global platform settings

2. **Regular Users (Company Level)**
   - Belongs to one or more companies
   - Has specific roles within each company (Employee, Manager, HR, Admin)
   - Company Admin can manage their own company but cannot see other companies
   - All data is scoped to their company context

## Login Credentials

### Super Admin
- **Email:** `superadmin@platform.com`
- **Password:** `password`
- **Access:** Platform administration interface

### Regular Users (Company Level)
- **Employee:** `employee@company.com` / `password`
- **Manager:** `manager@company.com` / `password`
- **HR:** `hr@company.com` / `password`
- **Admin:** `admin@company.com` / `password`

## Super Admin Features

### 1. Dashboard
- Platform-wide statistics (total companies, users, revenue)
- Company growth metrics
- Plan distribution charts
- System health monitoring
- Quick access to key actions

### 2. Company Management
- **View all companies** with filtering and search
- **Create new companies** with custom settings
- **Edit company details** (name, plan, settings)
- **Activate/Deactivate companies**
- **Delete companies** (with confirmation)
- **Manage company users** and permissions
- Track company statistics (user count, plan, status)

### 3. User Management
- **View all platform users**
- **Create new users**
- **Assign users to companies** with specific roles
- **Manage user-company relationships**
- View user's company memberships
- Toggle super admin status

### 4. Analytics
- Revenue growth trends
- Company growth over time
- Plan distribution (Free, Basic, Professional, Enterprise)
- User growth metrics
- Key performance indicators:
  - Average revenue per company
  - Churn rate
  - Average users per company
  - Conversion rate

### 5. Platform Settings
- **General Settings:** Platform name, email, domain
- **Feature Toggles:** Free tier, trials, email verification, social login
- **Limits:** User limits and storage limits per plan
- **Billing:** Stripe integration (placeholder)
- **Security:** Authentication settings (placeholder)

## Subscription Plans

### Free Plan
- Up to 5 users
- Basic features
- 1GB storage
- No advanced reporting

### Basic Plan - $29/month
- Up to 20 users
- All basic features
- 10GB storage
- Email support

### Professional Plan - $99/month
- Up to 50 users
- Advanced features
- 50GB storage
- Priority support

### Enterprise Plan - $299/month
- Unlimited users
- All features
- Unlimited storage
- 24/7 support

## Data Model

### Platform User
```typescript
{
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_super_admin: boolean;
}
```

### Company
```typescript
{
  id: number;
  name: string;
  slug: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  created_at: string;
  user_count: number;
  is_active: boolean;
  subscription_end_date?: string;
  settings: {
    timezone: string;
    date_format: string;
    currency: string;
  };
}
```

### User-Company Assignment
```typescript
{
  company_id: number;
  user_id: number;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  joined_at: string;
}
```

## Components

### Super Admin Components
Located in `/components/superadmin/`:

1. **SuperAdminDashboard.tsx** - Main dashboard with stats and overview
2. **SuperAdminCompanies.tsx** - Company listing and management
3. **SuperAdminUsers.tsx** - User listing and assignment
4. **SuperAdminAnalytics.tsx** - Charts and analytics
5. **SuperAdminSettings.tsx** - Platform configuration
6. **SuperAdminSidebar.tsx** - Navigation for super admin
7. **CompanyForm.tsx** - Create/edit company form

### Contexts
1. **SuperAdminContext.tsx** - Manages all platform data (companies, users, assignments)
2. **CompanyContext.tsx** - Manages company-specific data for regular users

## Routing Logic

The application routing is determined by the `is_super_admin` flag:

```typescript
// In App.tsx
if (currentUser?.is_super_admin) {
  // Show SuperAdminApp with platform management
  return <SuperAdminProvider>...</SuperAdminProvider>;
} else {
  // Show regular CompanyProvider-based app
  return <CompanyProvider>...</CompanyProvider>;
}
```

## Key Workflows

### Creating a New Company
1. Super admin navigates to Companies
2. Clicks "New Company"
3. Fills in company details (name, slug, plan, regional settings)
4. Company is created and can now have users assigned

### Assigning Users to Companies
1. Super admin navigates to Users
2. Selects a user
3. Clicks "Assign to Company"
4. Selects company and role
5. User can now access that company's workspace

### User Login Flow
1. User enters credentials
2. If `is_super_admin = true`:
   - Routed to platform administration
   - Sees all companies and users
3. If regular user:
   - Routed to company workspace
   - Sees only their assigned companies
   - Can switch between companies they belong to

## Multi-Tenancy

### Data Isolation
- Each company's data is completely isolated
- Regular users can only see data from companies they belong to
- Super admin can see all companies but doesn't access company-specific operational data

### Company Switching
- Regular users can switch between their assigned companies
- When switching, all data refreshes for the new company context
- Last selected company is saved to localStorage

## Integration with Existing Features

The super admin layer sits **above** the existing multi-tenant system:

```
Platform Level (Super Admin)
  ├── Company 1 (Acme Corp)
  │   ├── Employees, Projects, Tasks, etc.
  │   └── Company Admin can manage company settings
  ├── Company 2 (TechStart)
  │   ├── Employees, Projects, Tasks, etc.
  │   └── Company Admin can manage company settings
  └── Company 3 (Global Industries)
      ├── Employees, Projects, Tasks, etc.
      └── Company Admin can manage company settings
```

## Future Enhancements

1. **Billing Integration**
   - Stripe payment processing
   - Subscription management
   - Invoice generation

2. **Advanced Analytics**
   - Custom date ranges
   - Export capabilities
   - More detailed metrics

3. **Email Notifications**
   - Welcome emails for new companies
   - Subscription expiration alerts
   - Usage limit warnings

4. **API Access**
   - REST API for company management
   - Webhooks for events
   - API key management

5. **White Labeling**
   - Custom branding per company
   - Custom domains
   - Theme customization

## Security Considerations

1. **Super Admin Access**
   - Super admin status cannot be set by regular users
   - Should be managed through secure backend processes

2. **Data Isolation**
   - API calls automatically include company_id
   - Backend must enforce company-level data isolation

3. **Permissions**
   - Company admins can only manage their own company
   - Super admins have read access to all companies but limited operational access

## Development Notes

- All super admin functionality uses mock data
- In production, connect to backend APIs
- Implement proper authentication and authorization
- Add rate limiting and usage tracking
- Implement proper error handling and logging
