import { useState, useEffect } from 'react';
import { Search, Calendar, AlertCircle, Ban, Clock, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { taskApi, Task as ApiTask, projectApi, Project, timesheetApi, TimesheetEntry } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface MyTasksProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  project_id?: number;
  status: 'to-do' | 'in-progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedBy: string;
  createdAt: string;
}

interface TimeLog {
  id: string;
  date: string;
  hours: number;
  minutes: number;
  description: string;
  loggedBy: string;
  task_id?: string;
  project_id?: number;
}

export function MyTasks({ user, navigateTo }: MyTasksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewType, setViewType] = useState<'current' | 'due-date'>('current');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
const [newTimeLog, setNewTimeLog] = useState<Omit<TimeLog, 'id' | 'loggedBy'>>({
  date: new Date().toISOString().split('T')[0], // Ensure YYYY-MM-DD format
  hours: 0,
  minutes: 0,
  description: ''
});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const useApi = apiConfig.hasBaseUrl();
const [localTaskStatus, setLocalTaskStatus] = useState<Task['status'] | null>(null);

  const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const capitalizeWords = (str: string) => {
  return str.split(' ').map(word => capitalizeFirstLetter(word)).join(' ');
};
  // Fetch tasks and projects from API
  useEffect(() => {
    if (useApi) {
      fetchTasks();
      fetchProjects();
    }
  }, [useApi]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskApi.getMyTasks();
      setApiTasks(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load tasks: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectApi.list();
      setProjects(data);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to load projects:', error.message);
      }
    }
  };

  // Fetch time logs for selected task
// Updated fetchTimeLogsForTask using the new API
const fetchTimeLogsForTask = async (taskId: string) => {
  if (!useApi) {
    setTimeLogs([]);
    return;
  }

  try {
    console.log('Fetching time logs for task:', taskId);
    
    // Use the new API endpoint to get time logs by task
    const timeLogsData = await timesheetApi.getTimeLogsByTask(parseInt(taskId));
    
    console.log('Time logs data from API:', timeLogsData);

    // Convert timesheet entries to TimeLog format
    const logs: TimeLog[] = timeLogsData.map((entry: TimesheetEntry) => {
      const totalHours = entry.hours;
      const hours = Math.floor(totalHours);
      const minutes = Math.round((totalHours - hours) * 60);
      
      return {
        id: entry.id?.toString() || `temp-${Date.now()}`,
        date: entry.work_date || entry.workDate || '',
        hours,
        minutes,
        description: entry.note || 'No description',
        loggedBy: user.name,
        task_id: taskId,
        project_id: entry.project_id || entry.projectId
      };
    });

    console.log(`Total time logs found for task ${taskId}:`, logs.length);
    setTimeLogs(logs);
    
  } catch (error) {
    console.error('Failed to fetch time logs:', error);
    // Fallback to checking multiple weeks if new API fails
    await fetchTimeLogsFallback(taskId);
  }
};

// Fallback method that checks multiple weeks
const fetchTimeLogsFallback = async (taskId: string) => {
  try {
    const today = new Date();
    const weeksToCheck = 12;
    const allLogs: TimeLog[] = [];
    
    for (let i = 0; i < weeksToCheck; i++) {
      try {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - (i * 7));
        const dayOfWeek = checkDate.getDay();
        const diff = checkDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStartDate = new Date(checkDate.setDate(diff));
        const weekStartDateStr = weekStartDate.toISOString().split('T')[0];

        const timesheet = await timesheetApi.getWeekly(weekStartDateStr);
        
        if (timesheet && timesheet.entries) {
          const taskEntries = timesheet.entries.filter((entry: TimesheetEntry) => {
            const entryTaskId = entry.task_id || entry.taskId;
            return entryTaskId === parseInt(taskId);
          });

          const logs: TimeLog[] = taskEntries.map((entry: TimesheetEntry) => {
            const totalHours = entry.hours;
            const hours = Math.floor(totalHours);
            const minutes = Math.round((totalHours - hours) * 60);
            
            return {
              id: entry.id?.toString() || `temp-${Date.now()}`,
              date: entry.work_date || entry.workDate || '',
              hours,
              minutes,
              description: entry.note || 'No description',
              loggedBy: user.name,
              task_id: taskId,
              project_id: entry.project_id || entry.projectId
            };
          });

          allLogs.push(...logs);
        }
      } catch (error) {
        continue;
      }
    }

    allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTimeLogs(allLogs);
    
  } catch (error) {
    console.error('Fallback method also failed:', error);
    setTimeLogs([]);
  }
};

  // Map API task to local Task format
