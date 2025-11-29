import { useState } from 'react';
import {
  FolderKanban,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { User } from '../../App';

interface ProjectReportProps {
  user: User;
}

const projectData = [
  {
    id: 1,
    name: 'E-commerce Platform',
    status: 'active',
    progress: 75,
    budget: 150000,
    spent: 112500,
    hoursAllocated: 2000,
    hoursLogged: 1500,
    teamSize: 8,
    health: 'green'
  },
  {
    id: 2,
    name: 'Mobile App Redesign',
    status: 'active',
    progress: 45,
    budget: 80000,
    spent: 36000,
    hoursAllocated: 1200,
    hoursLogged: 540,
    teamSize: 5,
    health: 'green'
  },
  {
    id: 3,
    name: 'API Integration',
    status: 'on-hold',
    progress: 30,
    budget: 50000,
    spent: 20000,
    hoursAllocated: 800,
    hoursLogged: 240,
    teamSize: 3,
    health: 'yellow'
  },
  {
    id: 4,
    name: 'Legacy System Migration',
    status: 'active',
    progress: 60,
    budget: 200000,
    spent: 140000,
    hoursAllocated: 3000,
    hoursLogged: 1800,
    teamSize: 10,
    health: 'red'
  },
];

const monthlyData = [
  { month: 'Jul', projects: 3, hours: 1200, revenue: 45000 },
  { month: 'Aug', projects: 4, hours: 1500, revenue: 58000 },
  { month: 'Sep', projects: 5, hours: 1800, revenue: 72000 },
  { month: 'Oct', projects: 4, hours: 1600, revenue: 65000 },
  { month: 'Nov', projects: 4, hours: 1750, revenue: 68000 },
];

const statusData = [
  { name: 'Active', value: 3, color: '#10b981' },
  { name: 'On Hold', value: 1, color: '#f59e0b' },
  { name: 'Completed', value: 2, color: '#6366f1' },
];

const healthData = [
  { name: 'Green', value: 2, color: '#10b981' },
  { name: 'Yellow', value: 1, color: '#f59e0b' },
  { name: 'Red', value: 1, color: '#ef4444' },
];

export function ProjectReport({ user }: ProjectReportProps) {
  const [dateRange, setDateRange] = useState('this-month');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProjects = projectData.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  );

  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
  const totalHours = filteredProjects.reduce((sum, p) => sum + p.hoursLogged, 0);
  const avgProgress = Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length);

  const handleExport = () => {
    // Export logic
    console.log('Exporting report...');
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <FolderKanban className="w-8 h-8 text-primary" />
            Project Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive project analytics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4" />
              Total Projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{filteredProjects.length}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget Utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{Math.round((totalSpent / totalBudget) * 100)}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{totalHours.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{avgProgress}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Project Hours</CardTitle>
            <CardDescription>Hours logged across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Spent */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Budget allocation and spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredProjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#6366f1" name="Budget" />
                <Bar dataKey="spent" fill="#10b981" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Projects by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Health */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Health Distribution</CardTitle>
            <CardDescription>Projects by health status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project Details Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Detailed breakdown of all projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Health</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="w-20" />
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>${project.budget.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={project.spent > project.budget * 0.9 ? 'text-red-600' : ''}>
                        ${project.spent.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>{project.hoursLogged.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {project.teamSize}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`w-3 h-3 rounded-full ${
                        project.health === 'green' ? 'bg-green-500' :
                        project.health === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
