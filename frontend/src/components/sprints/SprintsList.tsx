import { useState, useEffect } from 'react';
import { Calendar, Plus, Target, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { Sprint } from '../../services/sprints-api';

interface SprintsListProps {
  user: User;
  projectId?: string;
  navigateTo: (page: string, params?: any) => void;
}

const mockSprints: Sprint[] = [
  {
    id: 1,
    project_id: 1,
    name: 'Sprint 1 - Foundation',
    goal: 'Setup project infrastructure and core components',
    start_date: '2024-11-01',
    end_date: '2024-11-14',
    status: 'completed',
    created_at: '2024-10-28T10:00:00Z',
    updated_at: '2024-11-14T17:00:00Z'
  },
  {
    id: 2,
    project_id: 1,
    name: 'Sprint 2 - Authentication',
    goal: 'Implement user authentication and authorization',
    start_date: '2024-11-15',
    end_date: '2024-11-28',
    status: 'active',
    created_at: '2024-11-14T10:00:00Z',
    updated_at: '2024-11-15T09:00:00Z'
  },
  {
    id: 3,
    project_id: 1,
    name: 'Sprint 3 - API Integration',
    goal: 'Integrate with backend APIs',
    start_date: '2024-11-29',
    end_date: '2024-12-12',
    status: 'planned',
    created_at: '2024-11-14T10:00:00Z',
    updated_at: '2024-11-14T10:00:00Z'
  }
];

export function SprintsList({ user, projectId, navigateTo }: SprintsListProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    status: 'planned' as const
  });

  useEffect(() => {
    loadSprints();
  }, [projectId]);

  const loadSprints = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSprints(mockSprints);
      setIsLoading(false);
    }, 500);
  };

  const handleCreateSprint = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in required fields');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    toast.success('Sprint created successfully');
    setShowCreateDialog(false);
    setFormData({ name: '', goal: '', startDate: '', endDate: '', status: 'planned' });
    loadSprints();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'canceled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Target className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Sprints
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage agile sprints for this project
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
              <DialogDescription>
                Define sprint goals and timeline
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sprint-name">Sprint Name *</Label>
                <Input
                  id="sprint-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sprint 1 - Foundation"
                />
              </div>
              <div>
                <Label htmlFor="sprint-goal">Goal</Label>
                <Textarea
                  id="sprint-goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="What will be accomplished in this sprint?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date *</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateSprint} className="flex-1">
                  Create Sprint
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.map(sprint => (
          <Card key={sprint.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{sprint.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {sprint.goal || 'No goal set'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(sprint.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(sprint.status)}
                    {sprint.status}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                </div>

                {sprint.status === 'active' && (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigateTo('sprint-detail', { sprintId: sprint.id })}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigateTo('sprint-burndown', { sprintId: sprint.id })}
                  >
                    <TrendingDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sprints.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="mb-2">No sprints yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first sprint to get started
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Sprint
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
