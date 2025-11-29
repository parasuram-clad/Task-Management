// ProjectGrid.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  FolderKanban, 
  Users, 
  Calendar,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Grid3X3,
  List,
  Clock,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  client: string;
  manager: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'on-hold' | 'completed';
  completion: number;
  health: 'green' | 'yellow' | 'red';
  teamSize: number;
  totalHours: number;
  description: string;
}

type ViewMode = 'grid' | 'list';

export function ProjectGrid() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Mock projects data
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      client: 'Retail Corp',
      manager: 'John Doe',
      startDate: '15 Oct 2024',
      endDate: '15 Jan 2025',
      status: 'active',
      completion: 65,
      health: 'green',
      teamSize: 8,
      totalHours: 1240,
      description: 'Build a modern e-commerce platform with React and Node.js'
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      client: 'Finance Bank',
      manager: 'Jane Smith',
      startDate: '1 Nov 2024',
      endDate: '1 Mar 2025',
      status: 'active',
      completion: 30,
      health: 'yellow',
      teamSize: 6,
      totalHours: 890,
      description: 'Develop a secure mobile banking application'
    },
    {
      id: '3',
      name: 'HR Management System',
      client: 'Tech Solutions Inc',
      manager: 'Mike Johnson',
      startDate: '1 Sep 2024',
      endDate: '15 Dec 2024',
      status: 'on-hold',
      completion: 45,
      health: 'yellow',
      teamSize: 5,
      totalHours: 670,
      description: 'Comprehensive HR management and payroll system'
    },
    {
      id: '4',
      name: 'Inventory Tracking',
      client: 'Logistics Pro',
      manager: 'Sarah Wilson',
      startDate: '1 Aug 2024',
      endDate: '30 Nov 2024',
      status: 'completed',
      completion: 100,
      health: 'green',
      teamSize: 4,
      totalHours: 1120,
      description: 'Real-time inventory tracking and management system'
    },
    {
      id: '5',
      name: 'Customer Portal',
      client: 'Service Plus',
      manager: 'David Brown',
      startDate: '1 Dec 2024',
      endDate: '1 Jun 2025',
      status: 'active',
      completion: 15,
      health: 'red',
      teamSize: 7,
      totalHours: 450,
      description: 'Customer self-service portal with ticket management'
    },
    {
      id: '6',
      name: 'Analytics Dashboard',
      client: 'Data Insights Co',
      manager: 'Emily Chen',
      startDate: '15 Sep 2024',
      endDate: '15 Feb 2025',
      status: 'active',
      completion: 80,
      health: 'green',
      teamSize: 3,
      totalHours: 980,
      description: 'Real-time business intelligence and analytics platform'
    }
  ]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleProjectClick = (projectId: string) => {
    navigate(`/project-tasks/${projectId}`);
  };

  const handleViewDetails = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/project-tasks/${projectId}`);
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-6">
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
                <CardDescription className="text-sm text-gray-600 mt-1 truncate">
                  {project.client}
                </CardDescription>
              </div>
              {getHealthIndicator(project.health)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="font-semibold text-gray-900">{project.completion}%</span>
              </div>
              <Progress value={project.completion} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{project.teamSize} members</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{project.totalHours}h</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{project.startDate} - {project.endDate}</span>
            </div>

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
                    <h3 className="font-semibold text-gray-900 truncate text-lg">
                      {project.name}
                    </h3>
                    {project.client && (
                      <p className="text-sm text-gray-600 truncate">{project.client}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {project.description}
                    </p>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleViewDetails(project.id, e)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
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
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and track all your projects in one place</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600 text-sm">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-lg p-3">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-gray-600 text-sm">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 rounded-lg p-3">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.onTrack}</p>
                <p className="text-gray-600 text-sm">On Track</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-amber-50 rounded-lg p-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
                <p className="text-gray-600 text-sm">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <Card className="border-0 bg-white/80">
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
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderKanban className="w-24 h-24 text-gray-300 mb-6" />
              <p className="text-gray-500 text-xl mb-2 font-semibold">No projects found</p>
              <p className="text-gray-400 text-sm mb-6 max-w-md">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by creating your first project'
                }
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </div>
          ) : (
            <>
              {viewMode === 'grid' && <GridView />}
              {viewMode === 'list' && <ListView />}
              
              {/* Results Count */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredProjects.length}</span> of{' '}
                  <span className="font-semibold">{projects.length}</span> projects
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>On Track: {stats.onTrack}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>At Risk: {stats.atRisk}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}