import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Save, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
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

  const useApi = apiConfig.hasBaseUrl();

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return date;
  });

  // Fetch user-specific projects and timesheet when week changes


useEffect(() => {
  console.log('User Projects State:', userProjects);
  console.log('Project Tasks State:', projectTasks);
  console.log('Current Entries:', entries);
}, [userProjects, projectTasks, entries]);


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



  // Debug useEffect to see current state
useEffect(() => {
  console.log('Current entries:', entries);
  console.log('Current week start:', currentWeekStart.toISOString().split('T')[0]);
  console.log('Current status:', status);
}, [entries, currentWeekStart, status]);

const fetchUserProjects = async () => {
  try {
    console.log('Fetching user projects for timesheet...');
    const data = await timesheetApi.getMyProjects();
    console.log('User projects loaded:', data);
    setUserProjects(data);
    
    // Pre-fetch tasks for all projects
    data.forEach(project => {
      fetchTasksForProject(project.id.toString());
    });
  } catch (error) {
    console.error('Failed to fetch user projects:', error);
    toast.error('Failed to load your projects');
  }
};

const fetchTasksForProject = async (projectId: string) => {
  try {
    console.log(`Fetching tasks for project ${projectId}`);
    const tasks = await timesheetApi.getMyTasksForProject(parseInt(projectId));
    console.log(`Tasks for project ${projectId}:`, tasks);
    
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: tasks
    }));
  } catch (error) {
    console.error(`Failed to fetch tasks for project ${projectId}:`, error);
    // Set empty array if no tasks found
    setProjectTasks(prev => ({
      ...prev,
      [projectId]: []
    }));
  }
};


