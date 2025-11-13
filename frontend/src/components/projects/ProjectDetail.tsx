import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, TrendingUp, Plus, Edit, Trash2 ,ChevronRight} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { User } from '../../App';
import { projectApi, taskApi, employeeApi, timesheetApi, Project as ApiProject, Task, Employee, TimesheetEntry } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';
import { useNavigate, useParams } from 'react-router-dom';

interface ProjectDetailProps {
  user: User;
}

interface ProjectMember {
  id: string;
  user_id: number;
  user_name: string;
  email: string;
  role_label: string;
  utilization?: number;
}

interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_name?: string;
  due_date?: string;
}

interface WeeklyHours {
  week: string;
  hours: number;
}


// Add this interface at the top with other interfaces
interface TimesheetEntry {
  id: number;
  project_id: number;
  task_id?: number;
  work_date: string;
  hours: number;
  note?: string;
  task_title?: string;
  user_name: string;
  user_id: number;
  email: string;
  week_start_date: string;
  timesheet_status: string;
}

interface WeeklyTimesheet {
  week_start_date: string;
  total_hours: number;
  users: Array<{
    user_id: number;
    user_name: string;
    email: string;
    total_hours: number;
    entries: TimesheetEntry[];
  }>;
}

interface ProjectTimesheetsAccordionProps {
  projectId: number;
  tasks: ProjectTask[];
  teamMembers: ProjectMember[];
}

// Add this component inside your ProjectDetail component file
// Add this component inside your ProjectDetail component file
const ProjectTimesheetsAccordion: React.FC<ProjectTimesheetsAccordionProps> = ({ 
  projectId, 
  tasks, 
  teamMembers 
}) => {
  const [weeklyTimesheets, setWeeklyTimesheets] = useState<WeeklyTimesheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProjectTimesheets();
  }, [projectId]);

  useEffect(() => {
  console.log('Current weeklyTimesheets state:', weeklyTimesheets);
  console.log('Number of weeks:', weeklyTimesheets.length);
  
  if (weeklyTimesheets.length > 0) {
    weeklyTimesheets.forEach((week, index) => {
      console.log(`Week ${index}:`, {
        week_start_date: week.week_start_date,
        total_hours: week.total_hours,
        users_count: week.users.length,
        users: week.users.map(u => ({
          user_name: u.user_name,
          total_hours: u.total_hours,
          entries_count: u.entries.length
        }))
      });
    });
  }
}, [weeklyTimesheets]);

