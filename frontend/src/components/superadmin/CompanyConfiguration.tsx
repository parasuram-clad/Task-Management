import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import {
  Building2,
  ArrowLeft,
  Save,
  Settings,
  Palette,
  Package,
  Shield,
  Database,
  CreditCard,
  Bell,
  Mail,
  Lock,
  Globe,
  Calendar,
  Users,
  Check,
  X,
  Briefcase,
  UserPlus,
  GraduationCap,
  MessageSquare,
  DollarSign,
  FileText,
  BarChart,
  Clock,
  Target,
  Award,
  Plus,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import { toast } from 'sonner@2.0.3';

interface CompanyConfigurationProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
  companyId: number;
}

// Feature configuration based on industry
const FEATURE_CATEGORIES = {
  core: {
    label: 'Core HR',
    icon: <Users className="w-4 h-4" />,
    features: [
      { id: 'employee_management', label: 'Employee Management', description: 'Employee directory, profiles, and organization chart' },
      { id: 'attendance', label: 'Attendance & Time Tracking', description: 'Clock in/out, attendance calendar, and reports' },
      { id: 'leave_management', label: 'Leave Management', description: 'Leave requests, approvals, and balance tracking' },
      { id: 'document_management', label: 'Document Management', description: 'Employee documents, policies, and file storage' },
      { id: 'payroll', label: 'Payroll Management', description: 'Salary processing, pay slips, and deductions' },
    ],
  },
  recruitment: {
    label: 'Recruitment',
    icon: <UserPlus className="w-4 h-4" />,
    features: [
      { id: 'requisition_management', label: 'Requisition Management', description: 'Job requisitions and approvals' },
      { id: 'candidate_portal', label: 'Candidate Portal', description: 'Public career site and job applications' },
      { id: 'interview_management', label: 'Interview Management', description: 'Interview scheduling and feedback' },
      { id: 'onboarding', label: 'Employee Onboarding', description: '90-day onboarding journey and tasks' },
    ],
  },
  performance: {
    label: 'Performance & Development',
    icon: <Target className="w-4 h-4" />,
    features: [
      { id: 'performance_appraisals', label: 'Performance Appraisals', description: 'Annual reviews and ratings' },
      { id: 'goals_okr', label: 'Goals & OKRs', description: 'Objective and key result tracking' },
      { id: 'skills_competencies', label: 'Skills & Competencies', description: 'Skill matrix and competency management' },
      { id: 'learning_development', label: 'Learning & Development', description: 'Training courses and certificates' },
    ],
  },
  workforce: {
    label: 'Employee Services',
    icon: <Briefcase className="w-4 h-4" />,
    features: [
      { id: 'claims_reimbursement', label: 'Claims & Reimbursement', description: 'Expense claims and approvals' },
      { id: 'shift_scheduling', label: 'Shift & Scheduling', description: 'Shift roster and swap management' },
      { id: 'travel_management', label: 'Travel Management', description: 'Travel requests and bookings' },
      { id: 'timesheet', label: 'Timesheet Management', description: 'Project time tracking and approvals' },
    ],
  },
  projects: {
    label: 'Projects & Tasks',
    icon: <BarChart className="w-4 h-4" />,
    features: [
      { id: 'project_management', label: 'Project Management', description: 'Projects, sprints, and kanban boards' },
      { id: 'task_management', label: 'Task Management', description: 'Task assignments and tracking' },
      { id: 'leads_crm', label: 'Leads & CRM', description: 'Lead management and pipeline' },
    ],
  },
  engagement: {
    label: 'Employee Engagement',
    icon: <MessageSquare className="w-4 h-4" />,
    features: [
      { id: 'surveys_polls', label: 'Surveys & Polls', description: 'Employee engagement surveys and eNPS' },
      { id: 'feedback_recognition', label: 'Feedback & Recognition', description: '360 feedback and peer recognition' },
    ],
  },
  finance: {
    label: 'Finance & Accounting',
    icon: <DollarSign className="w-4 h-4" />,
    features: [
      { id: 'invoicing', label: 'Invoicing', description: 'Invoice creation and management' },
      { id: 'accounting', label: 'Accounting & Ledger', description: 'General ledger and bookkeeping' },
      { id: 'expense_tracking', label: 'Expense Tracking', description: 'Company expenses and budgets' },
    ],
  },
  reports: {
    label: 'Reports & Analytics',
    icon: <FileText className="w-4 h-4" />,
    features: [
      { id: 'hr_reports', label: 'HR Reports', description: 'Attendance, leave, and employee reports' },
      { id: 'project_reports', label: 'Project Reports', description: 'Project progress and time reports' },
      { id: 'financial_reports', label: 'Financial Reports', description: 'P&L, balance sheet, and cash flow' },
    ],
  },
};

