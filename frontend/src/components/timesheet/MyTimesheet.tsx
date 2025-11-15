import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Save, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { toast } from 'sonner';
import { User } from '../../App';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { timesheetApi, projectApi, Project, Task } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface MyTimesheetProps {
  user: User;
}

interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  projectId: string;
  projectName: string;
  taskId: string;
  taskName: string;
  hours: number;
}

export function MyTimesheet({ user }: MyTimesheetProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  });

  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved' | 'rejected'>('draft');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectTasks, setProjectTasks] = useState<{[key: string]: Task[]}>({});
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());
const [timesheetData, setTimesheetData] = useState<any>(null);

  const useApi = apiConfig.hasBaseUrl();

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return date;
  });

  // Initialize all days as closed by default
  useEffect(() => {
    setOpenDays(new Set());
  }, [currentWeekStart]);

  // Toggle day expansion
  const toggleDay = (dateStr: string) => {
    const newOpenDays = new Set(openDays);
    if (newOpenDays.has(dateStr)) {
      newOpenDays.delete(dateStr);
    } else {
      newOpenDays.add(dateStr);
    }
    setOpenDays(newOpenDays);
  };

  // FIXED: Check if displayed week is the current actual week
  const isCurrentWeek = (): boolean => {
    const today = new Date();
    const todayWeekStart = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    todayWeekStart.setDate(diff);
    
    // Compare the displayed week start with current week start
    return currentWeekStart.toDateString() === todayWeekStart.toDateString();
  };

  // Check if the displayed week is a future week
  const isFutureWeek = (): boolean => {
    const today = new Date();
    const todayWeekStart = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    todayWeekStart.setDate(diff);
    
    return currentWeekStart > todayWeekStart;
  };

  // Check if editing should be disabled

  // Fetch user-specific projects and timesheet when week changes
  useEffect(() => {
    if (useApi) {
      fetchUserProjects();
      fetchTimesheet();
    }
  }, [currentWeekStart, useApi]);

  // Fetch user-specific tasks when projects are loaded
  useEffect(() => {
    if (useApi && userProjects.length > 0) {
      fetchUserTasks();
    }
  }, [userProjects, useApi]);


  // Add this function to check if timesheet is approved
const isTimesheetApproved = (): boolean => {
  return status === 'approved';
};

// Add this function to check if timesheet is rejected
const isTimesheetRejected = (): boolean => {
  return status === 'rejected';
};

const shouldDisableEditing = (): boolean => {
  // Disable editing for:
  // 1. Approved timesheets (cannot edit approved timesheets)
  // 2. Current week if submitted (waiting for approval)
  // 3. Previous weeks (completed weeks)
  // 4. Future weeks
  return isTimesheetApproved() || 
         (isCurrentWeek() && status === 'submitted') || 
         !isCurrentWeek() || 
         isFutureWeek();
};


const getReviewDetails = () => {
  if (isTimesheetApproved() && timesheetData?.approved_at && timesheetData?.approver_name) {
    return {
      type: 'approved',
      by: timesheetData.approver_name,
      at: timesheetData.approved_at,
      message: `Approved by ${timesheetData.approver_name} on ${new Date(timesheetData.approved_at).toLocaleDateString()}`
    };
  }
  
  if (isTimesheetRejected() && timesheetData?.rejected_at && timesheetData?.rejector_name) {
    return {
      type: 'rejected',
      by: timesheetData.rejector_name,
      at: timesheetData.rejected_at,
      message: `Rejected by ${timesheetData.rejector_name} on ${new Date(timesheetData.rejected_at).toLocaleDateString()}`
    };
  }
  
  return null;
};
 const fetchUserProjects = async () => {
  try {
    console.log('Fetching user projects for timesheet...');
    const data = await timesheetApi.getMyProjects();
    console.log('User projects loaded:', data);
    
    if (data && Array.isArray(data)) {
      setUserProjects(data);
      
      // Pre-fetch tasks for all projects
      data.forEach(project => {
        fetchTasksForProject(project.id.toString());
      });
    } else {
      console.log('No projects data received or invalid format');
      setUserProjects([]);
    }
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    toast.error('Failed to load your projects');
    setUserProjects([]);
  }
};


