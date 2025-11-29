import { useNavigate } from 'react-router-dom';
import { Clock, FileText, FolderKanban, CheckSquare, Calendar, AlertCircle, TrendingUp, Users, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User } from '../../App';
import { useState, useEffect } from 'react';
import { attendanceApi, timesheetApi, projectApi, taskApi } from '../../services/api';

interface EmployeeDashboardProps {
  user: User;
}

interface DashboardData {
  attendanceStatus: {
    checkedIn: boolean;
    checkInTime: string | null;
    checkOutTime: string | null;
    workedHours: number;
  };
  timesheetData: {
    weekHours: number;
    expectedHours: number;
    status: string;
  };
  myProjects: Array<{
    id: number;
    name: string;
    status: string;
    progress: number;
    totalTasks: number;
    completedTasks: number;
  }>;
  myTasks: Array<{
    id: number;
    title: string;
    project: string;
    priority: string;
    dueDate: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    status: string;
  }>;
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Helper function to capitalize text
  const capitalizeFirstLetter = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Fetch real-time data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch today's attendance
        const todayAttendance = await attendanceApi.getToday();
        
        // Fetch weekly timesheet summary
        const weekStartDate = getWeekStartDate();
        const timesheet = await timesheetApi.getWeekly(weekStartDate);
        
        // Fetch user's projects with task data for progress calculation
        const projects = await projectApi.getEmployeeProjects(parseInt(user.id));
        
