# Multi-Tenant Architecture Guide

## Overview

This HR & Project Management system now implements **complete multi-tenancy** similar to Jira, Slack, and other modern SaaS applications. Each company operates as an isolated workspace with its own data, users, settings, and permissions.

## 🏗️ Architecture Components

### 1. Company Context (`/contexts/CompanyContext.tsx`)

The core of the multi-tenant system. Manages:
- Current active company
- List of companies the user belongs to
- User's role within each company
- Company switching logic
- Local storage persistence of last selected company

```typescript
const { 
  currentCompany,      // Currently active company
  userCompanies,       // All companies user belongs to
  userRole,            // User's role in current company
  switchCompany,       // Function to switch companies
  isLoading            // Loading state
} = useCompany();
```

### 2. API Client (`/services/api-client.ts`)

Centralized API client that automatically injects company context:

**Features:**
- Automatic `company_id` injection in query parameters
- Company header (`X-Company-Id`) in all requests
- Scoped API methods per company
- Type-safe request/response handling

**Usage:**
```typescript
import { api } from './services/api-client';

// Automatically includes current company_id
const projects = await api.get('/projects');

// Create scoped API for specific company
const companyApi = createScopedApi(companyId);
const leads = await companyApi.get('/leads');
```

### 3. Company Switcher (`/components/CompanySwitcher.tsx`)

UI component for switching between companies:
- Searchable dropdown
- Company logos and avatars
- Plan badges (Free, Basic, Professional, Enterprise)
- Create new company option
- Manage companies option

### 4. Company Management (`/components/companies/CompanyManagement.tsx`)

Full company administration interface:
- View company details (name, slug, plan, creation date)
- Manage team members
- Invite users via email or shareable link
- Change member roles
- Remove members
- Company settings access

### 5. Create Company Modal (`/components/companies/CreateCompanyModal.tsx`)

Allows users to create new workspaces:
- Company name and slug configuration
- Plan selection (Free/Basic/Professional/Enterprise)
- Timezone settings
- Auto-assignment as admin

## 🔐 Security Model

### Data Isolation

**1. Row-Level Security (Backend)**
```sql
-- Example PostgreSQL RLS policy
CREATE POLICY company_isolation ON projects
  FOR ALL
  USING (company_id = current_setting('app.current_company_id')::integer);
```

**2. API Validation**
Every API endpoint MUST validate:
- User belongs to the requested company
- Company_id is valid and active
- User has appropriate permissions

**3. Frontend Validation**
- Company context verified on every navigation
- API client validates company_id before requests
- Session invalidation on company switch

### Permission Levels

Each company has 4 role levels:

| Role | Permissions |
|------|------------|
| **Admin** | Full access, company settings, billing, member management |
| **HR** | Employee management, attendance, leave approvals, reports |
| **Manager** | Team management, project oversight, approvals, reports |
| **Employee** | Personal data, assigned tasks, time tracking |

**Multi-Company Roles:**
- Users can have DIFFERENT roles in different companies
- Example: Admin in Company A, Employee in Company B

## 🎯 Key Features

### 1. Company Switching
- Click company dropdown in sidebar
- Search and select company
- Auto-reload with new context
- Remembers last selected company

### 2. Invitations

**Email Invitation:**
```typescript
POST /api/invitations
{
  "email": "user@example.com",
  "company_id": 123,
  "role": "employee"
}
```

**Shareable Link:**
```
https://yourapp.com/invite/acme-corp/token123
```

### 3. Company Plans

| Plan | Users | Features |
|------|-------|----------|
| Free | 5 | Basic features |
| Basic | 20 | Standard features |
| Professional | 100 | Advanced features + integrations |
| Enterprise | Unlimited | All features + custom |

### 4. Data Scoping

**All entities scoped by company:**
- ✅ Projects
- ✅ Tasks
- ✅ Employees
- ✅ Attendance
- ✅ Timesheets
- ✅ Leads
- ✅ Reports
- ✅ Settings

## 📝 Implementation Guide

### Step 1: Wrap App with CompanyProvider

```typescript
// App.tsx
import { CompanyProvider } from './contexts/CompanyContext';

export default function App() {
  return (
    <CompanyProvider userId={currentUser.id}>
      <AppContent />
    </CompanyProvider>
  );
}
```

### Step 2: Use Company Context in Components

```typescript
import { useCompany } from '../contexts/CompanyContext';

function MyComponent() {
  const { currentCompany, userRole } = useCompany();
  
  // Check permissions
  if (userRole !== 'admin') {
    return <NoAccess />;
  }
  
  return <div>{currentCompany.name}</div>;
}
```

### Step 3: Update API Calls

```typescript
// Before (manual company_id)
const projects = await fetch(`/api/projects?company_id=${companyId}`);

// After (automatic injection)
import { api } from './services/api-client';
const projects = await api.get('/projects'); // company_id auto-added
```

