import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
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


  const handleRemoveMemberClick = (member: ProjectMember) => {
  setMemberToRemove(member);
  setShowRemoveConfirm(true);
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
      
      // Calculate completion percentage based on tasks
      const tasksData = await taskApi.getProjectTasks(parseInt(projectId));
      const completion = tasksData.length > 0 
        ? Math.round((tasksData.filter(t => t.status === 'completed').length / tasksData.length) * 100)
        : 0;

      // Calculate health based on due dates and completion
      const today = new Date();
      const endDate = new Date(data.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const health = completion >= 80 ? 'green' : 
                    (completion >= 50 && daysRemaining > 7) ? 'yellow' : 'red';

      const mappedProject = {
        id: data.id.toString(),
        name: data.name,
        description: data.description || '',
        client: data.client_name || '',
        manager: data.manager_name || 'Unassigned',
        managerId: data.manager_id,
        startDate: data.start_date,
        endDate: data.end_date,
        status: data.status as 'active' | 'on-hold' | 'completed',
        completion,
        health,
        budget: 0, // You can add budget field to your API if needed
        hoursAllocated: 2000, // Default value or calculate from project scope
        hoursLogged: data.members ? calculateTotalHours(data.members) : 0,
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

  const fetchProjectTimesheets = async () => {
    if (!projectId) return;
    
    try {
      // Get timesheets for the last 5 weeks
      const weeks: WeeklyHours[] = [];
      const today = new Date();
      
      for (let i = 0; i < 5; i++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (i * 7));
        const weekLabel = `Week ${getWeekNumber(weekStart)}`;
        
        // In a real implementation, you would fetch timesheet data for this week
        // For now, using mock data that would come from your timesheet API
        const hours = Math.floor(Math.random() * 40) + 120; // Random hours between 120-160
        
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

  const handleUpdateProject = async () => {
    if (useApi) {
      setIsSaving(true);
      try {
        await projectApi.update(parseInt(projectId!), {
          name: editForm.name,
          description: editForm.description || undefined,
          clientName: editForm.client || undefined,
          managerId: editForm.managerId,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          status: editForm.status,
        });
        
        setProject(editForm);
        setShowEditDialog(false);
        toast.success('Project updated successfully');
        
        // Refresh project data
        await fetchProjectDetails();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to update project: ${error.message}`);
        }
      } finally {
        setIsSaving(false);
      }
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
              <span>{formatIndianDate(project.startDate)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{formatIndianDate(project.endDate)}</span>
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
                  <span>{formatIndianDate(project.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date</span>
                  <span>{formatIndianDate(project.endDate)}</span>
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
                  {tasks.slice(0, 3).map((task, index) => (
                    <div key={index} className="pb-3 border-b last:border-0">
                      <p className="text-sm">
        {task.assignee_name} {task.status === 'completed' ? 'completed' : 'updated'} task: {task.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {task.assignee_name} • {task.due_date || 'No due date'}
                      </p>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-gray-500 text-sm">No recent activity</p>
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