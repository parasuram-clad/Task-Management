import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { CompanySwitcher } from './CompanySwitcher';
import { useState } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useLocation } from 'react-router-dom';
import { canAccessProjects, canAccessLeads, canAccessSkillMatrix, canAccessTeamStructure, canAccessReports } from '../utils/rbac';
import { User, UserRole } from '../App';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  Users2, 
  Clock, 
  FileText, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  Building2, 
  ChevronRight, 
  LogOut,
  FolderOpen,
  Calendar,
  Menu,
  X,
  ChevronDown,
  TrendingUp,
  Target,
  BookOpen,
  Layers,
  DollarSign,
  Receipt,
  Wallet,
  UserPlus,
  Briefcase,
  Video,
  RefreshCw,
  Plane,
  HeartHandshake,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  subItems?: { id: string; label: string }[];
}

export function Sidebar({ user, onNavigate, onLogout }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['attendance', 'timesheet', 'reports']));
 const location = useLocation();
  const currentPage = location.pathname.split('/')[1] || 'dashboard';
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: <Users2 className="w-5 h-5" />,
      roles: ['hr', 'admin', 'manager'],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Clock className="w-5 h-5" />,
      subItems: [
        { id: 'my-attendance', label: 'My Attendance' },
        { id: 'attendance-calendar', label: 'Calendar View' },
        { id: 'team-attendance', label: 'Team Attendance' },
      ],
    },
    {
      id: 'timesheet',
      label: 'Timesheet',
      icon: <FileText className="w-5 h-5" />,
      subItems: [
        { id: 'my-timesheet', label: 'My Timesheet' },
        { id: 'timesheet-approval', label: 'Approvals' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      id: 'my-tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      subItems: [
        { id: 'my-tasks', label: 'My Tasks' },
        { id: 'project-tasks', label: 'Project Tasks' },
      ],
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users className="w-5 h-5" />,
      roles: ['hr', 'admin', 'manager'],
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <FolderOpen className="w-5 h-5" />,
      subItems: [
        { id: 'my-documents', label: 'My Documents' },
        { id: 'document-management', label: 'Manage Documents' },
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: <Award className="w-5 h-5" />,
      subItems: [
        { id: 'my-appraisals', label: 'My Appraisals' },
        { id: 'appraisal-management', label: 'Manage Appraisals' },
      ],
    },
    {
      id: 'leave',
      label: 'Leave Management',
      icon: <Calendar className="w-5 h-5" />,
      subItems: [
        { id: 'my-leaves', label: 'My Leaves' },
        { id: 'leave-approval', label: 'Leave Approvals' },
        { id: 'leave-management', label: 'Manage Leaves' },
      ],
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: <DollarSign className="w-5 h-5" />,
      subItems: [
        { id: 'my-payroll', label: 'My Payroll' },
        { id: 'payroll-processing', label: 'Process Payroll' },
        { id: 'payroll-approval', label: 'Approve Payroll' },
      ],
    },
    {
      id: 'invoicing',
      label: 'Invoicing',
      icon: <Receipt className="w-5 h-5" />,
      roles: ['admin', 'finance', 'accounts', 'manager'],
      subItems: [
        { id: 'invoices', label: 'All Invoices' },
        { id: 'create-invoice', label: 'Create Invoice' },
      ],
    },
    {
      id: 'accounting',
      label: 'Accounting',
      icon: <Wallet className="w-5 h-5" />,
      roles: ['admin', 'finance', 'accounts'],
      subItems: [
        { id: 'accounting-dashboard', label: 'Dashboard' },
        { id: 'ledger', label: 'General Ledger' },
      ],
    },
    {
      id: 'skills',
      label: 'Skills & Competencies',
      icon: <Award className="w-5 h-5" />,
      subItems: [
        { id: 'skill-catalog', label: 'Skill Catalog' },
        { id: 'skill-matrix', label: 'Skill Matrix' },
        { id: 'team-structure', label: 'Team Structure' },
      ],
    },
    {
      id: 'recruit',
      label: 'Recruitment',
      icon: <UserPlus className="w-5 h-5" />,
      roles: ['hr', 'admin', 'manager'],
      subItems: [
        { id: 'requisitions', label: 'Requisitions' },
        { id: 'candidate-portal', label: 'Candidate Portal' },
        { id: 'interviews', label: 'Interviews' },
      ],
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: <Briefcase className="w-5 h-5" />,
      roles: ['hr', 'admin'],
      subItems: [
        { id: 'onboarding', label: 'Onboarding' },
        { id: 'separation', label: 'Separation' },
      ],
    },
    {
      id: 'workforce',
      label: 'Employee Services',
      icon: <RefreshCw className="w-5 h-5" />,
      subItems: [
        { id: 'claims', label: 'Claims & Reimbursement' },
        { id: 'shift-scheduling', label: 'Shift & Scheduling' },
        { id: 'travel', label: 'Travel Management' },
      ],
    },
    {
      id: 'lms',
      label: 'Learning & Development',
      icon: <GraduationCap className="w-5 h-5" />,
      subItems: [
        { id: 'lms-dashboard', label: 'My Learning' },
        { id: 'course-catalog', label: 'Course Catalog' },
        { id: 'training-schedule', label: 'Training Schedule' },
      ],
    },
    {
      id: 'engage',
      label: 'Employee Engagement',
      icon: <MessageSquare className="w-5 h-5" />,
      subItems: [
        { id: 'surveys', label: 'Surveys & Polls' },
        { id: 'feedback', label: 'Feedback' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['hr', 'admin', 'manager'],
      subItems: [
        { id: 'attendance-report', label: 'Attendance Report' },
        { id: 'timesheet-report', label: 'Timesheet Report' },
        { id: 'project-report', label: 'Project Report' },
        { id: 'lead-report', label: 'Lead Report' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      subItems: [
        { id: 'my-profile', label: 'My Profile' },
        { id: 'personal-settings', label: 'Personal Settings' },
        { id: 'company-settings', label: 'Company Settings' },
        { id: 'permissions-management', label: 'Permissions & Roles' },
      ],
    },
  ];

  const hasAccess = (item: NavItem) => {
    // Check explicit role requirements
    if (item.roles && !item.roles.includes(user.role)) {
      return false;
    }
    
    // Check RBAC rules
    if (item.id === 'projects' && !canAccessProjects(user)) {
      return false;
    }
    
    if (item.id === 'leads' && !canAccessLeads(user)) {
      return false;
    }
    
    if (item.id === 'reports' && !canAccessReports(user)) {
      return false;
    }
    
    return true;
  };

  const canAccessSubItem = (parentId: string, subItemId: string): boolean => {
    // Filter skill sub-items based on role
    if (parentId === 'skills') {
      if (subItemId === 'skill-matrix' && !canAccessSkillMatrix(user)) {
        return false;
      }
      if (subItemId === 'team-structure' && !canAccessTeamStructure(user)) {
        return false;
      }
    }

    // Filter project sub-items for HR
    if (parentId === 'my-tasks' && !canAccessProjects(user)) {
      return false;
    }

    // Filter reports sub-items
    if (parentId === 'reports') {
      if ((subItemId === 'project-report' || subItemId === 'lead-report') && !canAccessProjects(user)) {
        return false;
      }
    }

    // Filter settings sub-items
    if (parentId === 'settings') {
      if (subItemId === 'company-settings' && user.role !== 'admin') {
        return false;
      }
      if (subItemId === 'permissions-management' && user.role !== 'admin') {
        return false;
      }
      if (subItemId === 'company-management' && user.role !== 'admin') {
        return false;
      }
    }

    // Filter documents sub-items - only HR and Admin can manage documents
    if (parentId === 'documents') {
      if (subItemId === 'document-management' && user.role !== 'hr' && user.role !== 'admin') {
        return false;
      }
    }

    // Filter performance sub-items - only HR, Admin, and Managers can manage appraisals
    if (parentId === 'performance') {
      if (subItemId === 'appraisal-management' && user.role !== 'hr' && user.role !== 'admin' && user.role !== 'manager') {
        return false;
      }
    }

    // Filter leave sub-items
    if (parentId === 'leave') {
      // Only managers can approve leaves
      if (subItemId === 'leave-approval' && user.role !== 'manager' && user.role !== 'admin') {
        return false;
      }
      // Only HR and Admin can manage leave types and policies
      if (subItemId === 'leave-management' && user.role !== 'hr' && user.role !== 'admin') {
        return false;
      }
    }

    // Filter payroll sub-items
    if (parentId === 'payroll') {
      // Only Finance and Accounts can process payroll
      if (subItemId === 'payroll-processing' && user.role !== 'finance' && user.role !== 'accounts' && user.role !== 'admin') {
        return false;
      }
      // Only Admin and Finance can approve payroll
      if (subItemId === 'payroll-approval' && user.role !== 'admin' && user.role !== 'finance') {
        return false;
      }
    }

    return true;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
      <div className="w-64 bg-gradient-to-b from-background to-muted/20 border-r border-border/40 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg shadow-sm">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
          <h2 className="font-semibold text-foreground">HR & PM System</h2>
            <p className="text-xs text-muted-foreground">Enterprise Edition</p>
          </div>
        </div>
        
        <CompanySwitcher 
          onCreateCompany={() => onNavigate('create-company')}
          onManageCompanies={() => onNavigate('company-management')}
        />
      </div>
      
      {/* User Profile */}
      <div className="p-2 border-b border-border/40">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 backdrop-blur-sm">
          <Avatar className="w-9 h-9 border-2 border-primary/20 shadow-sm">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{user.name}</p>
            <Badge variant="secondary" className="mt-1 text-xs capitalize bg-primary/10 text-primary border-primary/20">
              {user.role}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map(item => {
          if (!hasAccess(item)) return null;
          
          const isActive = currentPage === item.id || 
            item.subItems?.some(sub => sub.id === currentPage);
          const isExpanded = expandedItems.has(item.id);
          
          return (
            <div key={item.id} className="group">
              {/* Main Nav Item */}
              <div
                className={cn(
                  "flex items-center gap-3 w-full p-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-primary text-white border border-primary/20 shadow-sm" 
                    : "text-muted-foreground hover:text-foreground",
                  !item.subItems && "hover:translate-x-1"
                )}
                onClick={() => {
                  if (item.subItems && item.subItems.length > 0) {
                    toggleExpanded(item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
              >
                <div className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {item.icon}
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                
                {/* Badge and Chevron */}
                <div className="flex items-center gap-1">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 px-1.5 py-0 h-4">
                      {item.badge}
                    </Badge>
                  )}
                  {item.subItems && (
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-200 text-muted-foreground",
                      isExpanded ? "rotate-180 " : "rotate-0",isActive?"text-white":"hover:text-muted-foreground"
                    )} />
                  )}
                </div>
              </div>
              
              {/* Sub Items */}
              {item.subItems && isExpanded && (
                <div className="ml-4 mt-1 space-y-1 border-l border-border/40 pl-3 py-1">
                  {item.subItems
                    .filter(subItem => canAccessSubItem(item.id, subItem.id))
                    .map(subItem => {
                      const isSubActive = currentPage === subItem.id;
                      return (
                        <div
                          key={subItem.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-all duration-200",
                            "hover:bg-accent hover:text-accent-foreground",
                            isSubActive 
                              ? "bg-primary/5 text-primary font-medium border border-primary/10" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          onClick={() => onNavigate(subItem.id)}
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full bg-current transition-all duration-200",
                            isSubActive ? "opacity-100 scale-100" : "opacity-40 scale-75"
                          )} />
                          <span className="flex-1">{subItem.label}</span>
                          {subItem.badge && (
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 px-1.5 py-0 h-4">
                              {subItem.badge}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-border/40">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200 rounded-xl"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </div>
  );
}