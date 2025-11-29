import { User } from '../../App';
import { Building2, Users, BarChart3, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';

interface SuperAdminSidebarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function SuperAdminSidebar({
  user,
  currentPage,
  onNavigate,
  onLogout,
}: SuperAdminSidebarProps) {
  const menuItems = [
    {
      id: 'superadmin-dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'superadmin-companies',
      label: 'Companies',
      icon: Building2,
    },
    {
      id: 'superadmin-users',
      label: 'Users',
      icon: Users,
    },
    {
      id: 'superadmin-analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'superadmin-settings',
      label: 'Platform Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-card border-r flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl mb-1">Platform Admin</h1>
        <p className="text-sm text-muted-foreground">SaaS Management</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
