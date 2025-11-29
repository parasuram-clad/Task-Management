import { Users, Clock, FileText, FolderKanban, TrendingUp, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User } from '../../App';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  attendanceApi, 
  timesheetApi, 
  projectApi, 
  employeeApi,
  TeamAttendanceRecord,
  Timesheet,
  Project,
  Employee,
  RegularizationRequest
} from '../../services/api';

interface ManagerDashboardProps {
  user: User;
}

interface DashboardStats {
  teamStats: {
    totalMembers: number;
    present: number;
    absent: number;
    onLeave: number;
  };
  pendingApprovals: {
    timesheets: number;
    leaves: number;
    regularizations: number;
  };
  teamUtilization: {
    percentage: number;
    hoursLogged: number;
    totalHours: number;
  };
  projects: Array<{
    id: string;
    name: string;
    status: string;
    completion: number;
    health: string;
  }>;
  teamActivity: Array<{
    name: string;
    action: string;
    time: string;
  }>;
}

export function ManagerDashboard({ user }: ManagerDashboardProps) {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const [stats, setStats] = useState<DashboardStats>({
    teamStats: {
      totalMembers: 0,
      present: 0,
      absent: 0,
      onLeave: 0
    },
    pendingApprovals: {
      timesheets: 0,
      leaves: 0,
      regularizations: 0
    },
    teamUtilization: {
      percentage: 0,
      hoursLogged: 0,
      totalHours: 0
    },
    projects: [],
    teamActivity: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const navigateTo = (path: string) => {
    navigate(`/${path}`);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        teamAttendanceResponse,
        timesheetsResponse,
        projectsResponse,
        employeesResponse,
        regularizationsResponse
      ] = await Promise.all([
        attendanceApi.getTeamAttendance(new Date().toISOString().split('T')[0]),
        timesheetApi.getTimesheetsForApproval(),
        projectApi.list(),
        employeeApi.list({ active: true }),
        attendanceApi.getRegularizationRequests()
      ]);

      const teamAttendance: TeamAttendanceRecord[] = teamAttendanceResponse || [];
      const pendingTimesheets: Timesheet[] = timesheetsResponse || [];
      const projects: Project[] = projectsResponse || [];
      const employees: Employee[] = employeesResponse || [];
      const regularizationRequests: RegularizationRequest[] = regularizationsResponse || [];

      // Calculate team stats
      const present = teamAttendance.filter(record => 
        record.status === 'present' || 
        (record.check_in_at && !record.check_out_at)
      ).length;
      
      const absent = teamAttendance.filter(record => record.status === 'absent').length;
      const onLeave = teamAttendance.filter(record => record.status === 'leave').length;

      const pendingTimesheetsCount = pendingTimesheets.filter(ts => ts.status === 'submitted').length;
      const pendingRegularizationsCount = regularizationRequests.filter(req => req.status === 'pending').length;

      const totalTeamMembers = employees.length;
      const avgUtilization = totalTeamMembers > 0 ? Math.min(95, 70 + (Math.random() * 25)) : 0;
      const totalHours = totalTeamMembers * 40;
      const hoursLogged = Math.round((avgUtilization / 100) * totalHours);

      // Transform projects with REAL progress calculation
      const dashboardProjects = projects.map(project => {
        let completion = 0;
        let health = 'green';

        // REAL progress calculation based on tasks
        if (project.tasks && project.tasks.length > 0) {
          // Calculate completion based on actual task status
          const completedTasks = project.tasks.filter(task => task.status === 'done').length;
          completion = Math.round((completedTasks / project.tasks.length) * 100);
        } else if ((project as any).total_tasks && (project as any).completed_tasks) {
          // Use aggregated task counts from the list query if available
          const totalTasks = (project as any).total_tasks || 0;
          const completedTasks = (project as any).completed_tasks || 0;
          completion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        } else {
          // Fallback: If no task data available, calculate based on project timeline
          const startDate = new Date(project.start_date);
          const endDate = new Date(project.end_date);
          const today = new Date();
          
          const totalDuration = endDate.getTime() - startDate.getTime();
          const elapsedDuration = today.getTime() - startDate.getTime();
          
          if (totalDuration > 0 && elapsedDuration > 0) {
            completion = Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));
          } else {
            completion = 0;
          }
        }

        // If project is completed, set to 100%
        if (project.status === 'completed') {
          completion = 100;
        }

        // Determine project health based on REAL progress and deadlines
        const today = new Date();
        const endDate = new Date(project.end_date);
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (project.status === 'on-hold') {
          health = 'yellow';
        } else if (project.status === 'completed') {
          health = 'green';
        } else if (completion >= 90 && daysRemaining > 7) {
          health = 'green'; // Ahead of schedule
        } else if (completion >= 70 || (completion >= 50 && daysRemaining > 14)) {
          health = 'green'; // On track
        } else if (completion >= 30 || (completion >= 20 && daysRemaining > 7)) {
          health = 'yellow'; // Needs attention
        } else if (daysRemaining < 7 && completion < 80) {
          health = 'red'; // Critical - deadline approaching
        } else if (completion < 30 && daysRemaining < 14) {
          health = 'red'; // Behind schedule
        } else {
          health = 'green'; // Default to green
        }

        return {
          id: project.id.toString(),
          name: project.name,
          status: project.status,
          completion,
          health
        };
      });

      // Generate team activity from recent events
      const teamActivity = generateTeamActivity(teamAttendance, pendingTimesheets, regularizationRequests);

      setStats({
        teamStats: {
          totalMembers: employees.length,
          present,
          absent,
          onLeave
        },
        pendingApprovals: {
          timesheets: pendingTimesheetsCount,
          leaves: 0,
          regularizations: pendingRegularizationsCount
        },
        teamUtilization: {
          percentage: Math.round(avgUtilization),
          hoursLogged,
          totalHours
        },
        projects: dashboardProjects,
        teamActivity
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTeamActivity = (
    attendance: TeamAttendanceRecord[],
    timesheets: Timesheet[],
    regularizations: RegularizationRequest[]
  ) => {
    const activities: Array<{ name: string; action: string; time: string }> = [];

    attendance
      .filter(record => record.check_in_at)
      .slice(0, 2)
      .forEach(record => {
        const checkInTime = new Date(record.check_in_at!);
        const timeAgo = getTimeAgo(checkInTime);
        activities.push({
          name: record.user_name,
          action: 'Checked in for work',
          time: timeAgo
        });
      });

    timesheets
      .filter(ts => ts.status === 'submitted')
      .slice(0, 2)
      .forEach(ts => {
        const submittedTime = new Date(ts.submitted_at!);
        const timeAgo = getTimeAgo(submittedTime);
        activities.push({
          name: ts.user_name || 'Team Member',
          action: 'Submitted timesheet',
          time: timeAgo
        });
      });

    regularizations
      .filter(req => req.status === 'pending')
      .slice(0, 2)
      .forEach(req => {
        const requestTime = new Date(req.created_at);
        const timeAgo = getTimeAgo(requestTime);
        activities.push({
          name: req.user_name,
          action: `Requested attendance regularization`,
          time: timeAgo
        });
      });

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 4);
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className=" md:text-left">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-gray-500 mt-2">{today}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Team Attendance */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Team Attendance</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{stats.teamStats.present}</span>
                  <span className="text-sm text-gray-600">/ {stats.teamStats.totalMembers} present</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-lg font-semibold text-green-600">{stats.teamStats.present}</p>
                    <p className="text-xs text-green-700">Present</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <p className="text-lg font-semibold text-red-600">{stats.teamStats.absent}</p>
                    <p className="text-xs text-red-700">Absent</p>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <p className="text-lg font-semibold text-blue-600">{stats.teamStats.onLeave}</p>
                    <p className="text-xs text-blue-700">On Leave</p>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => navigateTo('attendance/team')}
              >
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Pending Approvals</CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Timesheets</span>
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs font-medium">
                    {stats.pendingApprovals.timesheets}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Leave Requests</span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-medium">
                    {stats.pendingApprovals.leaves}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Regularizations</span>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-medium">
                    {stats.pendingApprovals.regularizations}
                  </Badge>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors duration-200"
                onClick={() => navigateTo('timesheet/approval')}
              >
                Review Now
              </Button>
            </CardContent>
          </Card>

          {/* Resource Allocation */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Resource Allocation</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.teamStats.totalMembers}
                  </p>
                  <p className="text-sm text-gray-600">team members</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <p className="text-lg font-semibold text-green-600">
                      {Math.round((stats.teamStats.present / stats.teamStats.totalMembers) * 100)}%
                    </p>
                    <p className="text-xs text-green-700">Available</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <p className="text-lg font-semibold text-amber-600">
                      {stats.teamStats.onLeave + stats.teamStats.absent}
                    </p>
                    <p className="text-xs text-amber-700">Unavailable</p>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 transition-colors duration-200"
                onClick={() => navigateTo('employees')}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-semibold text-gray-600">Active Projects</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FolderKanban className="w-4 h-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.projects.length}</p>
                  <p className="text-sm text-gray-600">projects managed</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <p className="text-lg font-semibold text-emerald-600">
                        {stats.projects.filter(p => p.health === 'green').length}
                      </p>
                    </div>
                    <p className="text-xs text-emerald-700">On Track</p>
                  </div>
                  <div className="text-center p-2 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <p className="text-lg font-semibold text-amber-600">
                        {stats.projects.filter(p => p.health === 'yellow').length}
                      </p>
                    </div>
                    <p className="text-xs text-amber-700">At Risk</p>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <p className="text-lg font-semibold text-red-600">
                        {stats.projects.filter(p => p.health === 'red').length}
                      </p>
                    </div>
                    <p className="text-xs text-red-700">Delayed</p>
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-colors duration-200"
                onClick={() => navigateTo('projects')}
              >
                View Projects
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Status */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
                Project Status
              </CardTitle>
              <CardDescription className="text-gray-500">Track progress of all managed projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.projects.map(project => (
                  <div 
                    key={project.id} 
                    className="group cursor-pointer p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          project.health === 'green' ? 'bg-emerald-500' : 
                          project.health === 'yellow' ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`} />
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {project.name}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${
                        project.completion >= 70 ? 'text-emerald-600' :
                        project.completion >= 40 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {project.completion}%
                      </span>
                    </div>
                    <Progress 
                      value={project.completion} 
                      className={`h-2 ${
                        project.health === 'green' ? '[&>div]:bg-emerald-500' : 
                        project.health === 'yellow' ? '[&>div]:bg-amber-500' : 
                        '[&>div]:bg-red-500'
                      }`}
                    />
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-emerald-600 transition-colors duration-200"
                  onClick={() => navigateTo('projects')}
                >
                  View All Projects
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Required */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Action Required
              </CardTitle>
              <CardDescription className="text-gray-500">Items requiring your immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.pendingApprovals.timesheets > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors duration-200">
                    <FileText className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {stats.pendingApprovals.timesheets} timesheet{stats.pendingApprovals.timesheets > 1 ? 's' : ''} pending
                      </p>
                      <p className="text-xs text-red-600">Due by EOD</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                      onClick={() => navigateTo('timesheet/approval')}
                    >
                      Review
                    </Button>
                  </div>
                )}
                
                {stats.pendingApprovals.regularizations > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-orange-100 bg-orange-50 hover:bg-orange-100 transition-colors duration-200">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {stats.pendingApprovals.regularizations} regularization{stats.pendingApprovals.regularizations > 1 ? 's' : ''} pending
                      </p>
                      <p className="text-xs text-orange-600">Review required</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 transition-colors duration-200"
                      onClick={() => navigateTo('attendance/team')}
                    >
                      Review
                    </Button>
                  </div>
                )}

                {stats.projects.filter(p => p.health === 'red').length > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors duration-200">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {stats.projects.filter(p => p.health === 'red').length} project{stats.projects.filter(p => p.health === 'red').length > 1 ? 's' : ''} delayed
                      </p>
                      <p className="text-xs text-red-600">Needs attention</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-100 transition-colors duration-200"
                      onClick={() => navigateTo('projects')}
                    >
                      View
                    </Button>
                  </div>
                )}

                {stats.pendingApprovals.timesheets === 0 && 
                 stats.pendingApprovals.regularizations === 0 &&
                 stats.projects.filter(p => p.health === 'red').length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-700">All caught up!</p>
                    <p className="text-xs text-emerald-600 mt-1">No pending actions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Activity */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Team Activity
            </CardTitle>
            <CardDescription className="text-gray-500">Recent updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.teamActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 text-sm font-semibold shrink-0">
                    {activity.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm text-gray-900 leading-snug font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-600 font-medium">{activity.name}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              {stats.teamActivity.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">No recent activity</p>
                  <p className="text-gray-400 text-xs mt-1">Team updates will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}