// Helper function to get date for specific day of the week
const getDateForDay = (weekStartDate: string, dayOffset: number): string => {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + dayOffset);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Helper function to group entries by task and calculate daily hours
const getGroupedEntriesByTask = (entries: TimesheetEntry[], weekStartDate: string) => {
  const groups: Record<string, {
    taskKey: string;
    taskTitle: string;
    projectName: string;
    status: string;
    dailyHours: number[];
    notes: (string | null)[];
    totalHours: number;
  }> = {};

  // Initialize daily arrays for the week (7 days)
  const initializeDailyArrays = () => Array(7).fill(0);
  const initializeNotesArrays = () => Array(7).fill(null);

  entries.forEach(entry => {
    const taskKey = entry.task_id ? `task-${entry.task_id}` : `project-${entry.project_id}`;
    
    if (!groups[taskKey]) {
      groups[taskKey] = {
        taskKey,
        taskTitle: entry.task_title || 'General Project Work',
        projectName: entry.project_name || 'Project Work',
        status: entry.timesheet_status,
        dailyHours: initializeDailyArrays(),
        notes: initializeNotesArrays(),
        totalHours: 0
      };
    }

    // Calculate which day of the week this entry belongs to
    const entryDate = new Date(entry.work_date);
    const weekStart = new Date(weekStartDate);
    const dayIndex = Math.floor((entryDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayIndex >= 0 && dayIndex < 7) {
      groups[taskKey].dailyHours[dayIndex] += entry.hours;
      if (entry.note) {
        groups[taskKey].notes[dayIndex] = entry.note;
      }
      groups[taskKey].totalHours += entry.hours;
    }
  });

  return Object.values(groups);
};

// Helper function to calculate daily totals across all tasks
const getDailyTotals = (entries: TimesheetEntry[], weekStartDate: string): number[] => {
  const dailyTotals = Array(7).fill(0);
  
  entries.forEach(entry => {
    const entryDate = new Date(entry.work_date);
    const weekStart = new Date(weekStartDate);
    const dayIndex = Math.floor((entryDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayIndex >= 0 && dayIndex < 7) {
      dailyTotals[dayIndex] += entry.hours;
    }
  });

  return dailyTotals;
};

// Update the status color function
const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};


  // CORRECTED FUNCTION - This should call the new API endpoint
 const fetchProjectTimesheets = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching project timesheets for project:', projectId);
      
      const data = await projectApi.getProjectTimesheets(projectId);
      console.log('Raw timesheet data received:', data);
      
      // Validate and transform the data if needed
      const validatedData = Array.isArray(data) ? data : [];
      console.log('Validated timesheet data:', validatedData);
      
      setWeeklyTimesheets(validatedData);
      
      if (validatedData.length === 0) {
        console.log('No timesheet data found for project');
      }
      
    } catch (error) {
      console.error('Failed to fetch project timesheets:', error);
      toast.error('Failed to load timesheet data');
      setWeeklyTimesheets([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWeek = (weekDate: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekDate)) {
      newExpanded.delete(weekDate);
    } else {
      newExpanded.add(weekDate);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleUser = (weekDate: string, userId: number) => {
    const key = `${weekDate}-${userId}`;
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedUsers(newExpanded);
  };

  const formatWeekRange = (weekStartDate: string) => {
    const start = new Date(weekStartDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    })} - ${end.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })}`;
  };

  const formatIndianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading timesheets...</span>
      </div>
    );
  }

  if (weeklyTimesheets.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No timesheet data available for this project</p>
        <p className="text-sm text-gray-400 mt-1">Timesheet entries will appear here when team members log their hours</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weeklyTimesheets.map((week) => (
        <div key={week.week_start_date} className="border rounded-lg overflow-hidden">
          {/* Week Header */}
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => toggleWeek(week.week_start_date)}
          >
            <div className="flex items-center space-x-4">
              <ChevronRight 
                className={`w-5 h-5 transition-transform ${
                  expandedWeeks.has(week.week_start_date) ? 'rotate-90' : ''
                }`} 
              />
              <div>
                <h3 className="font-semibold text-lg">
                  Week of {formatWeekRange(week.week_start_date)}
                </h3>
                <p className="text-sm text-gray-600">
                  {week.users.length} team member{week.users.length !== 1 ? 's' : ''} • {week.total_hours} total hours
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {week.total_hours}h
              </Badge>
            </div>
          </div>

          {/* Week Content */}
          {expandedWeeks.has(week.week_start_date) && (
            <div className="border-t">
              {week.users.map((user) => (
                <div key={`${week.week_start_date}-${user.user_id}`} className="border-b last:border-b-0">
                  {/* User Header */}
                  <div 
                    className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => toggleUser(week.week_start_date, user.user_id)}
                  >
                    <div className="flex items-center space-x-3">
                      <ChevronRight 
                        className={`w-4 h-4 transition-transform ${
                          expandedUsers.has(`${week.week_start_date}-${user.user_id}`) ? 'rotate-90' : ''
                        }`} 
                      />
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.user_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.user_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-sm">
                        {user.total_hours}h
                      </Badge>
                    </div>
                  </div>

                  {/* User Entries */}
{expandedUsers.has(`${week.week_start_date}-${user.user_id}`) && (
  <div className="bg-gray-50 p-4">
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-10 gap-1 px-4 py-3 bg-gray-100 border-b font-semibold text-sm text-gray-700">
        <div className="col-span-2">Project / Task</div>
        <div className="text-center">Mon<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 0)}</span></div>
        <div className="text-center">Tue<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 1)}</span></div>
        <div className="text-center">Wed<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 2)}</span></div>
        <div className="text-center">Thu<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 3)}</span></div>
        <div className="text-center">Fri<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 4)}</span></div>
        <div className="text-center">Sat<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 5)}</span></div>
        <div className="text-center">Sun<br/><span className="text-xs font-normal text-gray-500">{getDateForDay(week.week_start_date, 6)}</span></div>
        <div className="text-center">Status</div>
      </div>

      {/* Table Body - Individual entries */}
      <div className="divide-y">
        {user.entries.map((entry) => {
          const entryDate = new Date(entry.work_date);
          const weekStart = new Date(week.week_start_date);
          const dayIndex = Math.floor((entryDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={entry.id} className="grid grid-cols-10 gap-1 px-4 py-2 items-center hover:bg-gray-50">
              {/* Task/Project Column */}
              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    entry.timesheet_status === 'approved' ? 'bg-green-500' :
                    entry.timesheet_status === 'submitted' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {entry.task_title || 'General Project Work'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {entry.note || 'No description'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Daily Hours - Only show in the correct day column */}
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="text-center">
                  {index === dayIndex ? (
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-black">{entry.hours}h</span>
                    </div>
                  ) : (
                    <span className="text-black">-</span>
                  )}
                </div>
              ))}

              {/* Status Column */}
              <div className="text-center">
                <Badge 
                  variant="outline" 
                  className={`px-2 py-1 text-xs ${getStatusColor(entry.timesheet_status)}`}
                >
                  {entry.timesheet_status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Total Row */}
      <div className="grid grid-cols-10 gap-1 px-4 py-3 bg-gray-50 border-t font-medium text-sm">
        <div className="col-span-2 font-semibold">Daily Total</div>
        {getDailyTotals(user.entries, week.week_start_date).map((total, index) => (
          <div key={index} className="text-center font-bold text-gray-800">
            {total > 0 ? `${total}h` : '0'}
          </div>
        ))}
        <div className="text-center font-bold text-green-700">
          {user.total_hours}h
        </div>
      </div>

      {/* Empty State */}
      {user.entries.length === 0 && (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No timesheet entries for this week</p>
          <p className="text-sm text-gray-400 mt-1">No hours logged by {user.user_name} during this period</p>
        </div>
      )}
    </div>
  </div>
)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


export function ProjectDetail({ user }: ProjectDetailProps) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);
const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
const [isRemoving, setIsRemoving] = useState(false);

  const useApi = apiConfig.hasBaseUrl();

  const [project, setProject] = useState({
    id: projectId || 'unknown',
    name: '',
    description: '',
    client: '',
    manager: '',
    managerId: 0,
    startDate: '',
    endDate: '',
    status: 'active' as 'active' | 'on-hold' | 'completed',
    completion: 0,
    health: 'green' as 'green' | 'yellow' | 'red',
    budget: 0,
    hoursAllocated: 0,
    hoursLogged: 0,
  });

  const [editForm, setEditForm] = useState(project);
  const [teamMembers, setTeamMembers] = useState<ProjectMember[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);

  // Fetch project details and related data
  useEffect(() => {
    if (useApi && projectId) {
      fetchProjectDetails();
      fetchProjectTasks();
      fetchProjectTimesheets();
      fetchCompanyUsers();
    }
  }, [projectId, useApi]);

// Add this useEffect to update progress when tasks are loaded
useEffect(() => {
  if (tasks.length > 0 && project.id !== 'unknown') {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const newCompletion = Math.round((completedTasks / tasks.length) * 100);
    
    // Only update if completion changed significantly
    if (Math.abs(newCompletion - project.completion) > 5) {
      setProject(prev => ({
        ...prev,
        completion: newCompletion
      }));
    }
  }
}, [tasks, project.id]);
  const handleRemoveMemberClick = (member: ProjectMember) => {
  setMemberToRemove(member);
  setShowRemoveConfirm(true);
};
const calculateDaysRemaining = (endDate: string): number => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
const handleRemoveMemberConfirm = async () => {
  if (!projectId || !memberToRemove) return;
  
  setIsRemoving(true);
  try {
    await projectApi.removeMemberFromProject(parseInt(projectId), memberToRemove.id);
    
    toast.success('Team member removed successfully');
    setShowRemoveConfirm(false);
    setMemberToRemove(null);
    
    // Refresh project details
    await fetchProjectDetails();
    await fetchCompanyUsers();
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to remove team member: ${error.message}`);
    } else {
      toast.error('Failed to remove team member');
    }
  } finally {
    setIsRemoving(false);
  }
};

