import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Edit, Plus, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '../../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { employeeApi, Employee as ApiEmployee, projectApi, Project, timesheetApi, Timesheet, attendanceApi, TeamAttendanceRecord } from '../../services/api';
import { toast } from 'sonner';

interface EmployeeProfileProps {
  user: User;
}

interface ProjectWithHours extends Project {
  total_hours?: number;
  role?: string;
}

interface WeeklyTimesheet {
  id?: number;
  week_start_date: string;
  total_hours: number;
  status: string;
  entries: any[];
}

interface AttendanceRecord {
  id?: number;
  work_date: string;
  status: string;
  check_in_at?: string;
  check_out_at?: string;
  hours?: number;
}

export function EmployeeProfile({ user }: EmployeeProfileProps) {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<ApiEmployee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithHours[]>([]);
  const [timesheets, setTimesheets] = useState<WeeklyTimesheet[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);
  const [attendanceDays, setAttendanceDays] = useState<number>(7);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId, attendanceDays]);

  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      const employeeData = await employeeApi.get(parseInt(employeeId!));
      setEmployee(employeeData);
      
      // Fetch all related data
      await Promise.all([
        fetchEmployeeProjects(),
        fetchEmployeeTimesheets(),
        fetchEmployeeAttendance()
      ]);
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

  const fetchEmployeeProjects = async () => {
    try {
      const employeeProjects = await projectApi.getEmployeeProjects(parseInt(employeeId!));
      
      const projectsWithDetails = employeeProjects.map(project => ({
        ...project,
        role: project.members?.find(member => member.user_id === parseInt(employeeId!))?.role_label || 'Team Member',
        total_hours: project.members?.find(member => member.user_id === parseInt(employeeId!))?.total_hours || 0
      }));
      
      setProjects(projectsWithDetails);
    } catch (error) {
      console.error('Error fetching employee projects:', error);
      toast.error('Failed to load project data');
    }
  };