        // Fetch detailed project data with tasks for each project
        const projectsWithProgress = await Promise.all(
          projects.map(async (project) => {
            try {
              // Fetch tasks for this project to calculate real progress
              const projectTasks = await taskApi.getProjectTasks(project.id);
              
              // Calculate progress based on task completion (like in ProjectTasks)
              const totalTasks = projectTasks.length;
              const completedTasks = projectTasks.filter(task => 
                task.status === 'done' || task.status === 'completed'
              ).length;
              
              let progress = 0;
              if (totalTasks > 0) {
                progress = Math.round((completedTasks / totalTasks) * 100);
              } else {
                // Fallback to timeline-based calculation if no tasks
                const startDate = new Date(project.start_date);
                const endDate = new Date(project.end_date);
                const today = new Date();
                
                const totalDuration = endDate.getTime() - startDate.getTime();
                const elapsedDuration = today.getTime() - startDate.getTime();
                
                if (totalDuration > 0 && elapsedDuration > 0) {
                  progress = Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));
                }
              }

              // If project is completed, set to 100%
              if (project.status === 'completed') {
                progress = 100;
              }

              return {
                id: project.id,
                name: project.name,
                status: project.status,
                progress,
                totalTasks,
                completedTasks
              };
            } catch (error) {
              console.error(`Error fetching tasks for project ${project.id}:`, error);
              // Return project with 0 progress if task fetch fails
              return {
                id: project.id,
                name: project.name,
                status: project.status,
                progress: 0,
                totalTasks: 0,
                completedTasks: 0
              };
            }
          })
        );
        
        // Fetch user's tasks
        const tasks = await taskApi.getMyTasks();
        
        // Fetch recent attendance for notifications
        const recentAttendance = await attendanceApi.getRecentAttendance(7);

        // Transform data for dashboard
        const transformedData: DashboardData = {
          attendanceStatus: {
            checkedIn: !!todayAttendance.check_in_at,
            checkInTime: todayAttendance.check_in_at,
            checkOutTime: todayAttendance.check_out_at,
            workedHours: calculateWorkedHours(todayAttendance.check_in_at, todayAttendance.check_out_at)
          },
          timesheetData: {
            weekHours: timesheet.total_hours || 0,
            expectedHours: 40,
            status: timesheet.status || 'draft'
          },
          myProjects: projectsWithProgress,
          myTasks: tasks.slice(0, 4).map(task => ({
            id: task.id,
            title: task.title,
            project: task.project_name || 'Unassigned Project',
            priority: task.priority,
            dueDate: formatDueDate(task.due_date)
          })),
          notifications: generateNotifications(timesheet, recentAttendance)
        };

        setDashboardData(transformedData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user.id]);

  // Helper functions
  const getWeekStartDate = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  };

  const calculateWorkedHours = (checkIn: string | null, checkOut: string | null): number => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  };

  const formatDueDate = (dueDate: string | undefined): string => {
    if (!dueDate) return 'No due date';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const generateNotifications = (timesheet: any, recentAttendance: any[]): any[] => {
    const notifications = [];
    
    // Timesheet notifications
    if (timesheet.status === 'approved') {
      notifications.push({
        id: '1',
        type: 'timesheet',
        message: `Week ${getWeekNumber()} - Approved`,
        status: 'success'
      });
    } else if (timesheet.status === 'rejected') {
      notifications.push({
        id: '1',
        type: 'timesheet',
        message: `Week ${getWeekNumber()} - Needs Revision`,
        status: 'warning'
      });
    }
    
    // Task notifications
    if (dashboardData?.myTasks.filter(task => task.dueDate === 'Today').length) {
      notifications.push({
        id: '2',
        type: 'task',
        message: 'Tasks due today',
        status: 'warning'
      });
    }
    
    return notifications;
  };

  const getWeekNumber = (): number => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Handle clock in/out
  const handleClockAction = async () => {
    try {
      const todayAttendance = await attendanceApi.getToday();
      
      if (!todayAttendance.check_in_at) {
        // Clock in
        await attendanceApi.clockIn();
      } else if (!todayAttendance.check_out_at) {
        // Clock out
        await attendanceApi.clockOut();
      }
      
      // Refresh data
      const updatedAttendance = await attendanceApi.getToday();
      setDashboardData(prev => prev ? {
        ...prev,
        attendanceStatus: {
          checkedIn: !!updatedAttendance.check_in_at,
          checkInTime: updatedAttendance.check_in_at,
          checkOutTime: updatedAttendance.check_out_at,
          workedHours: calculateWorkedHours(updatedAttendance.check_in_at, updatedAttendance.check_out_at)
        }
      } : prev);
      
    } catch (err) {
      console.error('Error performing clock action:', err);
      setError('Failed to update attendance');
    }
  };

  // Navigation handlers
  const handleProjectClick = (projectId: number) => {
    navigate(`/tasks/project-grid/${projectId}`);
  };

  const handleTaskClick = (taskId: number) => {
    navigate(`/tasks/my-tasks?task=${taskId}`);
  };

  const handleNotificationClick = (notification: any) => {
    if (notification.type === 'timesheet') {
      navigate('/timesheet/my-timesheet');
    } else if (notification.type === 'task') {
      navigate('/tasks/my-tasks');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load dashboard</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = dashboardData!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-500 mt-2">{today}</p>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Attendance */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Today's Attendance</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge 
                    variant={data.attendanceStatus.checkedIn ? "default" : "secondary"}
                    className={data.attendanceStatus.checkedIn ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {data.attendanceStatus.checkedIn ? 
                      (data.attendanceStatus.checkOutTime ? 'Checked Out' : 'Checked In') : 
                      'Not Checked In'
                    }
                  </Badge>
                </div>
                {data.attendanceStatus.checkInTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Check In</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(data.attendanceStatus.checkInTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {data.attendanceStatus.checkOutTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Check Out</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(data.attendanceStatus.checkOutTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
                {data.attendanceStatus.workedHours > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Worked</span>
                    <span className="text-sm font-medium text-gray-900">{data.attendanceStatus.workedHours}h</span>
                  </div>
                )}
              </div>
              <Button 
                size="sm" 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                onClick={handleClockAction}
                disabled={data.attendanceStatus.checkOutTime !== null}
              >
                {!data.attendanceStatus.checkInTime ? 'Check In' : 
                 !data.attendanceStatus.checkOutTime ? 'Check Out' : 'Completed Today'}
              </Button>
            </CardContent>
          </Card>

          {/* This Week's Timesheet */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Weekly Timesheet</CardTitle>
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {data.timesheetData.weekHours}h / {data.timesheetData.expectedHours}h
                  </span>
                </div>
                <Progress 
                  value={(data.timesheetData.weekHours / data.timesheetData.expectedHours) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={
                    data.timesheetData.status === 'approved' ? 'default' :
                    data.timesheetData.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {capitalizeFirstLetter(data.timesheetData.status)}
                  </Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => navigate('/timesheet/my-timesheet')}
              >
                {data.timesheetData.weekHours > 0 ? 'Update Timesheet' : 'Fill Timesheet'}
              </Button>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Active Projects</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <FolderKanban className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{data.myProjects.length}</p>
                    <p className="text-sm text-gray-500">active projects</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => navigate('/tasks/project-grid')}
                >
                  View All Projects
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">My Tasks</CardTitle>
              <div className="p-2 bg-orange-50 rounded-lg">
                <CheckSquare className="w-4 h-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{data.myTasks.length}</p>
                    <p className="text-sm text-gray-500">tasks pending</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => navigate('/tasks/my-tasks')}
                >
                  View All Tasks
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Projects */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-purple-600" />
                My Projects
              </CardTitle>
              <CardDescription>Active projects you're working on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.myProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="space-y-3 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                        {project.name}
                      </p>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-700">{project.progress}%</span>
                        <p className="text-xs text-gray-500">
                          {project.completedTasks}/{project.totalTasks} tasks
                        </p>
                      </div>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Status: {capitalizeFirstLetter(project.status)}</span>
                      <span>ID: PRJ{project.id.toString().padStart(3, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-orange-600" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks due soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.myTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate hover:text-orange-600 transition-colors">
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{task.project}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' : 
                        task.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {capitalizeFirstLetter(task.priority)}
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

        {/* Notifications & Approvals */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              Notifications & Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.notifications.length > 0 ? (
                data.notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className={`p-2 rounded-full ${
                      notif.status === 'success' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      <AlertCircle className={`w-4 h-4 ${
                        notif.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <p className="flex-1 text-gray-700 hover:text-gray-900 transition-colors">
                      {notif.message}
                    </p>
                    <Badge 
                      variant={notif.status === 'success' ? 'default' : 'secondary'}
                      className={notif.status === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                    >
                      {capitalizeFirstLetter(notif.status)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No new notifications</p>
                  <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}