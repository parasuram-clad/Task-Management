import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Building2, Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';

interface SuperAdminDashboardProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

export function SuperAdminDashboard({ user, navigateTo }: SuperAdminDashboardProps) {
  const { allCompanies, allUsers } = useSuperAdmin();

  const activeCompanies = allCompanies.filter(c => c.is_active).length;
  const totalUsers = allUsers.length;
  const totalRevenue = allCompanies.reduce((sum, c) => {
    const planPricing = { free: 0, basic: 29, professional: 99, enterprise: 299 };
    return sum + (planPricing[c.plan] || 0);
  }, 0);

  const stats = [
    {
      title: 'Total Companies',
      value: allCompanies.length.toString(),
      description: `${activeCompanies} active`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Users',
      value: totalUsers.toString(),
      description: 'Across all companies',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      description: 'From subscriptions',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Growth Rate',
      value: '+23%',
      description: 'vs last month',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const recentCompanies = [...allCompanies]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Platform Administration</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's an overview of your SaaS platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-2xl mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompanies.map(company => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigateTo('superadmin-companies')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.user_count} users · {company.plan}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        company.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {company.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['free', 'basic', 'professional', 'enterprise'].map(plan => {
                const count = allCompanies.filter(c => c.plan === plan).length;
                const percentage = allCompanies.length > 0 
                  ? ((count / allCompanies.length) * 100).toFixed(0)
                  : 0;
                
                const colors = {
                  free: 'bg-gray-500',
                  basic: 'bg-blue-500',
                  professional: 'bg-purple-500',
                  enterprise: 'bg-orange-500',
                };

                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm capitalize">{plan}</span>
                      <span className="text-sm text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[plan as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigateTo('superadmin-create-company')}
                className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Building2 className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-center">New Company</p>
              </button>
              <button
                onClick={() => navigateTo('superadmin-users')}
                className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-center">Manage Users</p>
              </button>
              <button
                onClick={() => navigateTo('superadmin-companies')}
                className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-center">View Companies</p>
              </button>
              <button
                onClick={() => navigateTo('superadmin-analytics')}
                className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-center">Analytics</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response Time</span>
                <span className="text-sm font-medium text-green-600">142ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Uptime</span>
                <span className="text-sm font-medium text-green-600">99.98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Health</span>
                <span className="text-sm font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Sessions</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
