import { useState, useEffect } from 'react';
import { 
 
  Activity,
  Target,
  AlertCircle,
 
  Clock 
} from 'lucide-react';
import { Search, Plus, FolderKanban, Users, Calendar, TrendingUp ,CheckCircle,AlertTriangle} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { User } from '../../App';
import { projectApi, Project as ApiProject, employeeApi, Employee } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';
import { useNavigate } from 'react-router-dom';

interface ProjectListProps {
  user: User;
}

interface Project {
  id: string;
  name: string;
  client?: string;
  manager: string;
  managerId: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'on-hold' | 'completed';
  completion: number;
  health: 'green' | 'yellow' | 'red';
  teamSize: number;
  totalHours: number;
}

export function ProjectList({ user }: ProjectListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Employee[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const useApi = apiConfig.hasBaseUrl();
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    description: '',
    startDate: '',
    endDate: '',
    managerId: '',
    status: 'active' as const,
  });

  // Fetch projects and company users from API
  useEffect(() => {
    if (useApi) {
      fetchProjects();
      fetchCompanyUsers();
    }
  }, [useApi]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await projectApi.list();
      setApiProjects(data);
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMessage = `Failed to load projects: ${error.message}`;
        setApiError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanyUsers = async () => {
    try {
      const users = await employeeApi.list();
      setCompanyUsers(users);
    } catch (error) {
      console.error('Failed to fetch company users:', error);
      toast.error('Failed to load company users');
    }
  };

  // Map API projects to local Project format
  const mapApiProjectToLocal = (apiProject: ApiProject): Project => {
    const startDate = new Date(apiProject.start_date);
    const endDate = new Date(apiProject.end_date);
    
    return {
      id: apiProject.id.toString(),
      name: apiProject.name,
      client: apiProject.client_name || '',
      manager: apiProject.manager_name || 'Unassigned',
      managerId: apiProject.manager_id,
      startDate: startDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      endDate: endDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      status: apiProject.status as 'active' | 'on-hold' | 'completed',
      completion: 50, // Default value - you can calculate based on tasks
      health: 'green' as const, // Default value
      teamSize: apiProject.members?.length || 0,
      totalHours: 0, // Would need additional API data
    };
  };

  // Use API projects only
  const projects = apiProjects.map(mapApiProjectToLocal);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    onTrack: projects.filter(p => p.health === 'green').length,
    atRisk: projects.filter(p => p.health === 'yellow' || p.health === 'red').length,
  };

  const getHealthIndicator = (health: Project['health']) => {
    return (
      <div className={`w-3 h-3 rounded-full ${
        health === 'green' ? 'bg-green-500' :
        health === 'yellow' ? 'bg-yellow-500' :
        'bg-red-500'
      }`} />
    );
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate || !newProject.managerId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (useApi) {
      setIsCreating(true);
      try {
        const projectData = {
          name: newProject.name,
          description: newProject.description || undefined,
          clientName: newProject.client || undefined,
          managerId: parseInt(newProject.managerId),
          startDate: newProject.startDate,
          endDate: newProject.endDate,
        };

        await projectApi.create(projectData);
        toast.success('Project created successfully');
        
        // Refresh projects list
        await fetchProjects();
        
        setShowCreateDialog(false);
        setNewProject({
          name: '',
          client: '',
          description: '',
          startDate: '',
          endDate: '',
          managerId: '',
          status: 'active',
        });
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to create project: ${error.message}`);
        }
      } finally {
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-500">Manage and track all projects</p>
          {apiError && (
            <p className="text-sm text-yellow-600 mt-1">
              {apiError}
            </p>
          )}
        </div>
        {(user.role === 'admin' || user.role === 'manager' || user.role === 'hr') && (
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Total Projects Card */}
  <Card className="stats-card total-projects">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="stats-label">Total Projects</p>
          <p className="stats-number">{stats.total}</p>
        </div>
        <div className="stats-icon-container">
          <FolderKanban className="stats-icon total-icon" />
        </div>
      </div>
      <div className="stats-footer">
        <Calendar className="stats-footer-icon" />
        <p className="stats-footer-text">All time projects</p>
      </div>
    </CardContent>
  </Card>

  {/* Active Projects Card */}
  <Card className="stats-card active-projects">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="stats-label">Active Projects</p>
          <p className="stats-number">{stats.active}</p>
        </div>
        <div className="stats-icon-container">
          <Activity className="stats-icon active-icon" />
        </div>
      </div>
      <div className="stats-footer">
        <Clock className="stats-footer-icon" />
        <p className="stats-footer-text">Currently running</p>
      </div>
    </CardContent>
  </Card>

  {/* On Track Card */}
  <Card className="stats-card on-track">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="stats-label">On Track</p>
          <p className="stats-number">{stats.onTrack}</p>
        </div>
        <div className="stats-icon-container">
          <Target className="stats-icon on-track-icon" />
        </div>
      </div>
      <div className="stats-footer">
        <TrendingUp className="stats-footer-icon" />
        <p className="stats-footer-text">Meeting deadlines</p>
      </div>
    </CardContent>
  </Card>

  {/* At Risk Card */}
  <Card className="stats-card at-risk">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="stats-label">At Risk</p>
          <p className="stats-number">{stats.atRisk}</p>
        </div>
        <div className="stats-icon-container">
          <AlertCircle className="stats-icon at-risk-icon" />
        </div>
      </div>
      <div className="stats-footer">
        <AlertTriangle className="stats-footer-icon" />
        <p className="stats-footer-text">Need attention</p>
      </div>
    </CardContent>
  </Card>
</div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Projects</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-2">No projects found</p>
              <p className="text-gray-400 text-sm mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first project'
                }
              </p>
              {(user.role === 'admin' || user.role === 'manager' || user.role === 'hr') && !searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{project.name}</CardTitle>
                        {project.client && (
                          <CardDescription className="truncate">{project.client}</CardDescription>
                        )}
                      </div>
                      {getHealthIndicator(project.health)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span>{project.completion}%</span>
                      </div>
                      <Progress value={project.completion} />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.teamSize}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{project.totalHours}h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{project.startDate} - {project.endDate}</span>
                    </div>

                    <Badge variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'completed' ? 'secondary' :
                      'outline'
                    }>
                      {project.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {getHealthIndicator(project.health)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{project.name}</p>
                      <Badge variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' :
                        'outline'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{project.client} • {project.manager}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span>{project.completion}%</span>
                      </div>
                      <Progress value={project.completion} />
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{project.teamSize}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <TrendingUp className="w-4 h-4" />
                      <span>{project.totalHours}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project to track and manage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                placeholder="e.g., E-commerce Platform"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                placeholder="e.g., Acme Corp"
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief project description..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager">Project Manager *</Label>
                <Select
                  value={newProject.managerId}
                  onValueChange={(value) => setNewProject({ ...newProject, managerId: value })}
                >
                  <SelectTrigger id="manager" className="mt-1">
                    <SelectValue placeholder="Select manager" />
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({ ...newProject, status: value as 'active' | 'on-hold' | 'completed' })}
                >
                  <SelectTrigger id="status" className="mt-1">
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
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}