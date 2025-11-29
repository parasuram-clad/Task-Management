import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '../../App';
import { EmployeeSkillsTab } from '../skills/EmployeeSkillsTab';
import { canAccessEmployeeDetails, canAccessProjects } from '../../utils/rbac';

interface EmployeeProfileProps {
  employeeId: string;
  user: User;
  defaultTab?: string;
}

export function EmployeeProfile({ employeeId, user, defaultTab = 'overview' }: EmployeeProfileProps) {
  // Check access
  const hasAccess = canAccessEmployeeDetails(user, employeeId);
  
  if (!hasAccess) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to view this employee's profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock employee data
  const employee = {
    id: employeeId,
    name: 'John Doe',
    employeeId: 'EMP001',
    email: 'john.doe@company.com',
    phone: '+1 234 567 8901',
    role: 'Senior Developer',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    location: 'New York',
    manager: 'Sarah Johnson',
    joiningDate: 'Jan 15, 2022',
    employmentType: 'Full-time',
    shift: '9:00 AM - 6:00 PM',
    status: 'active',
    avatar: '',
  };

  const attendanceStats = {
    presentDays: 20,
    absentDays: 1,
    leaveDays: 2,
    totalHours: 168,
    avgHours: 8.4,
  };

  const projects = [
    { id: '1', name: 'E-commerce Platform', role: 'Senior Developer', status: 'active' },
    { id: '2', name: 'Mobile App Redesign', role: 'Developer', status: 'active' },
    { id: '3', name: 'API Integration', role: 'Lead Developer', status: 'completed' },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1>Employee Profile</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="text-2xl">{getInitials(employee.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2>{employee.name}</h2>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{employee.designation} • {employee.department}</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{employee.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{employee.employeeId}</span>
                </div>
              </div>
            </div>
            {(user.role === 'admin' || user.role === 'hr') && (
              <Button>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          {canAccessProjects(user) && (
            <TabsTrigger value="projects">Projects</TabsTrigger>
          )}
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee ID</span>
                  <span>{employee.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Designation</span>
                  <span>{employee.designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department</span>
                  <span>{employee.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Manager</span>
                  <span>{employee.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joining Date</span>
                  <span>{employee.joiningDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employment Type</span>
                  <span>{employee.employmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Location</span>
                  <span>{employee.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shift</span>
                  <span>{employee.shift}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p>{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p>{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Location</p>
                  <p>{employee.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary (This Month)</CardTitle>
              <CardDescription>Attendance statistics for {employee.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-green-600">{attendanceStats.presentDays}</p>
                  <p className="text-sm text-gray-600">Present Days</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-red-600">{attendanceStats.absentDays}</p>
                  <p className="text-sm text-gray-600">Absent Days</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-600">{attendanceStats.leaveDays}</p>
                  <p className="text-sm text-gray-600">Leave Days</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p>{attendanceStats.totalHours}h</p>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p>{attendanceStats.avgHours}h</p>
                  <p className="text-sm text-gray-600">Avg Hours/Day</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Timesheet History</CardTitle>
              <CardDescription>Recent timesheet submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { week: 'Week 44 (Oct 28 - Nov 3)', hours: 42, status: 'approved' },
                  { week: 'Week 43 (Oct 21 - Oct 27)', hours: 40, status: 'approved' },
                  { week: 'Week 42 (Oct 14 - Oct 20)', hours: 38, status: 'approved' },
                  { week: 'Week 41 (Oct 7 - Oct 13)', hours: 40, status: 'approved' },
                ].map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p>{entry.week}</p>
                      <p className="text-sm text-gray-500">{entry.hours} hours</p>
                    </div>
                    <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
              <CardDescription>Projects where {employee.name} is assigned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p>{project.name}</p>
                      <p className="text-sm text-gray-500">{project.role}</p>
                    </div>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <EmployeeSkillsTab
            user={user}
            employeeId={parseInt(employeeId)}
            employeeName={employee.name}
            employeeRole={employee.designation}
            department={employee.department}
            location={employee.location}
            managerName={employee.manager}
            isManager={user.role === 'manager' || user.role === 'admin'}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}