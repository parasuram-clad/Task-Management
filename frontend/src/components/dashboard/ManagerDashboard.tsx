import { Users, Clock, FileText, FolderKanban, TrendingUp, AlertCircle } from 'lucide-react';
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
    <div className="p-6 space-y-6">
      <div>
        <h1>Manager Dashboard</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Team Attendance</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span>{teamStats.present}</span>
                <span className="text-sm text-gray-500">/ {teamStats.totalMembers} present</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-green-600">{teamStats.present}</p>
                  <p className="text-gray-500">Present</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-red-600">{teamStats.absent}</p>
                  <p className="text-gray-500">Absent</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="text-blue-600">{teamStats.onLeave}</p>
                  <p className="text-gray-500">On Leave</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
            <Clock className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Timesheets</span>
                <Badge variant="destructive">{pendingApprovals.timesheets}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Leave Requests</span>
                <Badge>{pendingApprovals.leaves}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Regularizations</span>
                <Badge>{pendingApprovals.regularizations}</Badge>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Projects</CardTitle>
            <FolderKanban className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>{projects.length}</p>
              <p className="text-sm text-gray-500">projects managed</p>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-green-600">{projects.filter(p => p.health === 'green').length}</p>
                  <p className="text-gray-500">On Track</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <p className="text-yellow-600">{projects.filter(p => p.health === 'yellow').length}</p>
                  <p className="text-gray-500">At Risk</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Team Utilization</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span>87%</span>
                <span className="text-sm text-gray-500">avg. this week</span>
              </div>
              <Progress value={87} />
              <p className="text-xs text-gray-500">348 / 400 hours logged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Overview</CardTitle>
            <CardDescription>Track progress of all managed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        project.health === 'green' ? 'bg-green-500' : 
                        project.health === 'yellow' ? 'bg-yellow-500' : 
                        'bg-red-500'
                      }`} />
                      <p>{project.name}</p>
                    </div>
                    <span className="text-sm text-gray-500">{project.completion}%</span>
                  </div>
                  <Progress value={project.completion} />
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

        <Card>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>Recent updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm shrink-0">
                    {activity.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Action Required</CardTitle>
          <CardDescription>Items requiring your immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="flex-1">{pendingApprovals.timesheets} timesheets pending approval - Due by EOD</p>
              <Button size="sm" onClick={() => navigateTo('timesheet-approval')}>Review</Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="flex-1">{pendingApprovals.leaves} leave requests awaiting approval</p>
              <Button size="sm" variant="outline" onClick={() => navigateTo('team-attendance')}>Review</Button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <p className="flex-1">Project "CRM System" is behind schedule</p>
              <Button size="sm" variant="outline" onClick={() => navigateTo('projects')}>View</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
