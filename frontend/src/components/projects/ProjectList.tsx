import { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  FolderKanban, 
  Users, 
  Calendar, 
  TrendingUp,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Grid3X3,
  List,
  Filter,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';
import { User } from '../../App';
import { projectApi, Project as ApiProject, employeeApi, Employee } from '../../services/api';
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
  description?: string;
}

type ViewMode = 'grid' | 'list';

export function ProjectList({ user }: ProjectListProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [companyUsers, setCompanyUsers] = useState<Employee[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  
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
    fetchProjects();
    fetchCompanyUsers();
  }, []);

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

  // Map API projects to local Project format with real data
  const mapApiProjectToLocal = (apiProject: ApiProject): Project => {
    const startDate = new Date(apiProject.start_date);
    const endDate = new Date(apiProject.end_date);
    
    // Calculate real progress based on task completion
    let completion = 0;
    if (apiProject.tasks && apiProject.tasks.length > 0) {
      const completedTasks = apiProject.tasks.filter(task => task.status === 'done').length;
      completion = Math.round((completedTasks / apiProject.tasks.length) * 100);
    } else if (apiProject.total_tasks && apiProject.completed_tasks) {
      // Use the aggregated task counts from the list query
      completion = apiProject.total_tasks > 0 
        ? Math.round((apiProject.completed_tasks / apiProject.total_tasks) * 100)
        : 0;
    }

    // If project is completed, set to 100%
    if (apiProject.status === 'completed') {
      completion = 100;
    }
    
    // Determine health based on progress and status
    let health: 'green' | 'yellow' | 'red' = 'green';
    if (apiProject.status === 'on-hold') {
      health = 'yellow';
    } else if (completion > 80 && apiProject.status !== 'completed') {
      health = 'red';
    } else if (completion > 60 && apiProject.status !== 'completed') {
      health = 'yellow';
    }

    // Calculate total hours from project data
    const totalHours = apiProject.members?.reduce((sum, member) => sum + (member.total_hours || 0), 0) || 0;
    
    // Get real team member count
    const teamSize = apiProject.member_count || apiProject.members?.length || 0;
    
    // Capitalize manager name
    const capitalizeName = (name: string) => {
      return name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    return {
      id: apiProject.id.toString(),
      name: apiProject.name,
      client: apiProject.client_name || '',
      manager: apiProject.manager_name ? capitalizeName(apiProject.manager_name) : 'Unassigned',
      managerId: apiProject.manager_id || 0,
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
      completion: completion,
      health: health,
      teamSize: teamSize,
      totalHours: totalHours,
      description: apiProject.description
    };
  };

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
    const config = {
      green: { color: 'bg-green-500', tooltip: 'On Track' },
      yellow: { color: 'bg-yellow-500', tooltip: 'Needs Attention' },
      red: { color: 'bg-red-500', tooltip: 'At Risk' }
    };
    
    return (
      <div className="relative group">
        <div className={`w-3 h-3 rounded-full ${config[health].color}`} />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
          {config[health].tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  const getStatusBadge = (status: Project['status']) => {
    const config = {
      active: { variant: 'default' as const, class: 'bg-green-100 text-green-800 border-green-200' },
      completed: { variant: 'secondary' as const, class: 'bg-blue-100 text-blue-800 border-blue-200' },
      'on-hold': { variant: 'outline' as const, class: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    };
    
    return (
      <Badge variant={config[status].variant} className={config[status].class}>
        {status === 'active' && <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" />}
        {status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'on-hold' && <AlertTriangle className="w-3 h-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.startDate || !newProject.endDate || !newProject.managerId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const projectData = {
        name: newProject.name,
        description: newProject.description || undefined,
        clientName: newProject.client || undefined,
        managerId: parseInt(newProject.managerId),
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        status: newProject.status,
      };

      await projectApi.create(projectData);
      toast.success('Project created successfully');
      
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
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  // Grid View Component with Real Data
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map(project => (
        <Card
          key={project.id}
          className="hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 h-full"
          onClick={() => handleProjectClick(project.id)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {project.name}
                </CardTitle>
                {project.client && (
                  <CardDescription className="text-sm text-gray-600 mt-1 truncate">
                    {project.client}
                  </CardDescription>
                )}
              </div>
              {getHealthIndicator(project.health)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Real Progress Bar based on task completion */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="font-semibold text-gray-900">{project.completion}%</span>
              </div>
              <Progress value={project.completion} className="h-2" />
            </div>

            {/* Real Team Members Count */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{project.teamSize} {project.teamSize === 1 ? 'member' : 'members'}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{project.totalHours}h</span>
                </div>
              </div>
            </div>

            {/* Real Project Dates */}
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{project.startDate} - {project.endDate}</span>
            </div>

            {/* Status and Capitalized Manager Name */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              {getStatusBadge(project.status)}
              <span className="text-xs text-gray-500 font-medium">By: {project.manager}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // List View Component with Real Data
  const ListView = () => (
    <div className="space-y-4">
      {filteredProjects.map(project => (
        <Card
          key={project.id}
          className="hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300"
          onClick={() => handleProjectClick(project.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getHealthIndicator(project.health)}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                    {project.client && (
                      <p className="text-sm text-gray-600 truncate">{project.client}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{project.teamSize}</div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{project.totalHours}h</div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span className="font-semibold">{project.completion}%</span>
                    </div>
                    <Progress value={project.completion} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 ml-6">
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">{project.startDate} - {project.endDate}</div>
                  <div className="text-xs text-gray-500">By: {project.manager}</div>
                </div>
                {getStatusBadge(project.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleProjectClick(project.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-gray-500">Manage and track all projects</p>
          {apiError && (
            <div className="flex items-center gap-2 text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              {apiError}
            </div>
          )}
        </div>
        {(user.role === 'admin' || user.role === 'manager' || user.role === 'hr') && (
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Stats Cards with Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>All time projects</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Projects Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Currently running</span>
            </div>
          </CardContent>
        </Card>

        {/* On Track Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">On Track</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onTrack}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Meeting deadlines</span>
            </div>
          </CardContent>
        </Card>

        {/* At Risk Card */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">At Risk</p>
                <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertTriangle className="w-4 h-4" />
              <span>Need attention</span>
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
                className="gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-2"
              >
                <List className="w-4 h-4" />
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
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-lg">Loading projects...</p>
              </div>
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
            <GridView />
          ) : (
            <ListView />
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