const handleRemoveMemberCancel = () => {
  setShowRemoveConfirm(false);
  setMemberToRemove(null);
};
const fetchProjectDetails = async () => {
  if (!projectId) return;
  
  setIsLoading(true);
  try {
    const data = await projectApi.get(parseInt(projectId));
    
    // Get real hours logged from timesheets
    const realHoursLogged = await fetchRealHoursLogged(parseInt(projectId));
    
    // Calculate completion based on actual tasks
    const tasksData = await taskApi.getProjectTasks(parseInt(projectId));
    const completedTasks = tasksData.filter(t => t.status === 'completed' || t.status === 'done').length;
    const completion = tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0;
// In fetchProjectDetails function - Update the mapping
const mappedProject = {
  id: data.id.toString(),
  name: data.name,
  description: data.description || '',
  client: data.client_name || '',
  manager: data.manager_name || 'Unassigned',
  managerId: data.manager_id,
  startDate: data.start_date.includes('T') ? data.start_date.split('T')[0] : data.start_date,
  endDate: data.end_date.includes('T') ? data.end_date.split('T')[0] : data.end_date,
  status: data.status as 'active' | 'on-hold' | 'completed',
  completion,
  health: calculateProjectHealth(data.status, completion, data.end_date),
  hoursAllocated: calculateHoursAllocated(data.start_date, data.end_date, data.members?.length || 0),
  hoursLogged: realHoursLogged,
};

    setProject(mappedProject);
    setEditForm(mappedProject);
    setTeamMembers(data.members || []);
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to load project: ${error.message}`);
    }
  } finally {
    setIsLoading(false);
  }
};

// Add function to fetch real hours from timesheets
const fetchRealHoursLogged = async (projectId: number): Promise<number> => {
  try {
    // This would need to be implemented based on your timesheet API
    // For now, return a placeholder - you'll need to implement this based on your backend
    return project.hoursLogged; // Keep existing value until you implement the real API call
  } catch (error) {
    console.error('Error fetching real hours:', error);
    return project.hoursLogged;
  }
};

// Enhanced health calculation
const calculateProjectHealth = (status: string, completion: number, endDate: string): 'green' | 'yellow' | 'red' => {
  if (status === 'completed') return 'green';
  if (status === 'on-hold') return 'yellow';
  
  const daysRemaining = calculateDaysRemaining(endDate);
  
  if (daysRemaining < 7 && completion < 90) return 'red';
  if (daysRemaining < 14 && completion < 75) return 'yellow';
  if (completion > 80) return 'green';
  if (completion > 60) return 'yellow';
  
  return 'green';
};
const calculateRealHoursLogged = async (projectId: number): Promise<number> => {
  try {
    // Get all timesheets for this project
    // This would require a new API endpoint to get timesheet entries by project
    // For now, we'll calculate from team members' timesheets
    let totalHours = 0;
    
    // If you have team members, you could sum their hours for this project
    // This is a simplified version - you might need to adjust based on your API
    if (teamMembers.length > 0) {
      // This would be implemented based on your actual timesheet API structure
      // For demonstration, returning a calculated value
      totalHours = teamMembers.length * 40; // Placeholder calculation
    }
    
    return totalHours;
  } catch (error) {
    console.error('Error calculating hours logged:', error);
    return 0;
  }
};

const calculateHoursAllocated = (startDate: string, endDate: string, teamSize: number): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const weeks = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  // Standard calculation: 40 hours per week per team member
  return weeks * teamSize * 40;
};
  const fetchProjectTasks = async () => {
    if (!projectId) return;
    
    try {
      const tasksData = await taskApi.getProjectTasks(parseInt(projectId));
      const mappedTasks: ProjectTask[] = tasksData.map(task => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_name: task.assignee_name,
        due_date: task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { 
          month: 'short', 
          day: 'numeric' 
        }) : undefined,
      }));
      setTasks(mappedTasks);
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
    }
  };

// In the main ProjectDetail component - Keep this function for summary data
const fetchProjectTimesheets = async () => {
  if (!projectId) return;
  
  try {
    // This is for the summary data (if you still want to show weekly progress bars)
    const weeks: WeeklyHours[] = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      const weekLabel = `Week ${getWeekNumber(weekStart)}`;
      
      // You can keep this for summary data if needed
      const hours = Math.floor(Math.random() * 40) + 120;
      
      weeks.push({ week: weekLabel, hours });
    }
    
    setWeeklyHours(weeks.reverse());
  } catch (error) {
    console.error('Failed to fetch timesheets:', error);
  }
};

  const fetchCompanyUsers = async () => {
    try {
      const users = await employeeApi.list();
      setCompanyUsers(users);
      
      // Filter out users who are already team members
      const available = users.filter(user => 
        !teamMembers.some(member => member.user_id === user.id)
      );
      setAvailableEmployees(available);
    } catch (error) {
      console.error('Failed to fetch company users:', error);
    }
  };

  const calculateTotalHours = (members: any[]): number => {
    // This would typically come from your timesheet API
    // For now, return a calculated value based on team size
    return members.length * 160; // Approximate hours per member
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

// In ProjectDetail.tsx - Update the handleUpdateProject function
const handleUpdateProject = async () => {
  if (useApi) {
    setIsSaving(true);
    try {
      // Prepare the data with proper formatting
      const updateData = {
        name: editForm.name,
        description: editForm.description || undefined,
        clientName: editForm.client || undefined,
        managerId: editForm.managerId,
        startDate: formatDateForBackend(editForm.startDate),
        endDate: formatDateForBackend(editForm.endDate),
        status: editForm.status,
      };
      
      console.log('Sending update data:', updateData);
      
      await projectApi.update(parseInt(projectId!), updateData);
      
      // Update local state with the formatted dates
      const updatedProject = {
        ...editForm,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
      };
      
      setProject(updatedProject);
      setShowEditDialog(false);
      toast.success('Project updated successfully');
      
      // Refresh project data
      await fetchProjectDetails();
    } catch (error) {
      console.error('Update project error:', error);
      if (error instanceof ApiError) {
        toast.error(`Failed to update project: ${error.message}`);
      } else {
        toast.error('Failed to update project. Please check the data and try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }
};

// Add this helper function to the component
const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // If it contains time part, remove it
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // Try to parse and format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return '';
  }
};

  const handleAddMember = async (userId: string, roleLabel: string) => {
    if (!projectId) return;
    
    try {
      await projectApi.addMemberToProject(parseInt(projectId), {
        userId: parseInt(userId),
        roleLabel,
      });
      
      toast.success('Team member added successfully');
      setShowAddMemberDialog(false);
      
      // Refresh project details to get updated members list
      await fetchProjectDetails();
      await fetchCompanyUsers(); // Refresh available employees
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to add team member: ${error.message}`);
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId) return;
    
    try {
      // You'll need to add this API endpoint to your backend
      // For now, this is a placeholder
      toast.success('Team member removed successfully');
      
      // Refresh project details
      await fetchProjectDetails();
      await fetchCompanyUsers();
    } catch (error) {
      toast.error('Failed to remove team member');
    }
  };

  const formatIndianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <p>Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
       <div className="flex items-center gap-3">
  <h1 className="text-3xl font-bold">{project.name}</h1>
  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
    {project.status}
  </Badge>
  <div className="relative group">
    <div className={`w-3 h-3 rounded-full ${
      project.health === 'green' ? 'bg-green-500' :
      project.health === 'yellow' ? 'bg-yellow-500' :
      'bg-red-500'
    }`} />
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
      {project.health === 'green' ? 'On Track' : 
       project.health === 'yellow' ? 'Needs Attention' : 
       'At Risk'}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