// Industry templates
const INDUSTRY_TEMPLATES = {
  it_services: {
    label: 'IT Services & Consulting',
    defaultFeatures: [
      'employee_management', 'attendance', 'leave_management', 'document_management', 'payroll',
      'requisition_management', 'candidate_portal', 'interview_management', 'onboarding',
      'performance_appraisals', 'goals_okr', 'skills_competencies', 'learning_development',
      'timesheet', 'project_management', 'task_management', 'leads_crm',
      'surveys_polls', 'hr_reports', 'project_reports',
    ],
  },
  manufacturing: {
    label: 'Manufacturing',
    defaultFeatures: [
      'employee_management', 'attendance', 'leave_management', 'document_management', 'payroll',
      'shift_scheduling', 'performance_appraisals', 'skills_competencies',
      'claims_reimbursement', 'hr_reports',
    ],
  },
  retail: {
    label: 'Retail & E-commerce',
    defaultFeatures: [
      'employee_management', 'attendance', 'leave_management', 'payroll',
      'shift_scheduling', 'requisition_management', 'candidate_portal', 'onboarding',
      'performance_appraisals', 'learning_development', 'surveys_polls',
    ],
  },
  healthcare: {
    label: 'Healthcare',
    defaultFeatures: [
      'employee_management', 'attendance', 'leave_management', 'document_management', 'payroll',
      'shift_scheduling', 'performance_appraisals', 'skills_competencies', 'learning_development',
      'claims_reimbursement', 'surveys_polls',
    ],
  },
  finance: {
    label: 'Financial Services',
    defaultFeatures: [
      'employee_management', 'attendance', 'leave_management', 'document_management', 'payroll',
      'requisition_management', 'interview_management', 'onboarding',
      'performance_appraisals', 'goals_okr', 'skills_competencies', 'learning_development',
      'timesheet', 'invoicing', 'accounting', 'expense_tracking',
      'surveys_polls', 'hr_reports', 'financial_reports',
    ],
  },
  education: {
    label: 'Education',
    defaultFeatures: [
      'employee_management', 'attendance', 'leave_management', 'document_management', 'payroll',
      'requisition_management', 'onboarding', 'performance_appraisals', 'learning_development',
      'surveys_polls', 'feedback_recognition',
    ],
  },
  all_features: {
    label: 'All Features (Enterprise)',
    defaultFeatures: Object.values(FEATURE_CATEGORIES).flatMap(cat => cat.features.map(f => f.id)),
  },
};

