import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { employeeApi, Employee as ApiEmployee } from '../../services/api';
import { toast } from 'sonner';

interface EmployeeProfileProps {
  user: User;
}
  const projects = [
    { id: '1', name: 'E-commerce Platform', role: 'Senior Developer', status: 'active' },
    { id: '2', name: 'Mobile App Redesign', role: 'Developer', status: 'active' },
    { id: '3', name: 'API Integration', role: 'Lead Developer', status: 'completed' },
  ];
    const attendanceStats = {
    presentDays: 20,
    absentDays: 1,
    leaveDays: 2,
    totalHours: 168,
    avgHours: 8.4,
  };
export function EmployeeProfile({ user }: EmployeeProfileProps) {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<ApiEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const employeeData = await employeeApi.get(parseInt(employeeId!));
      setEmployee(employeeData);
    } catch (error: any) {
      console.error('Error fetching employee:', error);
      if (error.status === 404) {
        toast.error('Employee not found');
      } else {
        toast.error('Failed to load employee data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Check if user has permission to edit
  const canEditEmployee = user.role === 'admin' || user.role === 'hr';

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/employees')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold">Employee Not Found</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <p>The employee you're looking for doesn't exist or you don't have permission to view this profile.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/employees')}
              >
                Back to Employee Directory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/employees')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Profile</h1>
          <p className="text-gray-500">View detailed employee information</p>
        </div>
      </div>

      {/* Employee Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback className="text-2xl">
                {getInitials(employee.name || 'Unknown')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{employee.name || 'Unknown Name'}</h2>
                <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                  {employee.is_active ? 'active' : 'inactive'}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">
                {employee.position || 'No position specified'} • {employee.department || 'No department'}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{employee.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone || 'No phone number'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{employee.location || 'No location'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{employee.employee_code || 'No employee ID'}</span>
                </div>
              </div>
            </div>
            {canEditEmployee && (
              <Button onClick={() => navigate(`/employees/${employeeId}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Employment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
                <CardDescription>Work-related information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Employee ID</span>
                  <span className="font-semibold">{employee.employee_code || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Position</span>
                  <span>{employee.position || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Department</span>
                  <span>{employee.department || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Role</span>
                  <Badge variant="outline" className="capitalize">
                    {employee.role || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Manager</span>
                  <span>{employee.manager || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Joining Date</span>
                  <span>{formatDate(employee.date_of_join || '')}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Employment Type</span>
                  <span>{employee.employment_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-500 font-medium">Shift</span>
                  <span>{employee.shift || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Contact and personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">Email Address</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className={!employee.email ? 'text-gray-400' : ''}>
                        {employee.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className={!employee.phone ? 'text-gray-400' : ''}>
                        {employee.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">Location</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <p className={!employee.location ? 'text-gray-400' : ''}>
                        {employee.location || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">Date of Birth</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className={!employee.date_of_birth ? 'text-gray-400' : ''}>
                        {formatDate(employee.date_of_birth || '')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2 font-medium">Additional Information</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Login</span>
                      <span>{employee.last_login_at ? formatDate(employee.last_login_at) : 'Never'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Created</span>
                      <span>{employee.created_at ? formatDate(employee.created_at) : 'N/A'}</span>
                    </div>
                  </div>
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
      </Tabs>
    </div>
  );
}