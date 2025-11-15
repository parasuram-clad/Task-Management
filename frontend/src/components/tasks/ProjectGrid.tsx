// ProjectGrid.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { toast } from 'sonner';
import { projectApi, Project as ApiProject, employeeApi, Employee } from '../../services/api';
import { ApiError } from '../../services/api-client';

interface ProjectListProps {
  user: any;
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

type ViewMode = 'grid' | 'list' | 'compact';

export function ProjectGrid({ user }: ProjectListProps) {
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

  // Map API projects to local Project format
// Update the mapApiProjectToLocal function with real progress calculation
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
    client: apiProject.client || '',
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
        client: newProject.client || undefined,
        manager_id: parseInt(newProject.managerId),
        start_date: newProject.startDate,
        end_date: newProject.endDate,
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
    navigate(`/tasks/project-grid/${projectId}`);
  };

  // Grid View Component
const GridView = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
                {/* <Clock className="w-4 h-4" />
                <span className="font-medium">{project.totalHours}h</span> */}
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

  // List View Component
 // List View Component with real data
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

  // Compact View Component
 // Compact View Component with real data
const CompactView = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {filteredProjects.map(project => (
      <Card
        key={project.id}
        className="hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300 p-4"
        onClick={() => handleProjectClick(project.id)}
      >
        {/* Header with project name and health indicator */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {getHealthIndicator(project.health)}
            <h3 className="font-semibold text-sm text-gray-900 truncate flex-1">
              {project.name}
            </h3>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-3">
          {getStatusBadge(project.status)}
        </div>

        {/* Real Progress bar */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">{project.completion}%</span>
          </div>
          <Progress value={project.completion} className="h-1.5" />
        </div>

        {/* Real Team and hours info */}
        <div className="flex justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{project.teamSize} {project.teamSize === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{project.totalHours}h</span>
          </div>
        </div>

        {/* Capitalized Manager info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-100">
          <div className="truncate" title={project.manager}>
            By: {project.manager}
          </div>
        </div>
      </Card>
    ))}
  </div>
);
  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-3xl font-bold tracking-tight">
            Project Task Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage and track all your projects in one place</p>
          {apiError && (
            <div className="flex items-center gap-2 text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-4 h-4" />
              {apiError}
            </div>
          )}
        </div>
    
      </div>

      {/* Stats Cards with Enhanced Design */}
     {/* Stats Section - Minimalist Badges */}
<div className="flex flex-wrap gap-4">
  <div className="flex-1 min-w-[200px] bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4">
      <div className="bg-blue-50 rounded-lg p-3">
        <FolderKanban className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        <p className="text-gray-600 text-sm">Total Projects</p>
      </div>
    </div>
  </div>

  <div className="flex-1 min-w-[200px] bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4">
      <div className="bg-green-50 rounded-lg p-3">
        <Activity className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        <p className="text-gray-600 text-sm">Active Projects</p>
      </div>
    </div>
  </div>

  <div className="flex-1 min-w-[200px] bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4">
      <div className="bg-emerald-50 rounded-lg p-3">
        <Target className="w-6 h-6 text-emerald-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{stats.onTrack}</p>
        <p className="text-gray-600 text-sm">On Track</p>
      </div>
    </div>
  </div>

  <div className="flex-1 min-w-[200px] bg-white rounded-xl p-5 border-l-4 border-amber-500 shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center gap-4">
      <div className="bg-amber-50 rounded-lg p-3">
        <AlertCircle className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
        <p className="text-gray-600 text-sm">At Risk</p>
      </div>
    </div>
  </div>
</div>

      {/* Projects Section with Tabs */}
      <Card className="border-0  bg-white/80 ">
  <CardHeader className="pb-4">
    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
      <CardTitle className="text-2xl font-bold text-gray-900">All Projects</CardTitle>
      
      <div className="flex flex-col sm:flex-row gap-4">
      

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-300"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white border-gray-200 focus:border-blue-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
  {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Compact
          </Button>
        </div>

      </div>
    </div>
  </CardHeader>
  
  <CardContent className="pt-6">
    {isLoading ? (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-lg">Loading projects...</p>
        </div>
      </div>
    ) : filteredProjects.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FolderKanban className="w-24 h-24 text-gray-300 mb-6" />
        <p className="text-gray-500 text-xl mb-2 font-semibold">No projects found</p>
        <p className="text-gray-400 text-sm mb-6 max-w-md">
          {searchTerm || statusFilter !== 'all' 
            ? 'Try adjusting your search or filter criteria' 
            : 'Get started by creating your first project'
          }
        </p>
        {(user.role === 'admin' || user.role === 'manager' || user.role === 'hr') && !searchTerm && statusFilter === 'all' && (
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>
    ) : (
      <>
        {viewMode === 'grid' && <GridView />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'compact' && <CompactView />}
        
        {/* Results Count */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredProjects.length}</span> of{' '}
            <span className="font-semibold">{projects.length}</span> projects
          </p>
        </div>
      </>
    )}
  </CardContent>
</Card>

     
    </div>
  );
}