export function CompanyConfiguration({ user, navigateTo, companyId }: CompanyConfigurationProps) {
  const { allCompanies } = useSuperAdmin();
  const company = allCompanies.find(c => c.id === companyId);

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // General settings
  const [companyName, setCompanyName] = useState(company?.name || '');
  const [companySlug, setCompanySlug] = useState(company?.slug || '');
  const [industry, setIndustry] = useState('it_services');
  const [plan, setPlan] = useState(company?.plan || 'professional');
  const [isActive, setIsActive] = useState(company?.is_active ?? true);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('');

  // Feature configuration
  const [enabledFeatures, setEnabledFeatures] = useState<Set<string>>(
    new Set(INDUSTRY_TEMPLATES.it_services.defaultFeatures)
  );

  // Branding
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Security
  const [requireMfa, setRequireMfa] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(90);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState('');

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Integrations
  const [slackWebhook, setSlackWebhook] = useState('');
  const [teamsWebhook, setTeamsWebhook] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  const handleApplyTemplate = (templateId: string) => {
    const template = INDUSTRY_TEMPLATES[templateId as keyof typeof INDUSTRY_TEMPLATES];
    if (template) {
      setEnabledFeatures(new Set(template.defaultFeatures));
      toast.success(`Applied ${template.label} template`);
    }
  };

  const toggleFeature = (featureId: string) => {
    const newFeatures = new Set(enabledFeatures);
    if (newFeatures.has(featureId)) {
      newFeatures.delete(featureId);
    } else {
      newFeatures.add(featureId);
    }
    setEnabledFeatures(newFeatures);
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Company configuration saved successfully');
    setIsSaving(false);
  };

  if (!company) {
    return (
      <div className="p-8">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Company not found</p>
          <Button onClick={() => navigateTo('superadmin-companies')} className="mt-4">
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigateTo('superadmin-companies')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">Company Configuration</h1>
            <p className="text-muted-foreground">{company.name}</p>
          </div>
          <Button onClick={handleSaveConfiguration} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full mb-6">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="features">
            <Package className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Database className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic details about the company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="company-slug">Company Slug</Label>
                  <Input
                    id="company-slug"
                    value={companySlug}
                    onChange={(e) => setCompanySlug(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it_services">IT Services & Consulting</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Financial Services</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select value={plan} onValueChange={setPlan}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subscription-end">Subscription End Date</Label>
                  <Input
                    id="subscription-end"
                    type="date"
                    value={subscriptionEndDate}
                    onChange={(e) => setSubscriptionEndDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between pt-7">
                  <Label htmlFor="active-status">Company Active</Label>
                  <Switch
                    id="active-status"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Stats</CardTitle>
              <CardDescription>Current statistics and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl">{company.user_count}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mb-2 text-blue-600" />
                  <p className="text-2xl">{Math.floor(Math.random() * 100)}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mb-2 text-green-600" />
                  <p className="text-2xl">{Math.floor(Math.random() * 500)}</p>
                  <p className="text-sm text-muted-foreground">Hours Tracked</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mb-2 text-orange-600" />
                  <p className="text-2xl">{Math.floor(Math.random() * 200)}</p>
                  <p className="text-sm text-muted-foreground">Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Configuration */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Templates</CardTitle>
              <CardDescription>Quickly apply pre-configured feature sets based on industry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(INDUSTRY_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => handleApplyTemplate(key)}
                  >
                    <span className="font-medium mb-1">{template.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {template.defaultFeatures.length} features
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {Object.entries(FEATURE_CATEGORIES).map(([categoryKey, category]) => (
              <Card key={categoryKey}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.label}
                  </CardTitle>
                  <CardDescription>
                    {category.features.filter(f => enabledFeatures.has(f.id)).length} of {category.features.length} enabled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.features.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{feature.label}</span>
                            {enabledFeatures.has(feature.id) && (
                              <Badge className="bg-green-100 text-green-700">
                                <Check className="w-3 h-3 mr-1" />
                                Enabled
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <Switch
                          checked={enabledFeatures.has(feature.id)}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Features Enabled</p>
                  <p className="text-2xl">{enabledFeatures.size}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-lg px-4 py-2">
                  {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize the company's brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <Label className="mb-3 block">Color Preview</Label>
                <div className="flex gap-4">
                  <div
                    className="w-32 h-32 rounded-lg shadow-md flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="w-32 h-32 rounded-lg shadow-md flex items-center justify-center text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>Upload or set a URL for the company logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              {logoUrl && (
                <div className="p-4 border rounded-lg">
                  <Label className="mb-3 block">Logo Preview</Label>
                  <img src={logoUrl} alt="Company Logo" className="max-h-32" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Access</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Require Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Force all users to enable MFA</p>
                </div>
                <Switch checked={requireMfa} onCheckedChange={setRequireMfa} />
              </div>

              <div>
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  value={passwordExpiry}
                  onChange={(e) => setPasswordExpiry(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IP Whitelist</CardTitle>
              <CardDescription>Restrict access to specific IP addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter IP addresses or ranges (one per line)&#10;192.168.1.1&#10;10.0.0.0/24"
                value={ipWhitelist}
                onChange={(e) => setIpWhitelist(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure how users receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send browser push notifications</p>
                  </div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send SMS for critical updates</p>
                  </div>
                </div>
                <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>Connect with external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <Input
                  id="slack-webhook"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="teams-webhook">Microsoft Teams Webhook URL</Label>
                <Input
                  id="teams-webhook"
                  placeholder="https://outlook.office.com/webhook/..."
                  value={teamsWebhook}
                  onChange={(e) => setTeamsWebhook(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="custom-api">Custom API Key</Label>
                <Input
                  id="custom-api"
                  type="password"
                  placeholder="Enter custom API key"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhooks for events</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}