import { useState, useEffect } from 'react';
import { Search, Plus, FolderKanban, Users, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { projectApi, Project as ApiProject } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface ProjectListProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

interface Project {
  id: string;
  name: string;
  client?: string;
  manager: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'on-hold' | 'completed';
  completion: number;
  health: 'green' | 'yellow' | 'red';
  teamSize: number;
  totalHours: number;
}

export function ProjectList({ user, navigateTo }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const useApi = apiConfig.hasBaseUrl();
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    description: '',
    startDate: '',
    endDate: '',
    manager: '',
    status: 'active' as const,
  });

  // Mock projects (used when API is not configured)
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      client: 'Acme Corp',
      manager: 'Sarah Johnson',
      startDate: 'Jan 15, 2024',
      endDate: 'Dec 31, 2024',
      status: 'active',
      completion: 75,
      health: 'green',
      teamSize: 8,
      totalHours: 1240,
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      client: 'TechStart Inc',
      manager: 'Sarah Johnson',
      startDate: 'Mar 1, 2024',
      endDate: 'Nov 30, 2024',
      status: 'active',
      completion: 45,
      health: 'yellow',
      teamSize: 5,
      totalHours: 680,
    },
    {
      id: '3',
      name: 'API Integration',
      client: 'Digital Solutions',
      manager: 'Sarah Johnson',
      startDate: 'Apr 10, 2024',
      endDate: 'Oct 31, 2024',
      status: 'active',
      completion: 90,
      health: 'green',
      teamSize: 3,
      totalHours: 420,
    },
    {
      id: '4',
      name: 'CRM System',
      client: 'Enterprise Co',
      manager: 'Mike Chen',
      startDate: 'Feb 1, 2024',
      endDate: 'Sep 30, 2024',
      status: 'active',
      completion: 30,
      health: 'red',
      teamSize: 6,
      totalHours: 380,
    },
    {
      id: '5',
      name: 'Legacy System Migration',
      client: 'OldTech Ltd',
      manager: 'Sarah Johnson',
      startDate: 'Jan 1, 2024',
      endDate: 'Jun 30, 2024',
      status: 'completed',
      completion: 100,
      health: 'green',
      teamSize: 4,
      totalHours: 960,
    },
  ];

  // Fetch projects from API
  useEffect(() => {
    if (useApi) {
      fetchProjects();
    }
  }, [useApi]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectApi.list();
      setApiProjects(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load projects: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Map API projects to local Project format
  const mapApiProjectToLocal = (apiProject: ApiProject): Project => {
    const startDate = new Date(apiProject.start_date);
    const endDate = new Date(apiProject.end_date);
    
    return {
      id: apiProject.id.toString(),
      name: apiProject.name,
      client: apiProject.client || '',
      manager: apiProject.manager_name || 'Unassigned',
      startDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: apiProject.status as 'active' | 'on-hold' | 'completed',
      completion: 50, // Would need additional API data
      health: 'green' as const, // Would need additional API data
      teamSize: apiProject.members?.length || 0,
      totalHours: 0, // Would need additional API data
    };
  };

  // Use API projects if available, otherwise use mock
  const projects = useApi 
    ? apiProjects.map(mapApiProjectToLocal)
    : mockProjects;

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

  const getHealthColor = (health: Project['health']) => {
    switch (health) {
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'red':
        return 'text-red-600';
    }
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
    if (!newProject.name || !newProject.startDate || !newProject.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (useApi) {
      setIsCreating(true);
      try {
        const projectData = {
          name: newProject.name,
          client: newProject.client || undefined,
          description: newProject.description || undefined,
          start_date: newProject.startDate,
          end_date: newProject.endDate,
          status: newProject.status,
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
          manager: '',
          status: 'active',
        });
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(`Failed to create project: ${error.message}`);
        }
      } finally {
        setIsCreating(false);
      }
    } else {
      // Mock mode
      toast.success('Project created successfully (Mock Mode)');
      setShowCreateDialog(false);
      setNewProject({
        name: '',
        client: '',
        description: '',
        startDate: '',
        endDate: '',
        manager: '',
        status: 'active',
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Projects</h1>
          <p className="text-gray-500">Manage and track all projects</p>
        </div>
        {(user.role === 'admin' || user.role === 'manager') && (
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600">{stats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>On Track</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">{stats.onTrack}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>At Risk</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{stats.atRisk}</p>
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

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigateTo('project-detail', { projectId: project.id })}
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
                  onClick={() => navigateTo('project-detail', { projectId: project.id })}
                >
                  {getHealthIndicator(project.health)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate">{project.name}</p>
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
                <Label htmlFor="manager">Project Manager</Label>
                <Select
                  value={newProject.manager}
                  onValueChange={(value) => setNewProject({ ...newProject, manager: value })}
                >
                  <SelectTrigger id="manager" className="mt-1">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                    <SelectItem value="Admin User">Admin User</SelectItem>
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
