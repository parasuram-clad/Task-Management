import { useNavigate } from 'react-router-dom';
import { Clock, FileText, FolderKanban, CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User } from '../../App';

interface EmployeeDashboardProps {
  user: User;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const navigate = useNavigate();
  
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
     <div className="p-6 space-y-6">
      <div>
        <h1>Welcome back, {user.name}!</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today's Attendance</CardTitle>
            <Clock className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {/* Example updated button */}
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => navigate('/attendance/my-attendance')}
            >
              Check In
            </Button>
          </CardContent>
        </Card>


  <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Week's Timesheet</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/timesheet/my-timesheet')}
            >
              Fill Timesheet
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Projects</CardTitle>
            <FolderKanban className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>{myProjects.length}</p>
              <p className="text-sm text-gray-500">projects assigned</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">My Tasks</CardTitle>
            <CheckSquare className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p>{myTasks.length}</p>
              <p className="text-sm text-gray-500">tasks pending</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Active projects you're working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProjects.map(project => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p>{project.name}</p>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.map(task => (
                <div key={task.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.project}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
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

      <Card>
        <CardHeader>
          <CardTitle>Notifications & Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <AlertCircle className={`w-4 h-4 ${notif.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`} />
                <p className="flex-1">{notif.message}</p>
                <Badge variant={notif.status === 'success' ? 'default' : 'secondary'}>
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