</div>
          <p className="text-gray-500">{project.client}</p>
        </div>
        {(user.role === 'admin' || user.role === 'manager') && (
          <Button onClick={() => {
            setEditForm(project);
            setShowEditDialog(true);
          }}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
        )}
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Task Progress Card */}
  <Card className="bg-white border-l-4 border-l-blue-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-150">
    <CardContent className="p-0">
      <div className="flex items-center justify-between mb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Task Progress</CardTitle>
        <span className="text-base font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md">
          {project.completion}%
        </span>
      </div>
      <Progress value={project.completion} className="h-2.5 mb-4" />
      <div className="flex justify-between text-base text-gray-500">
        <span>Total: {tasks.length}</span>
        <span>Done: {tasks.filter(t => t.status === 'completed' || t.status === 'done').length}</span>
      </div>
    </CardContent>
  </Card>

  {/* Team Size Card */}
  <Card className="bg-white border-l-4 border-l-green-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-150">
    <CardContent className="p-0">
      <div className="flex items-center justify-between">
        <div>
          <CardDescription className="text-base text-gray-600 mb-3">Team Size</CardDescription>
          <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {teamMembers.filter(m => m.role_label?.toLowerCase().includes('manager')).length} Manager(s)
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-xl">
          <Users className="w-7 h-7 text-green-600" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Hours Logged Card */}
  <Card className="bg-white border-l-4 border-l-amber-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-150">
    <CardContent className="p-0">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <CardDescription className="text-base text-gray-600">Hours Logged</CardDescription>
          <span className="text-lg font-bold text-amber-600">{project.hoursLogged}h</span>
        </div>
        <Progress 
          value={project.hoursAllocated > 0 ? (project.hoursLogged / project.hoursAllocated) * 100 : 0} 
          className="h-2.5" 
        />
        <div className="flex justify-between text-base text-gray-500">
          <span>Allocated: {project.hoursAllocated}h</span>
          <span>
            {project.hoursAllocated > 0 
              ? Math.round((project.hoursLogged / project.hoursAllocated) * 100)
              : 0
            }%
          </span>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Timeline Card */}
  <Card className="bg-white border-l-4 border-l-purple-500 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-150">
    <CardContent className="p-0">
      <div className="space-y-3">
        <CardDescription className="text-base text-gray-600 mb-3">Timeline</CardDescription>
        <div className="flex justify-between text-base">
          <div>
            <div className="font-bold text-gray-900">Start</div>
            <div className="text-gray-500 text-base">{formatIndianDate(project.startDate)}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-900">End</div>
            <div className="text-gray-500 text-base">{formatIndianDate(project.endDate)}</div>
          </div>
        </div>
        {/* Add days remaining */}
        <div className="pt-2 border-t">
          <div className="text-sm text-gray-600">
            {calculateDaysRemaining(project.endDate)} days remaining
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
  {/* Project Description */}
  <Card>
    <CardHeader className="pb-4 bg-muted">
      <CardTitle className="text-xl font-semibold ">Project Description</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-700 leading-relaxed">
        {project.description || 'No description provided for this project.'}
      </p>
    </CardContent>
  </Card>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Project Details */}
    <Card>
      <CardHeader className="pb-4 bg-muted">
        <CardTitle className="text-xl font-semibold ">Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 font-medium">Client</span>
          <span className="font-semibold">{project.client || 'Not specified'}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 font-medium">Project Manager</span>
          <span className="font-semibold">{project.manager}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 font-medium">Start Date</span>
          <span className="font-semibold">{formatIndianDate(project.startDate)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 font-medium">End Date</span>
          <span className="font-semibold">{formatIndianDate(project.endDate)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-600 font-medium">Status</span>
          <Badge variant={
            project.status === 'active' ? 'default' : 
            project.status === 'completed' ? 'secondary' : 'outline'
          }>
            {project.status}
          </Badge>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600 font-medium">Project Health</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              project.health === 'green' ? 'bg-green-500' :
              project.health === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="font-semibold capitalize">{project.health}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Recent Activity */}
    <Card>
      <CardHeader className="pb-4 bg-muted">
        <CardTitle className="text-xl font-semibold ">Recent Activity</CardTitle>
        <CardDescription>Latest updates and task progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="pb-3 border-b last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  task.status === 'completed' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {task.assignee_name || 'Unassigned'} {task.status === 'completed' ? 'completed' : 'updated'} task
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                    {task.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {task.due_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Tasks and updates will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>People assigned to this project</CardDescription>
                </div>
                {(user.role === 'admin' || user.role === 'manager') && (
                  <Button size="sm" className="gap-2" onClick={() => setShowAddMemberDialog(true)}>
                    <Plus className="w-4 h-4" />
                    Add Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitials(member.user_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>{member.user_name}</p>
                      <p className="text-sm text-gray-500">{member.role_label || 'Team Member'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm">{member.email}</p>
                    </div>
                 {(user.role === 'admin' || user.role === 'manager') && (
  <Button
    variant="ghost"
    size="sm"
    className="text-red-600 hover:text-red-700 hover:bg-red-50"
    onClick={() => handleRemoveMemberClick(member)}
    disabled={isRemoving}
  >
    <Trash2 className="w-4 h-4" />
  </Button>
)}
                  </div>
                ))}
                {teamMembers.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No team members assigned yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Tasks</CardTitle>
                  <CardDescription>Tasks assigned to this project</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => navigate('/tasks/project-tasks')}
                >
                  View All Tasks
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p>{task.title}</p>
                      <p className="text-sm text-gray-500">
                        Assigned to: {task.assignee_name || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.status}</Badge>
                      <span className="text-sm text-gray-500">{task.due_date || 'No due date'}</span>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No tasks assigned to this project</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

   
<TabsContent value="timesheets">
  <Card>
    <CardHeader>
      <CardTitle>Project Timesheets</CardTitle>
      <CardDescription>Weekly timesheet logs for this project</CardDescription>
    </CardHeader>
    <CardContent>
      <ProjectTimesheetsAccordion 
        projectId={parseInt(projectId!)} 
        tasks={tasks}
        teamMembers={teamMembers}
      />
    </CardContent>
  </Card>
</TabsContent>
      </Tabs>

      {/* Edit Project Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-client">Client</Label>
              <Input
                id="edit-client"
                value={editForm.client}
                onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

 
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="edit-start">Start Date</Label>
    <Input
      id="edit-start"
      type="date"
      value={editForm.startDate.includes('T') ? editForm.startDate.split('T')[0] : editForm.startDate}
      onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
      className="mt-1"
    />
  </div>
  <div>
    <Label htmlFor="edit-end">End Date</Label>
    <Input
      id="edit-end"
      type="date"
      value={editForm.endDate.includes('T') ? editForm.endDate.split('T')[0] : editForm.endDate}
      onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
      className="mt-1"
    />
  </div>
</div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-manager">Project Manager</Label>
                <Select
                  value={editForm.managerId.toString()}
                  onValueChange={(value) => setEditForm({ ...editForm, managerId: parseInt(value) })}
                >
                  <SelectTrigger id="edit-manager" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {companyUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value as typeof editForm.status })}
                >
                  <SelectTrigger id="edit-status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Team Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Add a new member to this project</DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const userId = formData.get('user-id') as string;
            const roleLabel = formData.get('role-label') as string;
            if (userId && roleLabel) {
              handleAddMember(userId, roleLabel);
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="user-id">Employee</Label>
              <Select name="user-id" required>
                <SelectTrigger id="user-id" className="mt-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({employee.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role-label">Role in Project</Label>
              <Input
                id="role-label"
                name="role-label"
                placeholder="e.g., Frontend Developer"
                className="mt-1"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRemoveConfirm} onOpenChange={handleRemoveMemberCancel}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Remove Team Member</DialogTitle>
      <DialogDescription>
        Are you sure you want to remove {memberToRemove?.user_name} from this project?
      </DialogDescription>
    </DialogHeader>
    
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-amber-600 text-sm">!</span>
        </div>
        <div className="text-amber-800 text-sm">
          <p className="font-medium">This action cannot be undone.</p>
          <p className="mt-1">
            {memberToRemove?.user_name} will lose access to this project and all associated tasks.
          </p>
        </div>
      </div>
    </div>

    <DialogFooter>
      <Button 
        variant="outline" 
        onClick={handleRemoveMemberCancel}
        disabled={isRemoving}
      >
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        onClick={handleRemoveMemberConfirm}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            Removing...
          </>
        ) : (
          'Remove Member'
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}