// In EmployeeProfile.tsx - Update the timesheets mapping
const fetchEmployeeTimesheets = async () => {
  try {
    const timesheetsData = await timesheetApi.getEmployeeTimesheets(parseInt(employeeId!));
    
    // Safely calculate total hours and ensure it's a number
    const weeklyData: WeeklyTimesheet[] = timesheetsData.map(timesheet => {
      const totalHours = Array.isArray(timesheet.entries) 
        ? timesheet.entries.reduce((sum: number, entry: any) => {
            const hours = parseFloat(entry.hours) || 0;
            return sum + hours;
          }, 0)
        : timesheet.total_hours || 0; // Use backend total_hours if available

      return {
        id: timesheet.id,
        week_start_date: timesheet.week_start_date,
        total_hours: totalHours,
        status: timesheet.status || 'draft',
        entries: Array.isArray(timesheet.entries) ? timesheet.entries : []
      };
    });
    
    setTimesheets(weeklyData);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    toast.error('Failed to load timesheet data');
  }
};
  const fetchEmployeeAttendance = async () => {
    try {
      // Calculate date range for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - (attendanceDays - 1));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const attendance = await attendanceApi.getEmployeeAttendance(
        parseInt(employeeId!), 
        startDateStr, 
        endDateStr
      );
      
      // Transform team attendance records to simple attendance records
      const employeeAttendance: AttendanceRecord[] = attendance.map(record => ({
        id: record.attendance_id ? parseInt(record.attendance_id) : undefined,
        work_date: record.work_date,
        status: record.status,
        check_in_at: record.check_in_at,
        check_out_at: record.check_out_at,
        hours: record.check_in_at && record.check_out_at ? 
          (new Date(record.check_out_at).getTime() - new Date(record.check_in_at).getTime()) / (1000 * 60 * 60) : 0
      }));
      
      setAttendanceData(employeeAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance data');
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

  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return '--';
    try {
      return new Date(dateTimeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--';
    }
  };

  const formatWeekRange = (weekStart: string) => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const toggleWeekExpansion = (weekStart: string) => {
    setExpandedWeek(expandedWeek === weekStart ? null : weekStart);
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/projects/${projectId}`);
  };

  const handleAttendanceDaysChange = (days: number) => {
    setAttendanceDays(days);
  };

  // Safely format hours with fallback
  const formatHours = (hours: any): string => {
    if (hours === null || hours === undefined) return '0.0';
    const numHours = typeof hours === 'number' ? hours : parseFloat(hours);
    return isNaN(numHours) ? '0.0' : numHours.toFixed(1);
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

      {/* Tabs Section with Real Data */}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Attendance History</CardTitle>
                  <CardDescription>Recent attendance records for {employee.name}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={attendanceDays === 7 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleAttendanceDaysChange(7)}
                  >
                    Last 7 Days
                  </Button>
                  <Button 
                    variant={attendanceDays === 30 ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleAttendanceDaysChange(30)}
                  >
                    Last 30 Days
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceData.length > 0 ? (
                  attendanceData.map((record) => (
                    <div key={record.work_date} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{formatDate(record.work_date)}</p>
                            <p className="text-sm text-gray-500">
                              {record.check_in_at ? `Check-in: ${formatTime(record.check_in_at)}` : 'No check-in'}
                              {record.check_out_at ? ` | Check-out: ${formatTime(record.check_out_at)}` : ''}
                            </p>
                          </div>
                          <Badge variant={
                            record.status === 'present' ? 'default' : 
                            record.status === 'absent' ? 'destructive' : 'secondary'
                          }>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      {record.hours && record.hours > 0 && (
                        <div className="text-right">
                          <p className="font-semibold">{formatHours(record.hours)}h</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No attendance records found for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Timesheet History</CardTitle>
              <CardDescription>Weekly timesheet submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timesheets.slice(0, 4).map((timesheet) => (
                  <div key={timesheet.week_start_date} className="border rounded-lg">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleWeekExpansion(timesheet.week_start_date)}
                    >
                      <div>
                        <p className="font-medium">Week of {formatWeekRange(timesheet.week_start_date)}</p>
                        <p className="text-sm text-gray-500">{formatHours(timesheet.total_hours)} total hours</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          timesheet.status === 'approved' ? 'default' : 
                          timesheet.status === 'submitted' ? 'secondary' : 'outline'
                        }>
                          {timesheet.status}
                        </Badge>
                        <div className="text-gray-400">
                          {expandedWeek === timesheet.week_start_date ? (
                            <Minus className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedWeek === timesheet.week_start_date && (
                      <div className="p-4 border-t bg-gray-50">
                        <div className="space-y-3">
                          {timesheet.entries.length > 0 ? (
                            <>
                              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
                                <div className="col-span-1">No</div>
                                <div className="col-span-3">Date</div>
                                <div className="col-span-4">Project</div>
                                <div className="col-span-2">Task</div>
                                <div className="col-span-2">Hours</div>
                              </div>
                              {timesheet.entries.map((entry, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 text-sm items-center py-2">
                                  <div className="col-span-1">{index + 1}</div>
                                  <div className="col-span-3">{formatDate(entry.work_date)}</div>
                                  <div className="col-span-4">{entry.project_name || 'N/A'}</div>
                                  <div className="col-span-2">{entry.task_title || 'N/A'}</div>
                                  <div className="col-span-2 font-semibold">{formatHours(entry.hours)}h</div>
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <p>No timesheet entries for this week</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {timesheets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No timesheet records found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Projects</CardTitle>
              <CardDescription>Projects where {employee.name} is working</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map(project => (
                  <div 
                    key={project.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-gray-500">
                            {project.role} • {project.total_hours ? `${formatHours(project.total_hours)} hours` : 'No hours logged'}
                          </p>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      <div className="text-gray-400">→</div>
                    </div>
                  </div>
                ))}
                
                {projects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No projects assigned</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}