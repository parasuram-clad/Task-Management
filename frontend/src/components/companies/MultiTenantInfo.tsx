import { 
  Building2, 
  Users, 
  Shield, 
  Database, 
  Globe,
  Zap,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function MultiTenantInfo() {
  return (
    <div className="p-6 space-y-6 bg-background">
      <div>
        <h1 className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-primary" />
          Multi-Tenant Architecture
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete workspace isolation like Jira
        </p>
      </div>

      {/* Overview */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>🎉 Multi-Tenancy Enabled</CardTitle>
          <CardDescription>
            Your application now supports multiple isolated workspaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This HR & Project Management system now operates like Jira with complete 
            multi-tenant support. Each company (tenant) has its own isolated workspace 
            with separate data, users, and settings.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">Complete Isolation</h4>
                <p className="text-xs text-muted-foreground">
                  Each company's data is completely isolated from others
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
              <RefreshCw className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">Easy Switching</h4>
                <p className="text-xs text-muted-foreground">
                  Users can belong to multiple companies and switch seamlessly
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">Role-Based Access</h4>
                <p className="text-xs text-muted-foreground">
                  Different roles per company (Admin, HR, Manager, Employee)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
              <Database className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">Auto Scoping</h4>
                <p className="text-xs text-muted-foreground">
                  All API calls automatically scoped to current company
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Company Switcher</h4>
                <p className="text-sm text-muted-foreground">
                  Dropdown in the sidebar allows users to switch between companies they belong to.
                  The last selected company is remembered for next login.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Company Creation</h4>
                <p className="text-sm text-muted-foreground">
                  Users can create new companies with custom names, slugs, and plans.
                  The creator automatically becomes the admin.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Team Management</h4>
                <p className="text-sm text-muted-foreground">
                  Invite users via email or shareable link. Manage member roles per company.
                  Remove members or change their permissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">4</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">API Context</h4>
                <p className="text-sm text-muted-foreground">
                  All API requests automatically include company_id in query params and headers.
                  Ensures data isolation at the API level.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">5</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">Plan-Based Features</h4>
                <p className="text-sm text-muted-foreground">
                  Different plans (Free, Basic, Professional, Enterprise) with varying user limits
                  and features.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50/50 rounded">
              <h4 className="text-sm font-medium mb-1">CompanyContext</h4>
              <p className="text-xs text-muted-foreground font-mono">
                /contexts/CompanyContext.tsx
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                React context that provides current company, user companies, and switching logic
              </p>
            </div>

            <div className="p-3 border-l-4 border-l-green-500 bg-green-50/50 rounded">
              <h4 className="text-sm font-medium mb-1">API Client</h4>
              <p className="text-xs text-muted-foreground font-mono">
                /services/api-client.ts
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Centralized API client with automatic company_id injection in all requests
              </p>
            </div>

            <div className="p-3 border-l-4 border-l-purple-500 bg-purple-50/50 rounded">
              <h4 className="text-sm font-medium mb-1">Company Switcher</h4>
              <p className="text-xs text-muted-foreground font-mono">
                /components/CompanySwitcher.tsx
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Dropdown component with search, company logos, and plan badges
              </p>
            </div>

            <div className="p-3 border-l-4 border-l-orange-500 bg-orange-50/50 rounded">
              <h4 className="text-sm font-medium mb-1">Company Management</h4>
              <p className="text-xs text-muted-foreground font-mono">
                /components/companies/CompanyManagement.tsx
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Full company settings, member management, and invitation system
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Badge>Step 1</Badge>
                Switch Companies
              </h4>
              <p className="text-sm text-muted-foreground">
                Click the company dropdown in the sidebar to view all companies you're a member of.
                Select a company to switch. The app will reload with the new company context.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Badge>Step 2</Badge>
                Create New Company
              </h4>
              <p className="text-sm text-muted-foreground">
                Click "Create Company" in the switcher dropdown. Enter company details including
                name, slug, plan, and timezone. You'll be assigned as admin.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Badge>Step 3</Badge>
                Manage Team
              </h4>
              <p className="text-sm text-muted-foreground">
                Go to Settings → Company Settings or Company Management. Invite team members via
                email or share the invite link. Manage roles and permissions.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Badge>Step 4</Badge>
                API Integration
              </h4>
              <p className="text-sm text-muted-foreground">
                All API calls automatically include company_id. Your backend should filter all
                data queries by company_id to ensure isolation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
              <span>
                <strong>Backend Validation:</strong> Always validate company_id on the backend. 
                Never trust client-side company context alone.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
              <span>
                <strong>Row-Level Security:</strong> Implement database row-level security policies 
                to enforce company isolation at the data layer.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
              <span>
                <strong>User-Company Verification:</strong> Verify that users have access to the 
                company_id they're requesting data for.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
              <span>
                <strong>Audit Logging:</strong> Log all company switches and cross-company access 
                attempts for security monitoring.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