const mapApiTaskToLocal = (apiTask: ApiTask): Task => {
  const statusMap: Record<string, Task['status']> = {
    'todo': 'to-do',
    'to_do': 'to-do',
    'to-do': 'to-do',
    'in_progress': 'in-progress',
    'in-progress': 'in-progress',
    'in progress': 'in-progress',
    'blocked': 'blocked',
    'done': 'done',
    'completed': 'done',
  };

  return {
    id: apiTask.id.toString(),
    title: capitalizeWords(apiTask.title),
    description: apiTask.description ? capitalizeWords(apiTask.description) : '',
    project: apiTask.project_name || 'Unknown Project',
    project_id: apiTask.project_id,
    status: statusMap[apiTask.status.toLowerCase()] || 'to-do',
    priority: apiTask.priority as Task['priority'],
    dueDate: apiTask.due_date || '',
    assignedBy: apiTask.assignee_name || 'Manager',
    createdAt: apiTask.created_at || new Date().toISOString(),
  };
};
// Update the handleTaskSelect function
const handleTaskSelect = async (task: Task) => {
  setSelectedTask(task);
  setLocalTaskStatus(task.status); // Initialize local status
  setShowTaskDialog(true);
  
  // Fetch time logs immediately when task is selected
  await fetchTimeLogsForTask(task.id);
  
  // Reset new time log form
  setNewTimeLog({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    description: ''
  });
};

const handleStatusChange = (value: Task['status']) => {
  setLocalTaskStatus(value);
};
const handleSaveTask = async () => {
  if (!selectedTask || !localTaskStatus) return;

  try {
    await handleUpdateStatus(selectedTask.id, localTaskStatus);
    setShowTaskDialog(false);
  } catch (error) {
    // Error handling is already in handleUpdateStatus
  }
};

// Add this function to check if there are unsaved changes
const hasUnsavedChanges = () => {
  return selectedTask && localTaskStatus !== null && localTaskStatus !== selectedTask.status;
};

  // Use API tasks only (removed mock data)
const tasks = apiTasks.map(mapApiTaskToLocal);

  // Get unique project names from tasks
  const projectNames = [...new Set(tasks.map(task => task.project))];

  // Load time logs when task is selected
  useEffect(() => {
    if (selectedTask && useApi) {
      fetchTimeLogsForTask(selectedTask.id);
      setNewTimeLog({
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        minutes: 0,
        description: ''
      });
    } else if (selectedTask) {
      // Mock data only when API is not available
      setTimeLogs([]);
    }
  }, [selectedTask, useApi]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || task.project === filterProject;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesProject && matchesPriority;
  });

  // Group tasks by due date for due-date view
  const tasksByDueDate = filteredTasks.reduce((acc, task) => {
    const dueDate = task.dueDate;
    if (!acc[dueDate]) {
      acc[dueDate] = [];
    }
    acc[dueDate].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort dates chronologically
  const sortedDueDates = Object.keys(tasksByDueDate).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  const getTasksByTab = (tab: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    switch (tab) {
      case 'today':
        return filteredTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate.getTime() === today.getTime() && task.status !== 'done';
        });
      case 'this-week':
        return filteredTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate >= today && dueDate <= weekFromNow && task.status !== 'done';
        });
      case 'overdue':
        return filteredTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate < today && task.status !== 'done';
        });
      case 'completed':
        return filteredTasks.filter(task => task.status === 'done');
      default:
        return filteredTasks;
    }
  };

