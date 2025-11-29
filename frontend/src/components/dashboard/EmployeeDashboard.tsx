import { Clock, FileText, FolderKanban, CheckSquare, Calendar, AlertCircle, CheckCircle2, Activity, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User } from '../../App';

interface EmployeeDashboardProps {
  user: User;
  navigateTo: (page: string) => void;
}

export function EmployeeDashboard({ user, navigateTo }: EmployeeDashboardProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Mock data
  const attendanceStatus = {
    checkedIn: true,
    checkInTime: '09:15 AM',
    checkOutTime: null,
    workedHours: 4.5,
  };

  const timesheetData = {
    weekHours: 28,
    expectedHours: 40,
    status: 'draft',
  };

  const myProjects = [
    { id: '1', name: 'E-commerce Platform', status: 'active', progress: 75 },
    { id: '2', name: 'Mobile App Redesign', status: 'active', progress: 45 },
    { id: '3', name: 'API Integration', status: 'active', progress: 90 },
  ];

  const myTasks = [
    { id: '1', title: 'Fix login bug', project: 'E-commerce Platform', priority: 'high', dueDate: 'Today' },
    { id: '2', title: 'Update documentation', project: 'API Integration', priority: 'medium', dueDate: 'Tomorrow' },
    { id: '3', title: 'Review PR #234', project: 'Mobile App Redesign', priority: 'low', dueDate: 'Nov 10' },
    { id: '4', title: 'Implement payment gateway', project: 'E-commerce Platform', priority: 'high', dueDate: 'Nov 8' },
  ];

  const notifications = [
    { id: '1', type: 'timesheet', message: 'Week 44 - Approved', status: 'success' },
    { id: '2', type: 'task', message: '3 tasks due this week', status: 'warning' },
  ];

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Activity className="w-4 h-4" />
            {today}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigateTo('my-attendance')}>
            <Clock className="w-4 h-4 mr-2" />
            Attendance
          </Button>
          <Button onClick={() => navigateTo('my-timesheet')}>
            <FileText className="w-4 h-4 mr-2" />
            Timesheet
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today's Attendance</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {attendanceStatus.checkedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-green-600">Checked In</p>
                </div>
                <p className="text-sm text-muted-foreground">at {attendanceStatus.checkInTime}</p>
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xs text-muted-foreground">Worked Hours</p>
                  <p className="text-green-600">{attendanceStatus.workedHours} hrs</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-muted-foreground">Not Checked In</p>
                <Button size="sm" className="w-full" onClick={() => navigateTo('my-attendance')}>
                  Check In
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Week's Timesheet</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-blue-600">{timesheetData.weekHours}</span>
                <span className="text-sm text-muted-foreground">/ {timesheetData.expectedHours} hrs</span>
              </div>
              <Progress value={(timesheetData.weekHours / timesheetData.expectedHours) * 100} className="h-2" />
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => navigateTo('my-timesheet')}
              >
                Fill Timesheet
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Projects</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <FolderKanban className="w-5 h-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-purple-600">{myProjects.length}</span>
                <span className="text-sm text-muted-foreground">projects assigned</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigateTo('projects')}
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">My Tasks</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-orange-600">{myTasks.length}</span>
                <span className="text-sm text-muted-foreground">tasks pending</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigateTo('my-tasks')}
              >
                View Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>My Projects</CardTitle>
                <CardDescription>Active projects you're working on</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProjects.map(project => (
                <div key={project.id} className="space-y-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-primary" />
                      <p className="text-sm">{project.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due soon</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map(task => (
                <div key={task.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle>Notifications & Approvals</CardTitle>
              <CardDescription>Recent updates and status changes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className={`flex items-center gap-3 p-4 rounded-lg border ${
                notif.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                {notif.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                )}
                <p className="flex-1 text-sm">{notif.message}</p>
                <Badge variant={notif.status === 'success' ? 'default' : 'secondary'} className="bg-white">
                  {notif.status === 'success' ? 'Approved' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}