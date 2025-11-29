import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Users,
  Clock,
  Calendar,
  FolderKanban,
  Award,
  FileText,
  DollarSign,
  Receipt,
  Wallet,
  TrendingUp,
  Target,
  BarChart3,
  BookOpen,
  Layers,
} from 'lucide-react';

export interface CompanyFeatures {
  // Core HR
  employee_management: boolean;
  attendance_tracking: boolean;
  leave_management: boolean;
  
  // Time & Project
  timesheet_management: boolean;
  project_management: boolean;
  task_management: boolean;
  kanban_boards: boolean;
  
  // Performance & Skills
  performance_appraisal: boolean;
  skills_management: boolean;
  
  // Financial
  payroll_management: boolean;
  invoice_management: boolean;
  accounting_bookkeeping: boolean;
  expense_tracking: boolean;
  
  // Sales & CRM
  leads_management: boolean;
  
  // Reporting & Analytics
  advanced_reports: boolean;
  analytics_dashboard: boolean;
  
  // Document Management
  document_management: boolean;
}

interface FeatureConfigurationProps {
  features: CompanyFeatures;
  onChange: (features: CompanyFeatures) => void;
  industryType?: string;
}

interface FeatureGroup {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: {
    key: keyof CompanyFeatures;
    label: string;
    description: string;
    recommended_for?: string[];
  }[];
}

const featureGroups: FeatureGroup[] = [
  {
    title: 'Core HR Management',
    description: 'Essential employee and attendance features',
    icon: <Users className="h-5 w-5" />,
    features: [
      {
        key: 'employee_management',
        label: 'Employee Management',
        description: 'Employee directory, profiles, and hierarchy',
        recommended_for: ['all'],
      },
      {
        key: 'attendance_tracking',
        label: 'Attendance Tracking',
        description: 'Clock in/out, attendance calendar, and team attendance',
        recommended_for: ['all'],
      },
      {
        key: 'leave_management',
        label: 'Leave Management',
        description: 'Leave applications, approvals, and balance tracking',
        recommended_for: ['all'],
      },
    ],
  },
  {
    title: 'Time & Project Management',
    description: 'Project tracking and time management tools',
    icon: <FolderKanban className="h-5 w-5" />,
    features: [
      {
        key: 'timesheet_management',
        label: 'Timesheet Management',
        description: 'Weekly timesheets and approval workflows',
        recommended_for: ['technology', 'consulting', 'agency'],
      },
      {
        key: 'project_management',
        label: 'Project Management',
        description: 'Project creation, tracking, and collaboration',
        recommended_for: ['technology', 'consulting', 'agency', 'construction'],
      },
      {
        key: 'task_management',
        label: 'Task Management',
        description: 'Task assignment, tracking, and comments',
        recommended_for: ['technology', 'consulting', 'agency'],
      },
      {
        key: 'kanban_boards',
        label: 'Kanban Boards',
        description: 'Visual task management with drag-and-drop',
        recommended_for: ['technology', 'agency'],
      },
    ],
  },
  {
    title: 'Performance & Skills',
    description: 'Employee development and performance tracking',
    icon: <Award className="h-5 w-5" />,
    features: [
      {
        key: 'performance_appraisal',
        label: 'Performance Appraisal',
        description: 'Appraisal cycles, reviews, and ratings',
        recommended_for: ['all'],
      },
      {
        key: 'skills_management',
        label: 'Skills & Competencies',
        description: 'Skill catalog, matrix, and endorsements',
        recommended_for: ['technology', 'consulting', 'healthcare'],
      },
    ],
  },
  {
    title: 'Financial Management',
    description: 'Payroll, invoicing, and accounting features',
    icon: <DollarSign className="h-5 w-5" />,
    features: [
      {
        key: 'payroll_management',
        label: 'Payroll Management',
        description: 'Payroll processing, payslips, and approvals',
        recommended_for: ['all'],
      },
      {
        key: 'invoice_management',
        label: 'Invoice Management',
        description: 'Create, send, and track client invoices',
        recommended_for: ['consulting', 'agency', 'freelance', 'services'],
      },
      {
        key: 'accounting_bookkeeping',
        label: 'Accounting & Bookkeeping',
        description: 'General ledger, journal entries, and financial reports',
        recommended_for: ['all'],
      },
      {
        key: 'expense_tracking',
        label: 'Expense Tracking',
        description: 'Record and categorize business expenses',
        recommended_for: ['all'],
      },
    ],
  },
  {
    title: 'Sales & CRM',
    description: 'Customer relationship and sales tools',
    icon: <TrendingUp className="h-5 w-5" />,
    features: [
      {
        key: 'leads_management',
        label: 'Leads Management',
        description: 'Lead tracking, pipeline, and conversion',
        recommended_for: ['sales', 'agency', 'services', 'consulting'],
      },
    ],
  },
  {
    title: 'Reporting & Analytics',
    description: 'Data insights and business intelligence',
    icon: <BarChart3 className="h-5 w-5" />,
    features: [
      {
        key: 'advanced_reports',
        label: 'Advanced Reports',
        description: 'Comprehensive reports across all modules',
        recommended_for: ['all'],
      },
      {
        key: 'analytics_dashboard',
        label: 'Analytics Dashboard',
        description: 'Real-time insights and visualizations',
        recommended_for: ['all'],
      },
    ],
  },
  {
    title: 'Document Management',
    description: 'Centralized document storage and sharing',
    icon: <FileText className="h-5 w-5" />,
    features: [
      {
        key: 'document_management',
        label: 'Document Management',
        description: 'Upload, organize, and share company documents',
        recommended_for: ['all'],
      },
    ],
  },
];

export function FeatureConfiguration({
  features,
  onChange,
  industryType,
}: FeatureConfigurationProps) {
  const handleToggle = (key: keyof CompanyFeatures) => {
    onChange({
      ...features,
      [key]: !features[key],
    });
  };

  const isRecommended = (feature: FeatureGroup['features'][0]) => {
    if (!industryType || !feature.recommended_for) return false;
    return (
      feature.recommended_for.includes('all') ||
      feature.recommended_for.includes(industryType.toLowerCase())
    );
  };

  const enabledCount = Object.values(features).filter(Boolean).length;
  const totalCount = Object.keys(features).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <p className="font-medium text-blue-900">
            {enabledCount} of {totalCount} features enabled
          </p>
          <p className="text-sm text-blue-700">
            Configure features based on your business needs
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {Math.round((enabledCount / totalCount) * 100)}%
        </Badge>
      </div>

      {/* Feature Groups */}
      {featureGroups.map((group, groupIndex) => (
        <Card key={groupIndex}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {group.icon}
              </div>
              <div>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {group.features.map((feature, featureIndex) => (
                <div key={feature.key}>
                  {featureIndex > 0 && <Separator className="my-4" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={feature.key}
                          className="cursor-pointer font-medium"
                        >
                          {feature.label}
                        </Label>
                        {isRecommended(feature) && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                    <Switch
                      id={feature.key}
                      checked={features[feature.key]}
                      onCheckedChange={() => handleToggle(feature.key)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Info Card */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Layers className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Feature Configuration Tips:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Features can be enabled or disabled at any time after company creation</li>
                <li>Recommended features are based on selected industry type</li>
                <li>Disabled features won't appear in navigation or consume system resources</li>
                <li>All feature data is preserved when toggling features on/off</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
