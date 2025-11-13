import { Users, Clock, FileText, FolderKanban, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User } from '../../App';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
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
  const navigate = useNavigate(); // Add this hook
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

  // Navigation functions
  const navigateTo = (path: string) => {
    navigate(`/${path}`);
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDelayedProjectClick = (projectName: string) => {
    const delayedProject = stats.projects.find(p => p.health === 'red' && p.name === projectName);
    if (delayedProject) {
      navigate(`/projects/${delayedProject.id}`);
    } else {
      navigate('/projects');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
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

      // Calculate pending approvals
      const pendingTimesheetsCount = pendingTimesheets.filter(ts => ts.status === 'submitted').length;
      const pendingRegularizationsCount = regularizationRequests.filter(req => req.status === 'pending').length;

      // Calculate team utilization (mock calculation - you might want to replace with actual logic)
      const totalTeamMembers = employees.length;
      const avgUtilization = totalTeamMembers > 0 ? Math.min(95, 70 + (Math.random() * 25)) : 0; // Random between 70-95%
      const totalHours = totalTeamMembers * 40; // Assuming 40 hours per week per person
      const hoursLogged = Math.round((avgUtilization / 100) * totalHours);

      // Transform projects for dashboard
      const dashboardProjects = projects.map(project => {
        let completion = 0;
        let health = 'green';

        // Calculate completion based on tasks if available
        if (project.tasks && project.tasks.length > 0) {
          const completedTasks = project.tasks.filter(task => task.status === 'done').length;
          completion = Math.round((completedTasks / project.tasks.length) * 100);
        } else {
          // Fallback to random completion for demo
          completion = Math.floor(Math.random() * 100);
        }

        // Determine project health based on completion and status
        if (completion < 30) health = 'red';
        else if (completion < 70) health = 'yellow';
        else health = 'green';

        if (project.status === 'on-hold') health = 'yellow';
        if (project.status === 'completed') health = 'green';

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
          leaves: 0, // You might need to add leave requests API
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

    // Add recent clock-ins
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

    // Add timesheet submissions
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

    // Add regularization requests
    regularizations
      .filter(req => req.status === 'pending')
      .slice(0, 2)
      .forEach(req => {
        const requestTime = new Date(req.created_at);
        const timeAgo = getTimeAgo(requestTime);
        activities.push({
          name: req.user_name,
          action: `Requested attendance regularization for ${new Date(req.work_date).toLocaleDateString()}`,
          time: timeAgo
        });
      });

    // Sort by time (most recent first) and take top 4
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
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        {/* Add more skeleton loaders as needed */}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Manager Dashboard</h1>
        <p className="text-gray-500">{today}</p>
      </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Team Attendance Card */}
  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-sm font-semibold text-blue-800">Team Attendance</CardTitle>
      <div className="p-2 bg-blue-100 rounded-lg">
        <Users className="w-4 h-4 text-blue-600" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-blue-900">{stats.teamStats.present}</span>
          <span className="text-sm text-blue-600">/ {stats.teamStats.totalMembers} present</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-green-100">
            <p className="text-lg font-semibold text-green-600">{stats.teamStats.present}</p>
            <p className="text-xs text-green-700 font-medium">Present</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-red-100">
            <p className="text-lg font-semibold text-red-600">{stats.teamStats.absent}</p>
            <p className="text-xs text-red-700 font-medium">Absent</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-blue-100">
            <p className="text-lg font-semibold text-blue-600">{stats.teamStats.onLeave}</p>
            <p className="text-xs text-blue-700 font-medium">On Leave</p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
          onClick={() => navigateTo('attendance/team')}
        >
          View Details
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Pending Approvals Card */}
  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-sm font-semibold text-amber-800">Pending Approvals</CardTitle>
      <div className="p-2 bg-amber-100 rounded-lg">
        <Clock className="w-4 h-4 text-amber-600" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Timesheets</span>
            </div>
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
              {stats.pendingApprovals.timesheets}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Leave Requests</span>
            </div>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
              {stats.pendingApprovals.leaves}
            </Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Regularizations</span>
            </div>
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
              {stats.pendingApprovals.regularizations}
            </Badge>
          </div>
        </div>
        <Button 
          size="sm" 
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm transition-colors"
          onClick={() => navigateTo('timesheet/approval')}
        >
          Review Now
        </Button>
      </div>
    </CardContent>
  </Card>

  {/* Active Projects Card */}
  <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-sm font-semibold text-emerald-800">Active Projects</CardTitle>
      <div className="p-2 bg-emerald-100 rounded-lg">
        <FolderKanban className="w-4 h-4 text-emerald-600" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-900">{stats.projects.length}</p>
          <p className="text-sm text-emerald-600 font-medium">projects managed</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-emerald-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-lg font-semibold text-emerald-600">
                {stats.projects.filter(p => p.health === 'green').length}
              </p>
            </div>
            <p className="text-xs text-emerald-700 font-medium">On Track</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm border border-amber-100">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <p className="text-lg font-semibold text-amber-600">
                {stats.projects.filter(p => p.health === 'yellow').length}
              </p>
            </div>
            <p className="text-xs text-amber-700 font-medium">At Risk</p>
          </div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-red-100">
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <p className="text-sm font-semibold text-red-600">
              {stats.projects.filter(p => p.health === 'red').length}
            </p>
            <span className="text-xs text-red-600">Delayed</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Team Utilization Card */}
  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 hover:shadow-lg transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <CardTitle className="text-sm font-semibold text-purple-800">Team Utilization</CardTitle>
      <div className="p-2 bg-purple-100 rounded-lg">
        <TrendingUp className="w-4 h-4 text-purple-600" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-900">{stats.teamUtilization.percentage}%</p>
          <p className="text-sm text-purple-600 font-medium">avg. this week</p>
        </div>
        <div className="space-y-2">
          <Progress 
            value={stats.teamUtilization.percentage} 
            className="h-3 bg-purple-100 [&>div]:bg-purple-600"
          />
          <div className="flex justify-between text-xs">
            <span className="text-purple-600 font-medium">Utilization</span>
            <span className="text-purple-600 font-medium">{stats.teamUtilization.percentage}%</span>
          </div>
        </div>
        <div className="p-3 bg-white rounded-lg border border-purple-100 text-center">
          <p className="text-sm font-semibold text-purple-900">
            {stats.teamUtilization.hoursLogged} / {stats.teamUtilization.totalHours}
          </p>
          <p className="text-xs text-purple-600">hours logged</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Project Status Overview */}
  <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold text-gray-800">Project Status</CardTitle>
      <CardDescription className="text-gray-500">Track progress of all managed projects</CardDescription>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-4">
        {stats.projects.map(project => (
          <div 
            key={project.id} 
            className="group cursor-pointer p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200"
            onClick={() => handleProjectClick(project.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  project.health === 'green' ? 'bg-emerald-500' : 
                  project.health === 'yellow' ? 'bg-amber-500' : 
                  'bg-red-500'
                }`} />
                <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </p>
              </div>
              <span className={`text-sm font-semibold ${
                project.completion >= 70 ? 'text-emerald-600' :
                project.completion >= 40 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {project.completion}%
              </span>
            </div>
            <div className="space-y-2">
              <Progress 
                value={project.completion} 
                className={`h-2 ${
                  project.health === 'green' ? '[&>div]:bg-emerald-500' : 
                  project.health === 'yellow' ? '[&>div]:bg-amber-500' : 
                  '[&>div]:bg-red-500'
                }`}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span className="font-medium">{project.completion}% complete</span>
              </div>
            </div>
          </div>
        ))}
        <Button 
          variant="ghost" 
          className="w-full border border-dashed border-gray-300 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
          onClick={() => navigateTo('projects')}
        >
          View All Projects
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </CardContent>
  </Card>

 
      {/* Action Required */}
      <Card>
        <CardHeader>
          <CardTitle>Action Required</CardTitle>
          <CardDescription>Items requiring your immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.pendingApprovals.timesheets > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="flex-1">
                  {stats.pendingApprovals.timesheets} timesheets pending approval - Due by EOD
                </p>
                <Button size="sm" onClick={() => navigateTo('timesheet/approval')}>Review</Button>
              </div>
            )}
            
            {stats.pendingApprovals.leaves > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="flex-1">
                  {stats.pendingApprovals.leaves} leave requests awaiting approval
                </p>
                <Button size="sm" variant="outline" onClick={() => navigateTo('attendance/team')}>Review</Button>
              </div>
            )}

            {stats.pendingApprovals.regularizations > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <p className="flex-1">
                  {stats.pendingApprovals.regularizations} attendance regularizations pending review
                </p>
                <Button size="sm" variant="outline" onClick={() => navigateTo('attendance/team')}>Review</Button>
              </div>
            )}

            {/* Show delayed projects */}
            {stats.projects.filter(p => p.health === 'red').length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <div className="flex-1">
                  <p className="cursor-pointer hover:text-blue-600 transition-colors" 
                     onClick={() => handleDelayedProjectClick(stats.projects.find(p => p.health === 'red')?.name || '')}>
                    Project "{stats.projects.find(p => p.health === 'red')?.name}" is behind schedule
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleProjectClick(stats.projects.find(p => p.health === 'red')?.id || '')}
                >
                  View
                </Button>
              </div>
            )}

            {/* Show if no actions required */}
            {stats.pendingApprovals.timesheets === 0 && 
             stats.pendingApprovals.leaves === 0 && 
             stats.pendingApprovals.regularizations === 0 &&
             stats.projects.filter(p => p.health === 'red').length === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                <AlertCircle className="w-4 h-4 text-green-600" />
                <p className="flex-1">All caught up! No pending actions required.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
</div>

 

       <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold text-gray-800">Team Activity</CardTitle>
      <CardDescription className="text-gray-500">Recent updates from your team</CardDescription>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        {stats.teamActivity.map((activity, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 text-sm font-semibold shrink-0 group-hover:scale-105 transition-transform">
              {activity.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 font-medium leading-tight">{activity.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-600">{activity.name}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        ))}
        {stats.teamActivity.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs mt-1">Team updates will appear here</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
    </div>
  );
}