const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
  if (!useApi) {
    toast.success('Task status updated');
    return;
  }

  setIsUpdatingStatus(true);
  try {
    // Map frontend status to backend status - FIXED MAPPING
    const backendStatusMap: Record<Task['status'], string> = {
      'to-do': 'todo',
      'in-progress': 'in_progress',
      'blocked': 'blocked',
      'done': 'done'
    };

    const backendStatus = backendStatusMap[newStatus];
    
    // Get the current task to preserve all fields
    const currentTask = apiTasks.find(task => task.id.toString() === taskId);
    if (!currentTask) {
      throw new Error('Task not found');
    }

    console.log('Updating task status:', {
      taskId,
      frontendStatus: newStatus,
      backendStatus,
      currentTask
    });

    // Update only the status field, preserve all other fields
    await taskApi.update(parseInt(taskId), {
      title: currentTask.title,
      description: currentTask.description,
      priority: currentTask.priority,
      status: backendStatus,
      assigned_to: currentTask.assigned_to || currentTask.assignee_id,
      due_date: currentTask.due_date
    });

    // Refresh tasks to get updated data
    await fetchTasks();
    
    // Update selected task if it's the one being updated
    if (selectedTask && selectedTask.id === taskId) {
      const updatedTask = { ...selectedTask, status: newStatus };
      setSelectedTask(updatedTask);
      
      // Also update in the apiTasks array
      setApiTasks(prev => prev.map(task => 
        task.id.toString() === taskId 
          ? { ...task, status: backendStatus }
          : task
      ));
    }

    toast.success('Task status updated successfully');
  } catch (error) {
    console.error('Task status update error:', error);
    if (error instanceof ApiError) {
      toast.error(`Failed to update task status: ${error.message}`);
    } else {
      toast.error('Failed to update task status');
    }
  } finally {
    setIsUpdatingStatus(false);
  }
};