### Step 4: Backend Implementation

**Required API Changes:**

1. **Accept company_id in all requests**
```typescript
// Query param or header
const companyId = req.query.company_id || req.headers['x-company-id'];
```

2. **Validate user-company relationship**
```typescript
const hasAccess = await db.query(
  'SELECT 1 FROM user_companies WHERE user_id = $1 AND company_id = $2',
  [userId, companyId]
);
```

3. **Filter all queries by company_id**
```typescript
const projects = await db.query(
  'SELECT * FROM projects WHERE company_id = $1',
  [companyId]
);
```

## 🔄 Migration Path

### For Existing Applications

**1. Add company_id column to all tables**
```sql
ALTER TABLE projects ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE employees ADD COLUMN company_id INTEGER REFERENCES companies(id);
-- etc.
```

**2. Create user_companies junction table**
```sql
CREATE TABLE user_companies (
  user_id INTEGER REFERENCES users(id),
  company_id INTEGER REFERENCES companies(id),
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, company_id)
);
```

**3. Migrate existing data**
```sql
-- Create default company
INSERT INTO companies (name, slug) VALUES ('Default Company', 'default');

-- Assign all existing data to default company
UPDATE projects SET company_id = 1;
UPDATE employees SET company_id = 1;
```

**4. Update API endpoints**
- Add company_id parameter validation
- Add user-company access checks
- Update all queries to filter by company_id

## 🧪 Testing

### Test Cases

1. **Company Isolation**
   - Create data in Company A
   - Switch to Company B
   - Verify Company A data is not visible

2. **Role-Based Access**
   - Login as Employee in Company A
   - Verify restricted access
   - Switch to Company B where user is Admin
   - Verify full access

3. **Company Switching**
   - Switch between multiple companies
   - Verify context updates correctly
   - Verify API calls use correct company_id

4. **Invitations**
   - Send invitation to new user
   - Accept invitation
   - Verify user added to correct company with correct role

## 🚀 Production Considerations

### Performance

1. **Database Indexing**
```sql
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_user_companies ON user_companies(user_id, company_id);
```

2. **Caching**
- Cache user-company relationships
- Cache company settings
- Invalidate cache on company switch

### Monitoring

Track these metrics:
- Company switch frequency
- Cross-company access attempts (potential security issue)
- API calls per company
- Active users per company

### Audit Logging

Log these events:
- Company creation
- User invited to company
- User removed from company
- Role changes
- Company switches
- Unauthorized access attempts

## 📚 API Endpoints

### Companies
```
GET    /api/companies              # List user's companies
POST   /api/companies              # Create new company
GET    /api/companies/:id          # Get company details
PATCH  /api/companies/:id          # Update company
DELETE /api/companies/:id          # Delete company
```

### Company Members
```
GET    /api/companies/:id/members          # List members
POST   /api/companies/:id/members          # Add member
PATCH  /api/companies/:id/members/:userId  # Update role
DELETE /api/companies/:id/members/:userId  # Remove member
```

### Invitations
```
POST   /api/companies/:id/invitations      # Create invitation
GET    /api/invitations/:token             # Get invitation details
POST   /api/invitations/:token/accept      # Accept invitation
```

## 🎨 UI Components

### Available Components

1. **CompanySwitcher** - Dropdown for switching companies
2. **CreateCompanyModal** - Modal for creating new company
3. **CompanyManagement** - Full company admin interface
4. **CompanyBadge** - Show current company and plan
5. **MultiTenantInfo** - Documentation/info page

### Integration Example

```typescript
import { CompanySwitcher } from './components/CompanySwitcher';
import { useCompany } from './contexts/CompanyContext';

function Sidebar() {
  const { currentCompany } = useCompany();
  
  return (
    <div>
      <CompanySwitcher 
        onCreateCompany={() => navigate('/create-company')}
        onManageCompanies={() => navigate('/company-management')}
      />
      <p>Current: {currentCompany?.name}</p>
    </div>
  );
}
```

## 🔍 Troubleshooting

### Company not switching
- Check browser console for errors
- Verify CompanyProvider wraps app
- Check API client has correct company_id

### Data showing from wrong company
- Verify backend filters by company_id
- Check API client configuration
- Review database queries

### Permission errors
- Verify user belongs to company
- Check role in user_companies table
- Review role-based access checks

## 📖 Additional Resources

- **Jira Multi-tenancy**: Similar architecture reference
- **SaaS Tenant Isolation**: AWS best practices
- **Row-Level Security**: PostgreSQL RLS guide

---

**Need Help?**
- Review `/components/companies/MultiTenantInfo.tsx` for in-app guide
- Check example implementations in existing components
- Refer to API documentation for endpoint details