const fetchTasksForProject = async (projectId: string) => {
  try {
    if (!projectId) return;
    
    console.log(`Fetching tasks for project ${projectId}`);
    const tasks = await timesheetApi.getMyTasksForProject(parseInt(projectId));
    console.log(`Tasks for project ${projectId}:`, tasks);
    
    // Ensure we always set a valid array
    let validTasks = [];
    if (tasks && Array.isArray(tasks)) {
      validTasks = tasks;
    } else {
      console.warn(`Invalid tasks format for project ${projectId}, setting empty array`);
      validTasks = [];
    }
    
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: validTasks
    }));
  } catch (error) {
    console.error(`Failed to fetch tasks for project ${projectId}:`, error);
    // Set empty array on error to prevent undefined issues
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: []
    }));
  }
};

  const fetchUserTasks = async () => {
    try {
      const allTasks: Task[] = [];
      
      for (const project of userProjects) {
        try {
          const projectTasks = await projectApi.getWithTasks(project.id);
          if (projectTasks.tasks) {
            const userProjectTasks = projectTasks.tasks.filter(task => {
              const assigneeId = task.assignee_id || task.assigned_to;
              return assigneeId === parseInt(user.id);
            });
            
            allTasks.push(...userProjectTasks.map(task => ({
              ...task,
              project_name: project.name,
              project_id: project.id
            })));
          }
        } catch (error) {
          console.error(`Failed to fetch tasks for project ${project.id}:`, error);
        }
      }
      
      console.log('Fetched user tasks:', allTasks);
      setUserTasks(allTasks);
    } catch (error) {
      console.error('Failed to fetch user tasks:', error);
      toast.error('Failed to load your tasks');
    }
  };

const fetchTimesheet = async () => {
  setIsLoading(true);
  try {
    const weekStartDate = currentWeekStart.toISOString().split('T')[0];
    console.log('Fetching timesheet for week:', weekStartDate);
    
    const data = await timesheetApi.getWeekly(weekStartDate);
    console.log('Timesheet API response:', data);
    
    if (data) {
      setTimesheetData(data);
      
      if (data.entries && data.entries.length > 0) {
        const transformedEntries: TimesheetEntry[] = data.entries.map(entry => {
          const projectId = entry.project_id?.toString() || entry.projectId?.toString() || '';
          const project = userProjects.find(p => p.id.toString() === projectId);
          
          const workDate = entry.work_date || entry.workDate || '';
          const formattedDate = workDate ? new Date(workDate).toISOString().split('T')[0] : '';
          
          return {
            id: entry.id?.toString() || Date.now().toString(),
            date: formattedDate,
            projectId: projectId,
            projectName: project?.name || entry.project_name || 'Unknown Project',
            taskId: entry.task_id?.toString() || entry.taskId?.toString() || 'no-task',
            taskName: entry.task_title || 'No specific task',
            hours: entry.hours || 0
          };
        });
        
        console.log('Transformed entries:', transformedEntries);
        setEntries(transformedEntries);
        setStatus(data.status as any);
      } else {
        console.log('No timesheet entries found, setting empty array');
        setEntries([]);
        setStatus(data.status as any);
      }
    } else {
      // Handle case where data is null/undefined
      console.log('No timesheet data received, setting defaults');
      setEntries([]);
      setStatus('draft');
      setTimesheetData(null);
    }
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    if (error instanceof ApiError && error.status !== 404) {
      toast.error(`Failed to load timesheet: ${error.message}`);
    } else if (error instanceof ApiError && error.status === 404) {
      console.log('No timesheet found for this week (404)');
      setEntries([]);
      setStatus('draft');
      setTimesheetData(null);
    } else {
      // Handle other errors
      toast.error('Failed to load timesheet');
      setEntries([]);
      setStatus('draft');
      setTimesheetData(null);
    }
  } finally {
    setIsLoading(false);
  }
};



  const getWeeklyTotal = (): number => {
    const total = entries.reduce((sum, entry) => {
      const hours = Number(entry.hours) || 0;
      return sum + hours;
    }, 0);
    return Number(total) || 0;
  };

  const handleHoursChange = (entryId: string, hours: number) => {
    if (hours < 0 || hours > 24) return;

    setEntries(entries.map(entry => 
      entry.id === entryId
        ? { ...entry, hours: Number(hours) || 0 }
        : entry
    ));
  };

  const handleProjectChange = (entryId: string, projectId: string) => {
    const project = userProjects.find(p => p.id.toString() === projectId);
    
    console.log(`Project changed to ${projectId} for entry ${entryId}`);
    
    if (projectId && !projectTasks[projectId]) {
      fetchTasksForProject(projectId);
    }
    
    setEntries(entries.map(entry => 
      entry.id === entryId
        ? { 
            ...entry, 
            projectId, 
            projectName: project?.name || '',
            taskId: 'no-task',
            taskName: 'No specific task'
          }
        : entry
    ));
  };

