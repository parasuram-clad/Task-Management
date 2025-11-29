import { 
  LayoutDashboard, 
  Clock, 
  FileText, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User, UserRole } from '../App';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useState } from 'react';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: UserRole[];
  subItems?: { id: string; label: string; path: string }[];
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/dashboard',
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Clock className="w-5 h-5" />,
      path: '/attendance/my-attendance',
      subItems: [
        { id: 'my-attendance', label: 'My Attendance', path: '/attendance/my-attendance' },
        { id: 'attendance-calendar', label: 'Calendar View', path: '/attendance/calendar' },
        { id: 'team-attendance', label: 'Team Attendance', path: '/attendance/team' },
      ],
    },
    {
      id: 'timesheet',
      label: 'Timesheet',
      icon: <FileText className="w-5 h-5" />,
      path: '/timesheet/my-timesheet',
      subItems: [
        { id: 'my-timesheet', label: 'My Timesheet', path: '/timesheet/my-timesheet' },
        { id: 'timesheet-approval', label: 'Approvals', path: '/timesheet/approval' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
      path: '/projects',
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      path: '/tasks/my-tasks',
      subItems: [
        { id: 'my-tasks', label: 'My Tasks', path: '/tasks/my-tasks' },
        { id: 'project-tasks', label: 'Project Tasks', path: '/tasks/project-grid' },
      ],
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: <Users className="w-5 h-5" />,
      path: '/employees',
      roles: ['hr', 'admin', 'manager'],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/reports/attendance',
      roles: ['hr', 'admin', 'manager'],
      subItems: [
        { id: 'attendance-report', label: 'Attendance Report', path: '/reports/attendance' },
        { id: 'timesheet-report', label: 'Timesheet Report', path: '/reports/timesheet' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings/personal',
      subItems: [
        { id: 'personal-settings', label: 'Personal Settings', path: '/settings/personal' },
        { id: 'company-settings', label: 'Company Settings', path: '/settings/company' },
      ],
    },
  ];

  const hasAccess = (item: NavItem) => {
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item: NavItem) => {
    if (isActive(item.path)) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => isActive(subItem.path));
    }
    return false;
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // Auto-expand active items on initial load
  useState(() => {
    const autoExpanded = new Set();
    navItems.forEach(item => {
      if (item.subItems && isParentActive(item)) {
        autoExpanded.add(item.id);
      }
    });
    setExpandedItems(autoExpanded);
  });

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-4">
        <h1 className="text-blue-600">HR & Project Hub</h1>
      </div>
      
      <Separator />
      
      <div className="p-4 flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate">{user.name}</p>
          <p className="text-gray-500 text-sm capitalize">{user.role}</p>
        </div>
      </div>
      
      <Separator />
      
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map(item => {
          if (!hasAccess(item)) return null;
          
          const active = isParentActive(item);
          const isExpanded = expandedItems.has(item.id);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.id} className="mb-1">
              <div className="relative">
                {/* Main menu item - only navigate if no subitems */}
                {!hasSubItems ? (
                  <Link to={item.path}>
                    <Button
                      variant={active ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 transition-all duration-200"
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                    </Button>
                  </Link>
                ) : (
                  // Menu item with subitems - toggle dropdown on click
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 transition-all duration-200"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                    />
                  </Button>
                )}
              </div>
              
              {/* Submenu items */}
              {hasSubItems && isExpanded && (
                <div className="ml-8 mt-1 space-y-1 animate-in fade-in-50 slide-in-from-top-2 duration-200">
                  {item.subItems.map(subItem => (
                    <Link key={subItem.id} to={subItem.path}>
                      <Button
                        variant={isActive(subItem.path) ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm transition-all duration-200 hover:pl-4"
                      >
                        {subItem.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      <Separator />
      
      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}