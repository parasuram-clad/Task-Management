import { useState, useEffect } from 'react';
import { Plus, MoreVertical, User as UserIcon, Calendar, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { KanbanColumn } from '../../services/kanban-api';

interface Task {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: { name: string; avatar?: string };
  dueDate?: string;
  columnId: number;
}

interface KanbanBoardProps {
  user: User;
  projectId: string;
  navigateTo: (page: string, params?: any) => void;
}

const mockColumns: KanbanColumn[] = [
  { id: 1, project_id: 1, name: 'Backlog', position: 0, wip_limit: null, created_at: '2024-11-01T00:00:00Z' },
  { id: 2, project_id: 1, name: 'In Progress', position: 1, wip_limit: 5, created_at: '2024-11-01T00:00:00Z' },
  { id: 3, project_id: 1, name: 'Review', position: 2, wip_limit: 3, created_at: '2024-11-01T00:00:00Z' },
  { id: 4, project_id: 1, name: 'Done', position: 3, wip_limit: null, created_at: '2024-11-01T00:00:00Z' }
];

const mockTasks: Task[] = [
  { id: 1, title: 'Design login page', priority: 'high', assignee: { name: 'John Doe' }, dueDate: '2024-11-20', columnId: 1 },
  { id: 2, title: 'Setup authentication', priority: 'high', assignee: { name: 'Sarah Johnson' }, dueDate: '2024-11-18', columnId: 2 },
  { id: 3, title: 'Create API endpoints', priority: 'medium', assignee: { name: 'Mike Wilson' }, dueDate: '2024-11-22', columnId: 2 },
  { id: 4, title: 'Write unit tests', priority: 'medium', assignee: { name: 'John Doe' }, columnId: 3 },
  { id: 5, title: 'Fix login bug', priority: 'high', assignee: { name: 'Sarah Johnson' }, dueDate: '2024-11-17', columnId: 2 },
  { id: 6, title: 'Update documentation', priority: 'low', assignee: { name: 'Mike Wilson' }, columnId: 1 },
  { id: 7, title: 'Deploy to staging', priority: 'medium', columnId: 4 }
];

export function KanbanBoard({ user, projectId, navigateTo }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnWipLimit, setNewColumnWipLimit] = useState('');

  useEffect(() => {
    loadBoard();
  }, [projectId]);

  const loadBoard = () => {
    setColumns(mockColumns);
    setTasks(mockTasks);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: number) => {
    if (!draggedTask) return;

    const column = columns.find(c => c.id === columnId);
    const tasksInColumn = tasks.filter(t => t.columnId === columnId);

    if (column?.wip_limit && tasksInColumn.length >= column.wip_limit && draggedTask.columnId !== columnId) {
      toast.error(`WIP limit of ${column.wip_limit} reached for ${column.name}`);
      setDraggedTask(null);
      return;
    }

    setTasks(tasks.map(t =>
      t.id === draggedTask.id ? { ...t, columnId } : t
    ));
    toast.success('Task moved successfully');
    setDraggedTask(null);
  };

  const handleCreateColumn = () => {
    if (!newColumnName.trim()) {
      toast.error('Column name is required');
      return;
    }

    const newColumn: KanbanColumn = {
      id: Date.now(),
      project_id: parseInt(projectId),
      name: newColumnName,
      position: columns.length,
      wip_limit: newColumnWipLimit ? parseInt(newColumnWipLimit) : null,
      created_at: new Date().toISOString()
    };

    setColumns([...columns, newColumn]);
    setShowColumnDialog(false);
    setNewColumnName('');
    setNewColumnWipLimit('');
    toast.success('Column created successfully');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            Kanban Board
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop tasks between columns
          </p>
        </div>
        <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Column</DialogTitle>
              <DialogDescription>
                Add a new column to the board
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="column-name">Column Name *</Label>
                <Input
                  id="column-name"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g., Testing"
                />
              </div>
              <div>
                <Label htmlFor="wip-limit">WIP Limit (Optional)</Label>
                <Input
                  id="wip-limit"
                  type="number"
                  value={newColumnWipLimit}
                  onChange={(e) => setNewColumnWipLimit(e.target.value)}
                  placeholder="e.g., 5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of tasks allowed in this column
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateColumn} className="flex-1">
                  Create Column
                </Button>
                <Button variant="outline" onClick={() => setShowColumnDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => {
          const columnTasks = tasks.filter(t => t.columnId === column.id);
          const isOverLimit = column.wip_limit && columnTasks.length > column.wip_limit;

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <Card className={`h-full ${isOverLimit ? 'border-red-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {column.name}
                        <Badge variant="secondary" className="text-xs">
                          {columnTasks.length}
                        </Badge>
                        {column.wip_limit && (
                          <Badge
                            variant={isOverLimit ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            Limit: {column.wip_limit}
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Column</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Column
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {columnTasks.map(task => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="cursor-move hover:shadow-md transition-shadow bg-card"
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm flex-1">{task.title}</p>
                            <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)} shrink-0`} />
                          </div>

                          <div className="flex items-center justify-between">
                            {task.assignee && (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}

                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>

                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                      Drop tasks here
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
