import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Target,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  TrendingDown,
  Play,
  Pause,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { Sprint } from '../../services/sprints-api';

interface SprintDetailProps {
  sprintId: string;
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

const mockSprint: Sprint = {
  id: 2,
  project_id: 1,
  name: 'Sprint 2 - Authentication',
  goal: 'Implement user authentication and authorization with OAuth2, JWT tokens, and role-based access control',
  start_date: '2024-11-15',
  end_date: '2024-11-28',
  status: 'active',
  created_at: '2024-11-14T10:00:00Z',
  updated_at: '2024-11-15T09:00:00Z'
};

const mockTasks = [
  { id: 1, title: 'Setup OAuth2 provider', status: 'done', assignee: 'John Doe', priority: 'high' },
  { id: 2, title: 'Implement JWT authentication', status: 'in-progress', assignee: 'Sarah Johnson', priority: 'high' },
  { id: 3, title: 'Create login UI', status: 'in-progress', assignee: 'Mike Wilson', priority: 'medium' },
  { id: 4, title: 'Add role-based permissions', status: 'todo', assignee: 'John Doe', priority: 'high' },
  { id: 5, title: 'Write authentication tests', status: 'todo', assignee: 'Sarah Johnson', priority: 'medium' },
  { id: 6, title: 'Update API documentation', status: 'todo', assignee: 'Mike Wilson', priority: 'low' },
];

const availableTasks = [
  { id: 7, title: 'Implement password reset', priority: 'medium' },
  { id: 8, title: 'Add 2FA support', priority: 'high' },
  { id: 9, title: 'Create user profile page', priority: 'low' },
  { id: 10, title: 'Add session management', priority: 'medium' },
];

export function SprintDetail({ sprintId, user, navigateTo }: SprintDetailProps) {
  const [sprint, setSprint] = useState<Sprint>(mockSprint);
  const [tasks, setTasks] = useState(mockTasks);
  const [showAddTasksDialog, setShowAddTasksDialog] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const daysRemaining = Math.ceil(
    (new Date(sprint.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleAddTasks = () => {
    if (selectedTasks.length === 0) {
      toast.error('Please select at least one task');
      return;
    }

    const tasksToAdd = availableTasks.filter(t => selectedTasks.includes(t.id));
    const newTasks = tasksToAdd.map(t => ({
      ...t,
      status: 'todo' as const,
      assignee: 'Unassigned'
    }));

    setTasks([...tasks, ...newTasks]);
    setSelectedTasks([]);
    setShowAddTasksDialog(false);
    toast.success(`${tasksToAdd.length} task(s) added to sprint`);
  };

  const handleStatusChange = (status: Sprint['status']) => {
    setSprint({ ...sprint, status });
    toast.success(`Sprint ${status === 'active' ? 'activated' : status === 'completed' ? 'completed' : 'updated'}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('projects')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>
      </div>

      {/* Sprint Header */}
      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-6 h-6 text-primary" />
                <h1>{sprint.name}</h1>
                <Badge className={getStatusColor(sprint.status)}>
                  {sprint.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{sprint.goal}</p>
            </div>
            <div className="flex gap-2">
              {sprint.status === 'planned' && (
                <Button onClick={() => handleStatusChange('active')}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Sprint
                </Button>
              )}
              {sprint.status === 'active' && (
                <>
                  <Button onClick={() => handleStatusChange('completed')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Sprint
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange('canceled')}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => navigateTo('sprint-burndown', { sprintId })}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Burndown Chart
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Days Remaining</p>
              <p className={daysRemaining < 0 ? 'text-red-600' : ''}>
                {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="flex-1" />
                <span className="text-sm">{progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tasks</p>
              <p>
                {completedTasks} / {totalTasks} completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl">{completedTasks}</p>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl">{inProgressTasks}</p>
              <Circle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-gray-400">
          <CardHeader className="pb-3">
            <CardDescription>To Do</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl">{todoTasks}</p>
              <Circle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Tasks */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sprint Tasks</CardTitle>
              <CardDescription>Tasks assigned to this sprint</CardDescription>
            </div>
            <Dialog open={showAddTasksDialog} onOpenChange={setShowAddTasksDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tasks
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Tasks to Sprint</DialogTitle>
                  <DialogDescription>
                    Select tasks from the backlog to add to this sprint
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTasks([...selectedTasks, task.id]);
                          } else {
                            setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm">{task.title}</p>
                        <Badge variant="outline" className={`text-xs mt-1 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddTasks} className="flex-1">
                    Add {selectedTasks.length} Task(s)
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddTasksDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No tasks in this sprint</p>
              <Button onClick={() => setShowAddTasksDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Tasks
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {task.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="flex-1">
                      <p className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {task.assignee.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant={
                      task.status === 'done' ? 'default' :
                      task.status === 'in-progress' ? 'secondary' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