const getTasksForProject = (projectId: string): Task[] => {
  try {
    if (!projectId) return [];
    
    const tasks = projectTasks[projectId];
    
    // Check if tasks is a valid array
    if (tasks && Array.isArray(tasks)) {
      console.log(`Getting tasks for project ${projectId}:`, tasks.length, 'tasks');
      return tasks;
    }
    
    console.log(`No tasks found for project ${projectId} or invalid format`);
    return [];
  } catch (error) {
    console.error(`Error getting tasks for project ${projectId}:`, error);
    return [];
  }
};

  const handleTaskChange = (entryId: string, taskId: string) => {
    if (taskId === 'no-task') {
      setEntries(entries.map(entry => 
        entry.id === entryId
          ? { ...entry, taskId, taskName: 'No specific task' }
          : entry
      ));
    } else {
      const task = userTasks.find(t => t.id.toString() === taskId);
      setEntries(entries.map(entry => 
        entry.id === entryId
          ? { ...entry, taskId, taskName: task?.title || '' }
          : entry
      ));
    }
  };

  const addNewEntry = (date: string) => {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const newEntry: TimesheetEntry = {
      id: Date.now().toString(),
      date: formattedDate,
      projectId: '',
      projectName: '',
      taskId: 'no-task',
      taskName: 'No specific task',
      hours: 0,
    };
    setEntries([...entries, newEntry]);
  };

  const deleteEntry = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
  };

  const getEntriesForDate = (date: string) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const targetDate = new Date(date);
      
      return entryDate.getFullYear() === targetDate.getFullYear() &&
             entryDate.getMonth() === targetDate.getMonth() &&
             entryDate.getDate() === targetDate.getDate();
    });
  };

  const getDailyTotal = (date: string): number => {
    const total = getEntriesForDate(date).reduce((sum, entry) => {
      const hours = Number(entry.hours) || 0;
      return sum + hours;
    }, 0);
    return Number(total) || 0;
  };

  const handleSaveDraft = async () => {
    if (useApi) {
      setIsSaving(true);
      try {
        const weekStartDate = currentWeekStart.toISOString().split('T')[0];
        
        const apiEntries = entries
          .filter(entry => {
            const hasValidProject = entry.projectId && entry.projectId !== '';
            const hasValidHours = Number(entry.hours) > 0;
            const hasValidDate = entry.date && entry.date !== '';
            return hasValidProject && hasValidHours && hasValidDate;
          })
          .map(entry => {
            const workDate = new Date(entry.date).toISOString().split('T')[0];
            
            return {
              project_id: parseInt(entry.projectId),
              task_id: entry.taskId !== 'no-task' ? parseInt(entry.taskId) : undefined,
              work_date: workDate,
              hours: Number(entry.hours) || 0,
              note: entry.taskName !== 'No specific task' ? entry.taskName : '',
            };
          });

        console.log('Saving timesheet entries:', apiEntries);

        if (apiEntries.length > 0) {
          const savedTimesheet = await timesheetApi.save({
            weekStartDate: weekStartDate,
            entries: apiEntries as any,
          });
          
          console.log('Timesheet saved successfully:', savedTimesheet);
          
          if (savedTimesheet && savedTimesheet.entries) {
            const transformedEntries: TimesheetEntry[] = savedTimesheet.entries.map(entry => {
              const projectId = entry.project_id?.toString() || entry.projectId?.toString() || '';
              const project = userProjects.find(p => p.id.toString() === projectId);
              
              const workDate = entry.work_date || entry.workDate || '';
              const formattedDate = workDate ? new Date(workDate).toISOString().split('T')[0] : '';
              
              return {
                id: entry.id?.toString() || Date.now().toString(),
                date: formattedDate,
                projectId: projectId,
                projectName: project?.name || entry.project_name || 'Unknown Project',
                taskId: entry.task_id?.toString() || entry.taskId?.toString() || 'no-task',
                taskName: entry.task_title || 'No specific task',
                hours: entry.hours || 0
              };
            });
            
            setEntries(transformedEntries);
            setStatus(savedTimesheet.status as any);
          }
          
          toast.success('Timesheet saved as draft');
        } else {
          const savedTimesheet = await timesheetApi.save({
            weekStartDate: weekStartDate,
            entries: []
          });
          
          setStatus(savedTimesheet.status as any);
          toast.info('Timesheet saved as draft with no entries');
        }
      } catch (error) {
        console.error('Save error:', error);
        if (error instanceof ApiError) {
          toast.error(`Failed to save timesheet: ${error.message}`);
        } else {
          toast.error('Failed to save timesheet');
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.success('Timesheet saved as draft (Mock Mode)');
    }
  };

  const handleSubmit = async () => {
    if (useApi) {
      setIsSaving(true);
      try {
        const weekStartDate = currentWeekStart.toISOString().split('T')[0];
        
        await timesheetApi.submit({
          weekStartDate: weekStartDate,
        });
        
        setStatus('submitted');
        setShowSubmitDialog(false);
        toast.success('Timesheet submitted for approval');
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to submit timesheet: ${error.message}`);
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      setStatus('submitted');
      setShowSubmitDialog(false);
      toast.success('Timesheet submitted for approval (Mock Mode)');
    }
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const safeToFixed = (value: number, decimals: number = 1): string => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

  return (
    <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
  <div>
     <h1 className="text-3xl font-bold tracking-tight">My Timesheet</h1>
    <p className="text-gray-500">Log your hours by project and task</p>
  </div>
  <div className="flex items-center gap-4">
    {isSaving && (
      <Badge variant="secondary" className="animate-pulse">
        Saving...
      </Badge>
    )}
    <Badge variant={
      status === 'approved' ? 'default' :
      status === 'submitted' ? 'secondary' :
      status === 'rejected' ? 'destructive' :
      'outline'
    }>
      {status.toUpperCase()}
    </Badge>
  </div>
</div>

{getReviewDetails() && (
  <Card className="bg-blue-50 border-blue-200">
    <CardContent className="pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            getReviewDetails()?.type === 'approved' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">
            {getReviewDetails()?.type === 'approved' ? 'Approved' : 'Rejected'}
          </span>
          <span className="text-gray-600 text-sm">
            {getReviewDetails()?.message}
          </span>
        </div>
        {isTimesheetRejected() && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Editable - Please make corrections
          </Badge>
        )}
        {isTimesheetApproved() && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Locked - Cannot be modified
          </Badge>
        )}
      </div>
      {timesheetData?.rejection_reason && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Reason:</strong> {timesheetData.rejection_reason}
        </div>
      )}
    </CardContent>
  </Card>
)}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{formatWeekRange()}</CardTitle>
              <CardDescription>Weekly timesheet entry</CardDescription>
              {!isCurrentWeek() && (
                <Badge variant="outline" className="mt-1">
                  {isFutureWeek() ? 'Future Week' : 'Previous Week'}
                </Badge>
              )}
            </div>
          
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousWeek}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextWeek}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Weekly Summary */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600">
                  Expected: 40 hours | Logged: {safeToFixed(getWeeklyTotal())} hours
                </div>
                <div className="text-lg font-bold">
                  Weekly Total: {safeToFixed(getWeeklyTotal())} hours
                </div>
              </div>

              {/* Daily Sections as Collapsible */}
              {weekDates.map((date, dateIndex) => {
                const dateStr = formatDateForInput(date);
                const dateEntries = getEntriesForDate(dateStr);
                const dailyTotal = getDailyTotal(dateStr);
                const isOpen = openDays.has(dateStr);

                return (
                  <Collapsible
                    key={dateStr}
                    open={isOpen}
                    onOpenChange={() => toggleDay(dateStr)}
                    className="border rounded-lg overflow-hidden"
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{formatDate(date)}</div>
                          <Badge variant="secondary">
                            {dateEntries.length} {dateEntries.length === 1 ? 'entry' : 'entries'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-600">
                            Daily Total: <span className="font-bold">{safeToFixed(dailyTotal)} hours</span>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="p-4 bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Project</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Task</th>
                                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Hours</th>
                                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border-b">Actions</th>
                              </tr>
                            </thead>
                            
                            <tbody>
                              {dateEntries.map(entry => (
                                <tr key={entry.id} className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="px-4 py-3 text-sm text-gray-500">
                                    {formatDate(new Date(entry.date))}
                                  </td>
                                  
                                  <td className="px-4 py-3">
                                    <Select
                                      value={entry.projectId}
                                      onValueChange={(value) => handleProjectChange(entry.id, value)}
                                      disabled={shouldDisableEditing()}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select project" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {userProjects.map(project => (
                                          <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  
   <td className="px-4 py-3">
  <Select
    value={entry.taskId}
    onValueChange={(value) => handleTaskChange(entry.id, value)}
    disabled={shouldDisableEditing() || !entry.projectId}
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder={entry.projectId ? "Select task" : "Select project first"} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="no-task">No specific task</SelectItem>
      {entry.projectId && (() => {
        try {
          const tasks = getTasksForProject(entry.projectId);
          if (tasks && Array.isArray(tasks) && tasks.length > 0) {
            return tasks.map(task => (
              <SelectItem key={task.id} value={task.id.toString()}>
                {task.title} {task.status && task.status !== 'todo' ? `(${task.status})` : ''}
              </SelectItem>
            ));
          } else {
            return (
              <SelectItem value="no-available-tasks" disabled>
                No tasks available for this project
              </SelectItem>
            );
          }
        } catch (error) {
          console.error('Error rendering tasks for project:', error);
          return (
            <SelectItem value="error" disabled>
              Error loading tasks
            </SelectItem>
          );
        }
      })()}
    </SelectContent>
  </Select>
</td>
                                  
                                  <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                      <Input
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        value={entry.hours || 0}
                                        onChange={(e) => handleHoursChange(entry.id, parseFloat(e.target.value) || 0)}
                                        className="w-20 text-center"
                                        disabled={shouldDisableEditing()}
                                        placeholder="0.0"
                                      />
                                    </div>
                                  </td>
                                  
                                  <td className="px-4 py-3">
                                    <div className="flex justify-center">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteEntry(entry.id)}
                                        disabled={shouldDisableEditing()}
                                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              
                              {dateEntries.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-2">
                                      <Plus className="w-8 h-8 text-gray-300" />
                                      <p>No entries for this day</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="flex justify-center pt-4 mt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addNewEntry(dateStr)}
                            className="gap-2"
                            disabled={shouldDisableEditing()}
                          >
                            <Plus className="w-4 h-4" />
                            Add Entry for {formatDate(date)}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}

              {/* Action Buttons */}
             {/* Action Buttons */}
<div className="flex justify-between items-center pt-6 border-t">
  <div className="text-sm text-gray-500">
    {entries.length} entries this week | Status: <span className="font-medium">{status.toUpperCase()}</span>
    {getReviewDetails() && (
      <span className="ml-2">• {getReviewDetails()?.message}</span>
    )}
  </div>
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={handleSaveDraft}
      className="gap-2"
      disabled={shouldDisableEditing() || isSaving || isTimesheetApproved()}
    >
      <Save className="w-4 h-4" />
      {isSaving ? 'Saving...' : 'Save Draft'}
    </Button>
    <Button
  onClick={async () => {
    // First save as draft, then open submit dialog
    if (!isSaving) {
      try {
        await handleSaveDraft();
        setShowSubmitDialog(true);
      } catch (error) {
        console.error('Failed to save draft before submit:', error);
        toast.error('Failed to save draft before submission');
      }
    }
  }}
  className="gap-2"
  disabled={shouldDisableEditing() || isSaving || entries.length === 0 || isTimesheetApproved()}
>
  <Send className="w-4 h-4" />
  {isTimesheetRejected() ? 'Resubmit Week' : 'Submit Week'}
</Button>
  </div>
</div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Timesheet?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your timesheet for {formatWeekRange()}?
              Once submitted, you won't be able to make changes until it's approved or rejected.
              Total hours: {safeToFixed(getWeeklyTotal())}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}