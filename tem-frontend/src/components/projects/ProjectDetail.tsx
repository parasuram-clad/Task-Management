import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, TrendingUp, Plus, Edit, Trash2, Target, Trello } from 'lucide-react';
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
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectApi, taskApi, Project as ApiProject } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';
import { SprintsList } from '../sprints/SprintsList';
import { KanbanBoard } from '../kanban/KanbanBoard';

interface ProjectDetailProps {
  projectId: string;
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

export function ProjectDetail({ projectId, user, navigateTo }: ProjectDetailProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const useApi = apiConfig.hasBaseUrl();
  
  // Mock project data
  const mockProject = {
    id: projectId,
    name: 'E-commerce Platform',
    description: 'Build a comprehensive e-commerce platform with product catalog, shopping cart, payment integration, and order management.',
    client: 'Acme Corp',
    manager: 'Sarah Johnson',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active' as 'active' | 'on-hold' | 'completed',
    completion: 75,
    health: 'green' as 'green' | 'yellow' | 'red',
    budget: 150000,
    hoursAllocated: 2000,
    hoursLogged: 1240,
  };

  const [project, setProject] = useState(mockProject);
  const [editForm, setEditForm] = useState(project);

  // Fetch project from API
  useEffect(() => {
    if (useApi) {
      fetchProject();
    }
  }, [projectId, useApi]);

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const data = await projectApi.get(parseInt(projectId));
      const mappedProject = {
        id: data.id.toString(),
        name: data.name,
        description: data.description || '',
        client: data.client || '',
        manager: data.manager_name || 'Unassigned',
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status as 'active' | 'on-hold' | 'completed',
        completion: 75, // Would need additional API data
        health: 'green' as const,
        budget: 150000, // Would need additional API data
        hoursAllocated: 2000,
        hoursLogged: 1240,
      };
      setProject(mappedProject);
      setEditForm(mappedProject);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load project: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'John Doe', role: 'Senior Developer', avatar: '', utilization: 85 },
    { id: '2', name: 'Jane Smith', role: 'Frontend Developer', avatar: '', utilization: 90 },
    { id: '3', name: 'Mike Wilson', role: 'Backend Developer', avatar: '', utilization: 78 },
    { id: '4', name: 'Sarah Connor', role: 'QA Engineer', avatar: '', utilization: 92 },
    { id: '5', name: 'Tom Hardy', role: 'Designer', avatar: '', utilization: 65 },
  ]);

  const availableEmployees = [
    'John Doe',
    'Jane Smith',
    'Mike Wilson',
    'Sarah Connor',
    'Tom Hardy',
    'Emma Watson',
    'Chris Evans',
    'Scarlett Johansson',
  ];

  const tasks = [
    { id: '1', title: 'Implement shopping cart', assignee: 'John Doe', status: 'In Progress', priority: 'high', dueDate: 'Nov 10' },
    { id: '2', title: 'Design product pages', assignee: 'Tom Hardy', status: 'Completed', priority: 'medium', dueDate: 'Nov 5' },
    { id: '3', title: 'Payment gateway integration', assignee: 'Mike Wilson', status: 'To Do', priority: 'high', dueDate: 'Nov 15' },
    { id: '4', title: 'Test checkout flow', assignee: 'Sarah Connor', status: 'In Progress', priority: 'high', dueDate: 'Nov 12' },
  ];

  const weeklyHours = [
    { week: 'Week 40', hours: 160 },
    { week: 'Week 41', hours: 180 },
    { week: 'Week 42', hours: 175 },
    { week: 'Week 43', hours: 185 },
    { week: 'Week 44', hours: 170 },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleUpdateProject = async () => {
    if (useApi) {
      setIsSaving(true);
      try {
        await projectApi.update(parseInt(projectId), {
          name: editForm.name,
          description: editForm.description || undefined,
          client: editForm.client || undefined,
          start_date: editForm.startDate,
          end_date: editForm.endDate,
          status: editForm.status,
        });
        
        setProject(editForm);
        setShowEditDialog(false);
        toast.success('Project updated successfully');
        
        // Refresh project data
        await fetchProject();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to update project: ${error.message}`);
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      // Mock mode
      setProject(editForm);
      setShowEditDialog(false);
      toast.success('Project updated successfully (Mock Mode)');
    }
  };

  const handleAddMember = (memberName: string, memberRole: string) => {
    const newMember = {
      id: Date.now().toString(),
      name: memberName,
      role: memberRole,
      avatar: '',
      utilization: 0,
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowAddMemberDialog(false);
    toast.success(`${memberName} added to project`);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    toast.success('Team member removed');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo('projects')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1>{project.name}</h1>
            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
            <div className={`w-3 h-3 rounded-full ${
              project.health === 'green' ? 'bg-green-500' :
              project.health === 'yellow' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{project.completion}%</p>
            <Progress value={project.completion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Team Size</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{teamMembers.length} members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Hours Logged</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{project.hoursLogged} / {project.hoursAllocated}</p>
            <Progress value={(project.hoursLogged / project.hoursAllocated) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="sprints">
            <Target className="w-4 h-4 mr-2" />
            Sprints
          </TabsTrigger>
          <TabsTrigger value="kanban">
            <Trello className="w-4 h-4 mr-2" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{project.description}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Client</span>
                  <span>{project.client}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Project Manager</span>
                  <span>{project.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date</span>
                  <span>{new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date</span>
                  <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span>${project.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge>{project.status}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { user: 'John Doe', action: 'Completed task: Design product pages', time: '2 hours ago' },
                    { user: 'Sarah Connor', action: 'Started testing checkout flow', time: '4 hours ago' },
                    { user: 'Mike Wilson', action: 'Updated API documentation', time: '1 day ago' },
                  ].map((activity, index) => (
                    <div key={index} className="pb-3 border-b last:border-0">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                    </div>
                  ))}
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
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p>{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Utilization</p>
                      <p>{member.utilization}%</p>
                    </div>
                    {(user.role === 'admin' || user.role === 'manager') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
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
                <Button size="sm" className="gap-2" onClick={() => navigateTo('project-tasks')}>
                  View Kanban Board
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <p>{task.title}</p>
                      <p className="text-sm text-gray-500">Assigned to: {task.assignee}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline">{task.status}</Badge>
                      <span className="text-sm text-gray-500">{task.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Hours Summary</CardTitle>
              <CardDescription>Weekly hours logged for this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyHours.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span>{week.week}</span>
                      <span>{week.hours} hours</span>
                    </div>
                    <Progress value={(week.hours / 200) * 100} />
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Total Hours Logged</span>
                    <span>{project.hoursLogged} / {project.hoursAllocated} hours</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sprints">
          <SprintsList user={user} projectId={projectId} navigateTo={navigateTo} />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard user={user} projectId={projectId} navigateTo={navigateTo} />
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
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-end">End Date</Label>
                <Input
                  id="edit-end"
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-manager">Project Manager</Label>
                <Select
                  value={editForm.manager}
                  onValueChange={(value) => setEditForm({ ...editForm, manager: value })}
                >
                  <SelectTrigger id="edit-manager" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                    <SelectItem value="Admin User">Admin User</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-budget">Budget ($)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm({ ...editForm, budget: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-hours">Allocated Hours</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  value={editForm.hoursAllocated}
                  onChange={(e) => setEditForm({ ...editForm, hoursAllocated: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>
              Save Changes
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
            const memberName = formData.get('member-name') as string;
            const memberRole = formData.get('member-role') as string;
            if (memberName && memberRole) {
              handleAddMember(memberName, memberRole);
            }
          }} className="space-y-4">
            <div>
              <Label htmlFor="member-name">Employee</Label>
              <Select name="member-name" required>
                <SelectTrigger id="member-name" className="mt-1">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees
                    .filter(emp => !teamMembers.some(tm => tm.name === emp))
                    .map(emp => (
                      <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="member-role">Role in Project</Label>
              <Input
                id="member-role"
                name="member-role"
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
    </div>
  );
}