const handleAddTimeLog = async () => {
  if (newTimeLog.hours === 0 && newTimeLog.minutes === 0) {
    toast.error('Please enter time spent');
    return;
  }

  if (!newTimeLog.description.trim()) {
    toast.error('Please enter a description');
    return;
  }

  if (!selectedTask) {
    toast.error('No task selected');
    return;
  }

  // Calculate total hours (hours + minutes as decimal)
  const totalHours = newTimeLog.hours + (newTimeLog.minutes / 60);

  if (useApi) {
    try {
      // Format date to YYYY-MM-DD (remove time part)
      const formattedDate = new Date(newTimeLog.date).toISOString().split('T')[0];

      // Get current week start date (Monday)
      const today = new Date(formattedDate);
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStartDate = new Date(today.setDate(diff));
      const weekStartDateStr = weekStartDate.toISOString().split('T')[0];

      // Get current timesheet for the week
      let timesheet;
      try {
        timesheet = await timesheetApi.getWeekly(weekStartDateStr);
      } catch (error) {
        // If no timesheet exists, create a new one
        timesheet = {
          id: undefined,
          user_id: user.id,
          week_start_date: weekStartDateStr,
          status: 'draft',
          entries: []
        };
      }

      // Prepare timesheet entry with proper field names and formatted date
      const timesheetEntry = {
        projectId: selectedTask.project_id || 1, // Use projectId (not project_id)
        taskId: parseInt(selectedTask.id), // Use taskId (not task_id)
        workDate: formattedDate, // Use formatted date without time
        hours: totalHours,
        note: newTimeLog.description
      };

      // Update timesheet entries - ensure we're sending the complete entries array
      const updatedEntries = [
        ...(timesheet.entries || []), 
        timesheetEntry
      ];

      // Save timesheet with the complete structure
      await timesheetApi.save({
        weekStartDate: weekStartDateStr,
        entries: updatedEntries
      });

      // Refresh time logs to show the new entry
      await fetchTimeLogsForTask(selectedTask.id);

      toast.success('Time logged successfully and saved to timesheet');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to save time log: ${error.message}`);
      } else {
        console.error('Time log error:', error);
        toast.error('Failed to save time log');
      }
      return;
    }
  }

  // Reset form
  setNewTimeLog({
    date: new Date().toISOString().split('T')[0], // Ensure date is in YYYY-MM-DD format
    hours: 0,
    minutes: 0,
    description: ''
  });
};

// Update the handleDeleteTimeLog function in MyTasks.tsx
const handleDeleteTimeLog = async (logId: string) => {
  if (!selectedTask) {
    toast.error('No task selected');
    return;
  }

  // Confirm deletion
  if (!window.confirm('Are you sure you want to delete this time entry?')) {
    return;
  }

  if (useApi) {
    try {
      // Call the delete API
      await timesheetApi.deleteEntry(logId);
      
      // Refresh time logs to reflect the deletion
      await fetchTimeLogsForTask(selectedTask.id);
      
      toast.success('Time entry deleted successfully');
    } catch (error) {
      console.error('Failed to delete time entry:', error);
      if (error instanceof ApiError) {
        toast.error(`Failed to delete time entry: ${error.message}`);
      } else {
        toast.error('Failed to delete time entry');
      }
    }
  } else {
    // Mock data deletion (for when API is not available)
    setTimeLogs(prev => prev.filter(log => log.id !== logId));
    toast.success('Time log deleted');
  }
};

  const getTotalTime = () => {
    const totalMinutes = timeLogs.reduce((total, log) => {
      return total + (log.hours * 60) + log.minutes;
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes };
  };

  const stats = {
    total: tasks.filter(t => t.status !== 'done').length,
    today: tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString() && t.status !== 'done').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const getDateDisplayText = (date: string) => {
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    const taskDate = new Date(date).toDateString();
    
    if (taskDate === today) return 'Today';
    if (taskDate === tomorrow) return 'Tomorrow';
    if (taskDate === yesterday) return 'Yesterday';
    
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDateBadgeVariant = (date: string) => {
    const taskDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (taskDate < today) return 'destructive';
    if (taskDate.getTime() === today.getTime()) return 'default';
    return 'secondary';
  };

  const totalTime = getTotalTime();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Tasks - {user.name}</h1>
        <p className="text-gray-500">Welcome back! Here's what needs your attention today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                <p className="text-sm text-gray-600">Due Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Ban className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.blocked}</p>
                <p className="text-sm text-gray-600">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Task List</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewType === 'current' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('current')}
                  className={`flex items-center gap-2 ${viewType === 'current' ? 'bg-black shadow-sm' : ''}`}
                >
                  <Calendar className="w-4 h-4" />
                  Current
                </Button>
                <Button
                  variant={viewType === 'due-date' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('due-date')}
                  className={`flex items-center gap-2 ${viewType === 'due-date' ? 'bg-black shadow-sm' : ''}`}
                >
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projectNames.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {viewType === 'due-date' ? (
            <div className="space-y-4">
              {sortedDueDates.map(date => (
                <div key={date} className="border rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                    onClick={() => toggleDateExpansion(date)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={getDateBadgeVariant(date)}>
                        {getDateDisplayText(date)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {tasksByDueDate[date].length} task{tasksByDueDate[date].length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {expandedDates.has(date) ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedDates.has(date) && (
                    <div className="space-y-2 p-4">
                      {tasksByDueDate[date].map(task => (
                        <div
                          key={task.id}
                          className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowTaskDialog(true);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="truncate">{task.title}</p>
                              {isOverdue(task.dueDate) && (
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{task.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{task.project} • Assigned by {task.assignedBy}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex gap-2">
                             <Badge variant={
  task.priority === 'high' ? 'destructive' :
  task.priority === 'medium' ? 'default' :
  'secondary'
}>
  {capitalizeFirstLetter(task.priority)}
</Badge>
                              <Badge variant="outline">
  {capitalizeWords(task.status.replace('-', ' '))}
</Badge>
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${
                              isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              <span>Due {getDateDisplayText(task.dueDate)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sortedDueDates.length === 0 && (
                <p className="text-center text-gray-500 py-8">No tasks found</p>
              )}
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full rounded-2xl">
              <TabsList>
                <TabsTrigger value="all" className="w-32">All</TabsTrigger>
                <TabsTrigger value="today" className="w-32">Today</TabsTrigger>
                <TabsTrigger value="this-week" className="w-32">This Week</TabsTrigger>
                <TabsTrigger value="overdue" className="w-32">Overdue</TabsTrigger>
                <TabsTrigger value="completed" className="w-32">Completed</TabsTrigger>
              </TabsList>

              {['all', 'today', 'this-week', 'overdue', 'completed'].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
                  {getTasksByTab(tab).map(task => (
                    <div
                      key={task.id}
                      className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDialog(true);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                         
                          <p className="truncate">{capitalizeWords(task.title)}</p>
                          {isOverdue(task.dueDate) && (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                        </div>
                   <p className="text-sm text-gray-500 line-clamp-1">{capitalizeWords(task.description)}</p>
                        <p className="text-xs text-gray-400 mt-1">{task.project} • Assigned by {task.assignedBy}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex gap-2">
                      <Badge variant={
  task.priority === 'high' ? 'destructive' :
  task.priority === 'medium' ? 'default' :
  'secondary'
}>
  {capitalizeFirstLetter(task.priority)}
</Badge>
                        <Badge variant="outline">
  {capitalizeWords(task.status.replace('-', ' '))}
</Badge>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${
                          isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getTasksByTab(tab).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No tasks found</p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

<Dialog open={showTaskDialog} onOpenChange={(open) => {
  if (!open && hasUnsavedChanges()) {
    if (window.confirm('You have unsaved changes. Are you sure you want to close without saving?')) {
      setShowTaskDialog(false);
    }
  } else {
    setShowTaskDialog(open);
  }
}}>
  <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto" style={{maxWidth: '1000px', width: '80vw'}}>
    <DialogHeader className="pb-4">
     <DialogTitle className="text-xl font-bold">{selectedTask ? capitalizeWords(selectedTask.title) : ''}</DialogTitle>
      <DialogDescription>{selectedTask ? capitalizeWords(selectedTask.project) : ''}</DialogDescription>
    </DialogHeader>

    {selectedTask && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Task Details */}
        <div className="space-y-4">
          <div className="pb-2">
            <h3 className="text-base font-semibold text-gray-900">Task Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium block mb-1">Description</Label>
              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                <p className="text-gray-700">{selectedTask.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-sm font-medium block mb-1">Status</Label>
              <Select
  value={localTaskStatus || selectedTask?.status}
  onValueChange={handleStatusChange}
>
  <SelectTrigger className="w-full h-9">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="to-do">To Do</SelectItem>
    <SelectItem value="in-progress">In Progress</SelectItem>
    <SelectItem value="blocked">Blocked</SelectItem>
    <SelectItem value="done">Done</SelectItem>
  </SelectContent>
</Select>
              </div>

              <div>
                <Label className="text-sm font-medium block mb-1">Priority</Label>
                <Select value={selectedTask.priority} disabled>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium block mb-1">Due Date</Label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium block mb-1">Assigned By</Label>
                <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                  <p className="text-gray-700">{selectedTask.assignedBy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Time Logs */}
        <div className="space-y-4">
          <div className="pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Time Tracking</h3>
              <div className="text-xs text-gray-500">
                Total: <span className="font-semibold text-blue-600">{totalTime.hours}h {totalTime.minutes}m</span>
              </div>
            </div>
          </div>

          {/* Add New Time Log Form */}
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <Label className="text-sm font-medium mb-2 block">Log Time</Label>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Label className="text-xs font-medium">Date</Label>
                 <Input
  type="date"
  value={newTimeLog.date}
  onChange={(e) => {
    // Ensure we're only storing the date part (YYYY-MM-DD)
    const dateValue = e.target.value;
    setNewTimeLog(prev => ({ ...prev, date: dateValue }));
  }}
  className="h-8 text-xs mt-1"
/>
                </div>
                <div className="col-span-1">
                  <Label className="text-xs font-medium">Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    placeholder="0"
                    value={newTimeLog.hours}
                    onChange={(e) => setNewTimeLog(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs font-medium">Minutes</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={newTimeLog.minutes}
                    onChange={(e) => setNewTimeLog(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  placeholder="Work description"
                  value={newTimeLog.description}
                  onChange={(e) => setNewTimeLog(prev => ({ ...prev, description: e.target.value }))}
                  className="h-8 text-xs mt-1"
                />
              </div>
              
              <Button 
                onClick={handleAddTimeLog} 
                className="w-full h-8 text-xs"
                disabled={newTimeLog.hours === 0 && newTimeLog.minutes === 0}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Time
              </Button>
            </div>
          </div>

          {/* Time Logs List */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Time Entries</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {timeLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-medium text-gray-900 bg-white px-2 py-1 rounded border">
                          {new Date(log.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                          {log.hours}h {log.minutes}m
                        </div>
                      </div>
                    
<Button
  variant="ghost"
  size="sm"
  onClick={(e) => {
    e.stopPropagation(); // Prevent triggering the task selection
    handleDeleteTimeLog(log.id);
  }}
  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
>
  <Trash2 className="w-3 h-3" />
</Button>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed mb-1">{log.description}</p>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.loggedBy}
                    </div>
                  </div>
                </div>
              ))}
              {timeLogs.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded bg-gray-50">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No time entries</p>
                  <p className="text-xs text-gray-400 mt-1">Add time entry above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

    <DialogFooter className="border-t pt-4 mt-6">
      <div className="flex justify-end w-full items-center">
      
        <div className="flex gap-2">
         <Button 
  variant="outline" 
  onClick={() => {
    if (hasUnsavedChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        setShowTaskDialog(false);
      }
    } else {
      setShowTaskDialog(false);
    }
  }}
  className="h-8 text-sm"
>
  Cancel
</Button>
          <Button 
  onClick={handleSaveTask}
  disabled={!hasUnsavedChanges()}
  className="h-8 text-sm"
>
  Save
</Button>
        </div>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  );
}