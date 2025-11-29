import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SuperAdminAnalyticsProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

export function SuperAdminAnalytics({ user, navigateTo }: SuperAdminAnalyticsProps) {
  const { allCompanies } = useSuperAdmin();

  // Mock revenue data
  const revenueData = [
    { month: 'Jan', revenue: 12400, companies: 45 },
    { month: 'Feb', revenue: 15300, companies: 52 },
    { month: 'Mar', revenue: 18200, companies: 58 },
    { month: 'Apr', revenue: 21100, companies: 65 },
    { month: 'May', revenue: 24500, companies: 73 },
    { month: 'Jun', revenue: 28300, companies: 82 },
  ];

  // Plan distribution data
  const planData = [
    { name: 'Free', value: allCompanies.filter(c => c.plan === 'free').length, color: '#6B7280' },
    { name: 'Basic', value: allCompanies.filter(c => c.plan === 'basic').length, color: '#3B82F6' },
    { name: 'Professional', value: allCompanies.filter(c => c.plan === 'professional').length, color: '#8B5CF6' },
    { name: 'Enterprise', value: allCompanies.filter(c => c.plan === 'enterprise').length, color: '#F59E0B' },
  ];

  // User growth data
  const userGrowthData = [
    { month: 'Jan', users: 245 },
    { month: 'Feb', users: 312 },
    { month: 'Mar', users: 398 },
    { month: 'Apr', users: 467 },
    { month: 'May', users: 543 },
    { month: 'Jun', users: 628 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Insights and metrics across all companies
        </p>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="companies" fill="#3B82F6" name="Companies" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Avg Revenue per Company</p>
            <p className="text-2xl">$156</p>
            <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Churn Rate</p>
            <p className="text-2xl">2.3%</p>
            <p className="text-xs text-green-600 mt-1">-0.8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Avg Users per Company</p>
            <p className="text-2xl">7.6</p>
            <p className="text-xs text-green-600 mt-1">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Conversion Rate</p>
            <p className="text-2xl">18.5%</p>
            <p className="text-xs text-red-600 mt-1">-2.1% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
