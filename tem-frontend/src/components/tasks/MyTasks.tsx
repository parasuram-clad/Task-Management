import { useState, useEffect } from 'react';
import { Search, Calendar, AlertCircle, Clock, List, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { taskApi, Task as ApiTask, TimeLog } from '../../services/api';
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
  status: 'to-do' | 'in-progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedBy: string;
  timeLogs?: TimeLog[];
}

type ViewMode = 'list' | 'calendar';

export function MyTasks({ user, navigateTo }: MyTasksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiTasks, setApiTasks] = useState<ApiTask[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTimeLog, setNewTimeLog] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    description: ''
  });
  
  const useApi = apiConfig.hasBaseUrl();

  // Fetch tasks from API
  useEffect(() => {
    if (useApi) {
      fetchTasks();
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

  // Map API task to local Task format
  const mapApiTaskToLocal = (apiTask: ApiTask): Task => {
    const statusMap: Record<string, Task['status']> = {
      'todo': 'to-do',
      'to-do': 'to-do',
      'in-progress': 'in-progress',
      'in progress': 'in-progress',
      'blocked': 'blocked',
      'done': 'done',
      'completed': 'done',
    };

    return {
      id: apiTask.id.toString(),
      title: apiTask.title,
      description: apiTask.description || '',
      project: apiTask.project_name || 'Unknown Project',
      status: statusMap[apiTask.status.toLowerCase()] || 'to-do',
      priority: apiTask.priority as Task['priority'],
      dueDate: apiTask.due_date || '',
      assignedBy: 'Manager',
      timeLogs: apiTask.time_logs || [],
    };
  };

  // Mock tasks with time logs
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Database Schema Optimization',
      description: 'Optimize database queries and schema for better performance',
      project: 'Backend Infrastructure',
      status: 'to-do',
      priority: 'high',
      dueDate: '2025-11-18',
      assignedBy: 'Tech Lead',
      timeLogs: [
        { id: '1', date: '2025-11-10', hours: 2, minutes: 30, description: 'Initial analysis' }
      ]
    },
    {
      id: '2',
      title: 'Product Catalog UI',
      description: 'Design and implement new product catalog interface',
      project: 'Frontend Development',
      status: 'done',
      priority: 'medium',
      dueDate: '2025-11-15',
      assignedBy: 'Product Manager',
      timeLogs: [
        { id: '2', date: '2025-11-12', hours: 4, minutes: 0, description: 'UI implementation' },
        { id: '3', date: '2025-11-13', hours: 2, minutes: 15, description: 'Testing and fixes' }
      ]
    },
    {
      id: '3',
      title: 'API Documentation Update',
      description: 'Update API documentation for new endpoints',
      project: 'Backend Infrastructure',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2025-11-20',
      assignedBy: 'Tech Lead',
      timeLogs: []
    },
    {
      id: '4',
      title: 'Security Audit',
      description: 'Conduct security audit for the application',
      project: 'Security',
      status: 'blocked',
      priority: 'high',
      dueDate: '2025-11-25',
      assignedBy: 'Security Team',
      timeLogs: []
    },
  ];

  // Use API tasks if available, otherwise use mock
  const tasks = useApi 
    ? apiTasks.map(mapApiTaskToLocal)
    : mockTasks;

  const projects = ['Backend Infrastructure', 'Frontend Development', 'Security', 'Mobile App'];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = filterProject === 'all' || task.project === filterProject;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesProject && matchesPriority;
  });

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

  const handleUpdateStatus = (taskId: string, newStatus: Task['status']) => {
    toast.success('Task status updated');
  };

  const handleSaveTimeLog = async () => {
    if (!selectedTask) return;

    try {
      const timeLog: TimeLog = {
        id: Date.now().toString(),
        date: newTimeLog.date,
        hours: newTimeLog.hours,
        minutes: newTimeLog.minutes,
        description: newTimeLog.description
      };

      // Update local state
      if (useApi) {
        setApiTasks(prev => prev.map(apiTask => 
          apiTask.id.toString() === selectedTask.id
            ? { 
                ...apiTask, 
                time_logs: [...(apiTask.time_logs || []), timeLog] 
              }
            : apiTask
        ));
      }

      // Update the selected task with new time log
      setSelectedTask(prev => prev ? {
        ...prev,
        timeLogs: [...(prev.timeLogs || []), timeLog]
      } : null);

      toast.success('Time logged successfully');
      setNewTimeLog({
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        minutes: 0,
        description: ''
      });
    } catch (error) {
      toast.error('Failed to log time');
    }
  };

  const getTotalTimeSpent = (task: Task) => {
    const totalMinutes = (task.timeLogs || []).reduce((total, log) => {
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

  // Calendar view functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const startDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      const prevMonthDay = new Date(year, month, -i);
      days.unshift({
        date: prevMonthDay,
        isCurrentMonth: false,
        tasks: []
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayTasks = filteredTasks.filter(task => task.dueDate === dateString);
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        tasks: dayTasks
      });
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = 42; // 6 weeks * 7 days
    while (days.length < totalCells) {
      const nextMonthDay = new Date(year, month + 1, days.length - daysInMonth - startDay + 1);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        tasks: []
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderListView = (tasks: Task[]) => (
    <div className="space-y-3">
      {tasks.map(task => (
        <TooltipProvider key={task.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskDialog(true);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{task.title}</p>
                    {isOverdue(task.dueDate) && (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{task.project}</span>
                    <span>•</span>
                    <span>Assigned by: {task.assignedBy}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-2">
                    <Badge variant={
                      task.priority === 'high' ? 'destructive' :
                      task.priority === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">{task.title}</p>
                <p className="text-sm">{task.description}</p>
                <p className="text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <p className="text-xs">Time spent: {getTotalTimeSpent(task).hours}h {getTotalTimeSpent(task).minutes}m</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );

  const renderCalendarView = () => {
    const days = getDaysInMonth(currentDate);
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{monthYear}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center font-medium text-sm border-r last:border-r-0 bg-gray-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-r border-b p-2 ${
                    !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.tasks.slice(0, 3).map(task => (
                      <TooltipProvider key={task.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                                task.status === 'done' ? 'bg-green-100 border border-green-200' :
                                task.status === 'in-progress' ? 'bg-blue-100 border border-blue-200' :
                                task.status === 'blocked' ? 'bg-red-100 border border-red-200' :
                                'bg-gray-100 border border-gray-200'
                              } hover:opacity-80`}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowTaskDialog(true);
                              }}
                            >
                              <div className="font-medium truncate">{task.title}</div>
                              <div className="flex justify-between items-center mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.status === 'done' ? 'bg-green-200' :
                                    task.status === 'in-progress' ? 'bg-blue-200' :
                                    task.status === 'blocked' ? 'bg-red-200' : 'bg-gray-200'
                                  }`}
                                >
                                  {task.status}
                                </Badge>
                                {task.priority === 'high' && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-2">
                              <p className="font-semibold">{task.title}</p>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <span className="text-gray-500">Project:</span>
                                <span>{task.project}</span>
                                <span className="text-gray-500">Priority:</span>
                                <span className={
                                  task.priority === 'high' ? 'text-red-600' :
                                  task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                }>{task.priority}</span>
                                <span className="text-gray-500">Time spent:</span>
                                <span>{getTotalTimeSpent(task).hours}h {getTotalTimeSpent(task).minutes}m</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.tasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderView = (tasks: Task[]) => {
    switch (viewMode) {
      case 'calendar':
        return renderCalendarView();
      default:
        return renderListView(tasks);
    }
  };

  // Dynamic header title based on view mode
  const getHeaderTitle = () => {
    return viewMode === 'calendar' ? 'Task Calendar' : 'Task List';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-gray-500">Track and manage your assigned tasks</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Due Today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Blocked</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{stats.blocked}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{getHeaderTitle()}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Calendar
            </Button>
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
                {projects.map(project => (
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

          {/* Show tabs only in list view */}
          {viewMode === 'list' && (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="this-week">This Week</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              {['all', 'today', 'this-week', 'overdue', 'completed'].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
                  {renderView(getTasksByTab(tab))}
                  {getTasksByTab(tab).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No tasks found</p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Show calendar view directly without tabs */}
          {viewMode === 'calendar' && (
            <div className="mt-4">
              {renderView(filteredTasks)}
              {filteredTasks.length === 0 && (
                <p className="text-center text-gray-500 py-8">No tasks found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-6xl"  style={{ maxWidth: '1000px', width: '70vw', maxHeight: '1000px', height: '90vh'}}>
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedTask?.title}</DialogTitle>
            <DialogDescription className="text-lg">{selectedTask?.project}</DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side - Task Information */}
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Description</Label>
                  <p className="text-gray-600 mt-2 p-3 bg-gray-50 rounded-lg">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Status</Label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) => handleUpdateStatus(selectedTask.id, value as Task['status'])}
                    >
                      <SelectTrigger className="mt-2">
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
                    <Label className="font-semibold">Priority</Label>
                    <Select value={selectedTask.priority}>
                      <SelectTrigger className="mt-2">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">Due Date</Label>
                    <p className="text-gray-600 mt-2">{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <Label className="font-semibold">Assigned By</Label>
                    <p className="text-gray-600 mt-2">{selectedTask.assignedBy}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-semibold">Total Time Spent</Label>
                  <p className="text-xl text-blue-600 font-bold mt-2">
                    {getTotalTimeSpent(selectedTask).hours}h {getTotalTimeSpent(selectedTask).minutes}m
                  </p>
                </div>
              </div>

              {/* Right Side - Time Logging */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Log Time</Label>
                  </div>
                  
                  {/* Time Log Input Form */}
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTimeLog.date}
                        onChange={(e) => setNewTimeLog(prev => ({ ...prev, date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Hours</Label>
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          value={newTimeLog.hours}
                          onChange={(e) => setNewTimeLog(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Minutes</Label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={newTimeLog.minutes}
                          onChange={(e) => setNewTimeLog(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Description (Optional)</Label>
                      <Textarea
                        placeholder="What did you work on?"
                        value={newTimeLog.description}
                        onChange={(e) => setNewTimeLog(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <Button 
                      onClick={handleSaveTimeLog}
                      className="w-full"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Save Time Log
                    </Button>
                  </div>
                </div>

                {/* Existing Time Logs */}
                <div>
                  <Label className="text-base font-semibold">Time Log History</Label>
                  <div className="space-y-3 max-h-80 overflow-y-auto mt-2">
                    {(selectedTask.timeLogs || []).map(log => (
                      <div key={log.id} className="p-4 border rounded-lg bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-lg">
                                {log.hours}h {log.minutes}m
                              </p>
                              <Badge variant="outline" className="text-sm">
                                {new Date(log.date).toLocaleDateString()}
                              </Badge>
                            </div>
                            {log.description && (
                              <p className="text-gray-600 mt-2">{log.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(selectedTask.timeLogs || []).length === 0 && (
                      <div className="text-center py-8 border rounded-lg bg-gray-50">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No time logs yet</p>
                        <p className="text-gray-400 text-sm">Start by logging your time above</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>Close</Button>
            <Button onClick={() => {
              toast.success('Task updated');
              setShowTaskDialog(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}