import { Users, Clock, FileText, FolderKanban, TrendingUp, AlertCircle, CheckCircle2, XCircle, Briefcase, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { User } from '../../App';

interface ManagerDashboardProps {
  user: User;
  navigateTo: (page: string) => void;
}

export function ManagerDashboard({ user, navigateTo }: ManagerDashboardProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Mock data
  const teamStats = {
    totalMembers: 12,
    present: 10,
    absent: 1,
    onLeave: 1,
  };

  const pendingApprovals = {
    timesheets: 7,
    leaves: 3,
    regularizations: 2,
  };

  const projects = [
    { id: '1', name: 'E-commerce Platform', status: 'on-track', completion: 75, health: 'green' },
    { id: '2', name: 'Mobile App Redesign', status: 'at-risk', completion: 45, health: 'yellow' },
    { id: '3', name: 'API Integration', status: 'on-track', completion: 90, health: 'green' },
    { id: '4', name: 'CRM System', status: 'delayed', completion: 30, health: 'red' },
  ];

  const teamActivity = [
    { name: 'John Doe', action: 'Submitted timesheet for Week 44', time: '2 hours ago' },
    { name: 'Jane Smith', action: 'Applied for leave (Nov 10-12)', time: '3 hours ago' },
    { name: 'Mike Wilson', action: 'Completed task: Fix login bug', time: '4 hours ago' },
    { name: 'Sarah Connor', action: 'Requested attendance regularization', time: '5 hours ago' },
  ];

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Activity className="w-4 h-4" />
            {today}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigateTo('team-attendance')}>
            <Users className="w-4 h-4 mr-2" />
            Team View
          </Button>
          <Button onClick={() => navigateTo('timesheet-approval')}>
            <FileText className="w-4 h-4 mr-2" />
            Approvals
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Team Attendance</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-primary">{teamStats.present}</span>
                <span className="text-sm text-muted-foreground">/ {teamStats.totalMembers} present</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                  <p className="text-green-600">{teamStats.present}</p>
                  <p className="text-muted-foreground">Present</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
                  <XCircle className="w-4 h-4 mx-auto mb-1 text-red-600" />
                  <p className="text-red-600">{teamStats.absent}</p>
                  <p className="text-muted-foreground">Absent</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <Briefcase className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                  <p className="text-blue-600">{teamStats.onLeave}</p>
                  <p className="text-muted-foreground">On Leave</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => navigateTo('team-attendance')}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Timesheets</span>
                <Badge variant="destructive">{pendingApprovals.timesheets}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Leave Requests</span>
                <Badge className="bg-orange-500">{pendingApprovals.leaves}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Regularizations</span>
                <Badge className="bg-blue-500">{pendingApprovals.regularizations}</Badge>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => navigateTo('timesheet-approval')}
              >
                Review Now
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
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-purple-600">{projects.length}</span>
                <span className="text-sm text-muted-foreground">projects managed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center p-2 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-green-600">{projects.filter(p => p.health === 'green').length}</p>
                  <p className="text-muted-foreground">On Track</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-yellow-600">{projects.filter(p => p.health === 'yellow').length}</p>
                  <p className="text-muted-foreground">At Risk</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Team Utilization</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-green-600">87%</span>
                <span className="text-sm text-muted-foreground">avg. this week</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">348 / 400 hours logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Overview & Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Project Status Overview</CardTitle>
                <CardDescription>Track progress of all managed projects</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="space-y-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        project.health === 'green' ? 'bg-green-500' : 
                        project.health === 'yellow' ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} />
                      <p className="text-sm">{project.name}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{project.completion}%</span>
                  </div>
                  <Progress value={project.completion} className="h-2" />
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigateTo('projects')}
              >
                View All Projects
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Team Activity</CardTitle>
                <CardDescription>Recent updates from your team</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs shrink-0 shadow-sm">
                    {activity.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <CardTitle>Action Required</CardTitle>
              <CardDescription>Items requiring your immediate attention</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="flex-1 text-sm">{pendingApprovals.timesheets} timesheets pending approval - Due by EOD</p>
              <Button size="sm" onClick={() => navigateTo('timesheet-approval')}>Review</Button>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="flex-1 text-sm">{pendingApprovals.leaves} leave requests awaiting approval</p>
              <Button size="sm" variant="outline" onClick={() => navigateTo('team-attendance')}>Review</Button>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-100">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
              <p className="flex-1 text-sm">Project "CRM System" is behind schedule</p>
              <Button size="sm" variant="outline" onClick={() => navigateTo('projects')}>View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}