const fetchUserTasks = async () => {
  try {
    const allTasks: Task[] = [];
    
    // Get tasks for each of the user's projects
    for (const project of userProjects) {
      try {
        const projectTasks = await projectApi.getWithTasks(project.id);
        if (projectTasks.tasks) {
          // Only include tasks assigned to the current user
          const userProjectTasks = projectTasks.tasks.filter(task => {
            // Check both assignee_id and assigned_to fields for compatibility
            const assigneeId = task.assignee_id || task.assigned_to;
            return assigneeId === parseInt(user.id);
          });
          
          // Add project context to each task
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
    
    if (data && data.entries && data.entries.length > 0) {
      // Transform backend entries to our frontend format
      const transformedEntries: TimesheetEntry[] = data.entries.map(entry => {
        const projectId = entry.project_id?.toString() || entry.projectId?.toString() || '';
        const project = userProjects.find(p => p.id.toString() === projectId);
        
        return {
          id: entry.id?.toString() || Date.now().toString(),
          date: entry.work_date || entry.workDate || '',
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
      setStatus('draft');
    }
  } catch (error) {
    console.error('Error fetching timesheet:', error);
    if (error instanceof ApiError && error.status !== 404) {
      toast.error(`Failed to load timesheet: ${error.message}`);
    } else if (error instanceof ApiError && error.status === 404) {
      console.log('No timesheet found for this week (404)');
      setEntries([]);
      setStatus('draft');
    }
  } finally {
    setIsLoading(false);
  }
};

  // FIX: Ensure getWeeklyTotal always returns a valid number
  const getWeeklyTotal = (): number => {
    const total = entries.reduce((sum, entry) => {
      // Ensure entry.hours is a valid number
      const hours = Number(entry.hours) || 0;
      return sum + hours;
    }, 0);
    return Number(total) || 0; // Double ensure it's a number
  };

  const handleHoursChange = (entryId: string, hours: number) => {
    if (hours < 0 || hours > 24) return;

    setEntries(entries.map(entry => 
      entry.id === entryId
        ? { ...entry, hours: Number(hours) || 0 } // Ensure hours is always a number
        : entry
    ));
  };

const handleProjectChange = (entryId: string, projectId: string) => {
  const project = userProjects.find(p => p.id.toString() === projectId);
  
  console.log(`Project changed to ${projectId} for entry ${entryId}`);
  
  // Ensure tasks are loaded for this project
  if (projectId && !projectTasks[projectId]) {
    fetchTasksForProject(projectId);
  }
  
  setEntries(entries.map(entry => 
    entry.id === entryId
      ? { 
          ...entry, 
          projectId, 
          projectName: project?.name || '',
          taskId: 'no-task', // Reset task when project changes
          taskName: 'No specific task'
        }
      : entry
  ));
};

const getTasksForProject = (projectId: string) => {
  const tasks = projectTasks[projectId] || [];
  console.log(`Getting tasks for project ${projectId}:`, tasks);
  return tasks;
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
    const newEntry: TimesheetEntry = {
      id: Date.now().toString(),
      date,
      projectId: '',
      projectName: '',
      taskId: 'no-task',
      taskName: 'No specific task',
      hours: 0, // Initialize with 0
    };
    setEntries([...entries, newEntry]);
  };

  const deleteEntry = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
  };

  // Get tasks for a specific project that are assigned to the user
 // Get tasks for a specific project that are assigned to the user
// const getTasksForProject = (projectId: string) => {
//   return userTasks.filter(task => {
//     const taskProjectId = task.project_id || task.projectId;
//     return taskProjectId?.toString() === projectId;
//   });
// };

  // Get entries for a specific date
// Get entries for a specific date - improved to handle date formatting
const getEntriesForDate = (date: string) => {
  return entries.filter(entry => {
    // Normalize both dates to YYYY-MM-DD format for comparison
    const entryDate = new Date(entry.date).toISOString().split('T')[0];
    const targetDate = new Date(date).toISOString().split('T')[0];
    return entryDate === targetDate;
  });
};
  // Get daily total for a specific date
  const getDailyTotal = (date: string): number => {
    const total = getEntriesForDate(date).reduce((sum, entry) => {
      const hours = Number(entry.hours) || 0;
      return sum + hours;
    }, 0);
    return Number(total) || 0;
  };

  // Auto-save when entries change (with debounce)
  // useEffect(() => {
  //   if (useApi && entries.length > 0 && status === 'draft') {
  //     const timeoutId = setTimeout(() => {
  //       handleSaveDraft();
  //     }, 3000);

  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [entries, useApi, status]);

const handleSaveDraft = async () => {
  if (useApi) {
    setIsSaving(true);
    try {
      const weekStartDate = currentWeekStart.toISOString().split('T')[0];
      
      // Convert entries to API format - only include valid entries
      const apiEntries = entries
        .filter(entry => {
          // Only include entries with valid projects and positive hours
          const hasValidProject = entry.projectId && entry.projectId !== '';
          const hasValidHours = Number(entry.hours) > 0;
          return hasValidProject && hasValidHours;
        })
        .map(entry => ({
          project_id: parseInt(entry.projectId),
          task_id: entry.taskId !== 'no-task' ? parseInt(entry.taskId) : undefined,
          work_date: entry.date,
          hours: Number(entry.hours) || 0,
          note: entry.taskName !== 'No specific task' ? entry.taskName : '',
        }));

      console.log('Saving timesheet entries:', apiEntries);

      if (apiEntries.length > 0) {
        const savedTimesheet = await timesheetApi.save({
          weekStartDate: weekStartDate,
          entries: apiEntries as any,
        });
        
        console.log('Timesheet saved successfully:', savedTimesheet);
        
        // Update local state with the saved data from server
        if (savedTimesheet && savedTimesheet.entries) {
          const transformedEntries: TimesheetEntry[] = savedTimesheet.entries.map(entry => ({
            id: entry.id?.toString() || Date.now().toString(),
            date: entry.work_date || entry.workDate || '',
            projectId: entry.project_id?.toString() || entry.projectId?.toString() || '',
            projectName: entry.project_name || 'Unknown Project',
            taskId: entry.task_id?.toString() || entry.taskId?.toString() || 'no-task',
            taskName: entry.task_title || 'No specific task',
            hours: entry.hours || 0
          }));
          
          setEntries(transformedEntries);
          setStatus(savedTimesheet.status as any);
        }
        
        toast.success('Timesheet saved as draft');
      } else {
        // If no valid entries, still save an empty timesheet to create the record
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

  // FIX: Safe number formatting function
  const safeToFixed = (value: number, decimals: number = 1): string => {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Timesheet</h1>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{formatWeekRange()}</CardTitle>
              <CardDescription>Weekly timesheet entry</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousWeek} disabled={status === 'submitted'}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextWeek} disabled={status === 'submitted'}>
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
            <div className="space-y-6">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg font-medium text-sm">
                <div className="col-span-2">Date</div>
                <div className="col-span-4">Project</div>
                <div className="col-span-4">Task</div>
                <div className="col-span-1 text-center">Hours</div>
                <div className="col-span-1"></div>
              </div>

              {/* Daily Sections */}
              {weekDates.map((date, dateIndex) => {
                const dateStr = formatDateForInput(date);
                const dateEntries = getEntriesForDate(dateStr);
                const dailyTotal = getDailyTotal(dateStr);

                return (
                  <div key={dateStr} className="space-y-2">
                    {/* Date Header */}
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium">{formatDate(date)}</div>
                      <div className="text-sm text-gray-600">
                        Daily Total: <span className="font-bold">{safeToFixed(dailyTotal)} hours</span>
                      </div>
                    </div>

                    {/* Entries for this date */}
                    <div className="space-y-2">
                      {dateEntries.map(entry => (
                        <div key={entry.id} className="grid grid-cols-12 gap-4 items-center p-3 border rounded-lg hover:bg-gray-50">
                          {/* Date */}
                          <div className="col-span-2 text-sm text-gray-500">
                            {formatDate(new Date(entry.date))}
                          </div>
                          
                          {/* Project */}
                          <div className="col-span-4">
                            <Select
                              value={entry.projectId}
                              onValueChange={(value) => handleProjectChange(entry.id, value)}
                              disabled={status === 'submitted'}
                            >
                              <SelectTrigger>
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
                          </div>
                          
                          {/* Task */}
                         <div className="col-span-4">
  <Select
    value={entry.taskId}
    onValueChange={(value) => handleTaskChange(entry.id, value)}
    disabled={status === 'submitted' || !entry.projectId}
  >
    <SelectTrigger>
      <SelectValue placeholder={entry.projectId ? "Select task" : "Select project first"} />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="no-task">No specific task</SelectItem>
      {entry.projectId && getTasksForProject(entry.projectId).map(task => (
        <SelectItem key={task.id} value={task.id.toString()}>
          {task.title} {task.status !== 'todo' ? `(${task.status})` : ''}
        </SelectItem>
      ))}
      {entry.projectId && getTasksForProject(entry.projectId).length === 0 && (
        <SelectItem value="no-task" disabled>
          No tasks available for this project
        </SelectItem>
      )}
    </SelectContent>
  </Select>
</div>
                          
                          {/* Hours */}
                          <div className="col-span-1">
                            <Input
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              value={entry.hours || 0}
                              onChange={(e) => handleHoursChange(entry.id, parseFloat(e.target.value) || 0)}
                              className="text-center"
                              disabled={status === 'submitted'}
                              placeholder="0.0"
                            />
                          </div>
                          
                          {/* Delete */}
                          <div className="col-span-1 flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                              disabled={status === 'submitted'}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add Entry Button for this date */}
                      <div className="flex justify-center p-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addNewEntry(dateStr)}
                          className="gap-2"
                          disabled={status === 'submitted'}
                        >
                          <Plus className="w-4 h-4" />
                          Add Entry for {formatDate(date)}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Weekly Summary */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600">
                  Expected: 40 hours | Logged: {safeToFixed(getWeeklyTotal())} hours
                </div>
                <div className="text-lg font-bold">
                  Weekly Total: {safeToFixed(getWeeklyTotal())} hours
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t">
  <div className="text-sm text-gray-500">
    {entries.length} entries this week | Status: <span className="font-medium">{status.toUpperCase()}</span>
  </div>
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={handleSaveDraft}
      className="gap-2"
      disabled={status === 'submitted' || isSaving}
    >
      <Save className="w-4 h-4" />
      {isSaving ? 'Saving...' : 'Save Draft'}
    </Button>
    <Button
      onClick={() => setShowSubmitDialog(true)}
      className="gap-2"
      disabled={status === 'submitted' || isSaving || entries.length === 0}
    >
      <Send className="w-4 h-4" />
      Submit Week
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