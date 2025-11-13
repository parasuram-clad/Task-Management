import { useState, useEffect } from 'react';
import { Download, ChevronDown, ChevronRight, Users, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import { User as UserType } from '../../App';
import { reportsApi, projectApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface TimesheetReportProps {
  user: UserType;
}

interface EmployeeData {
  employeeId: string;
  employeeName: string;
  department: string;
  totalHours: number;
  projects: number;
  projectNames: string;
}

interface ProjectData {
  projectId: string;
  projectName: string;
  totalHours: number;
  employees: Array<{
    name: string;
    hours: number;
  }>;
}

interface Project {
  id: number;
  name: string;
  start_date?: string;
  end_date?: string;
  manager_name?: string;
  client?: string;
  description?: string;
  status?: string;
}

interface ExpandedProjectData extends ProjectData {
  projectDetails?: Project;
  numericProjectId?: number; // Add this to store the numeric ID
}

// Helper function to get current week dates
const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

// Helper function to extract numeric ID from formatted projectId
const extractNumericProjectId = (projectId: string): number => {
  // Handle formats like "PRJ001", "PROJ001", or just numeric IDs
  const numericPart = projectId.replace(/[^0-9]/g, '');
  return numericPart ? parseInt(numericPart, 10) : 0;
};

// Helper function to export to Excel
const exportToExcel = (employeeData: EmployeeData[], projectData: ExpandedProjectData[], startDate: string, endDate: string, activeTab: string) => {
  let csvContent = '';
  let filename = '';

  if (activeTab === 'by-employee') {
    // Employee report
    const employeeHeaders = ['Employee ID', 'Employee Name', 'Department', 'Projects', 'Project Names', 'Total Hours'];
    
    csvContent = [
      employeeHeaders.join(','),
      ...employeeData.map(row => [
        `"${row.employeeId}"`,
        `"${row.employeeName}"`,
        `"${row.department}"`,
        row.projects,
        `"${row.projectNames}"`,
        row.totalHours.toFixed(1)
      ].join(','))
    ].join('\n');

    filename = `timesheet-employee-report-${startDate}-to-${endDate}.csv`;
  } else {
    // Project report - Updated to include Project Manager
    const projectHeaders = ['Project ID', 'Project Name', 'Project Manager', 'Employee Name', 'Hours', 'Total Project Hours'];
    
    const projectRows: string[][] = [];
    projectData.forEach(project => {
      const projectManager = project.projectDetails?.manager_name || 'Not assigned';
      
      if (project.employees.length === 0) {
        projectRows.push([
          `"${project.projectId}"`,
          `"${project.projectName}"`,
          `"${projectManager}"`,
          'No employees',
          '0',
          project.totalHours.toFixed(1)
        ]);
      } else {
        project.employees.forEach(employee => {
          projectRows.push([
            `"${project.projectId}"`,
            `"${project.projectName}"`,
            `"${projectManager}"`,
            `"${employee.name}"`,
            employee.hours.toFixed(1),
            project.totalHours.toFixed(1)
          ]);
        });
      }
    });

    csvContent = [
      projectHeaders.join(','),
      ...projectRows.map(row => row.join(','))
    ].join('\n');

    filename = `timesheet-project-report-${startDate}-to-${endDate}.csv`;
  }

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Project Row Component
interface ProjectRowProps {
  project: ExpandedProjectData;
  isExpanded: boolean;
  onToggle: () => void;
}

const ProjectRow = ({ project, isExpanded, onToggle }: ProjectRowProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <TableRow 
        className="hover:bg-gray-50 cursor-pointer" 
        onClick={onToggle}
      >
        <TableCell className="w-8">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">{project.projectName}</p>
            <p className="text-sm text-gray-500">{project.projectId}</p>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{project.projectDetails?.manager_name || 'Not assigned'}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{project.employees.length} members</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <span className="font-semibold">{project.totalHours.toFixed(1)} hrs</span>
        </TableCell>
      </TableRow>
      
      {isExpanded && project.projectDetails && (
        <TableRow className="bg-blue-50">
          <TableCell colSpan={5} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Details
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Project ID</p>
                    <p className="font-medium">{project.projectId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge className={getStatusColor(project.projectDetails.status)}>
                      {project.projectDetails.status || 'Unknown'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="font-medium">{formatDate(project.projectDetails.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Date</p>
                    <p className="font-medium">{formatDate(project.projectDetails.end_date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Project Manager</p>
                    <p className="font-medium">{project.projectDetails.manager_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Client</p>
                    <p className="font-medium">{project.projectDetails.client || 'Not specified'}</p>
                  </div>
                </div>
                
                {project.projectDetails.description && (
                  <div>
                    <p className="text-gray-500 mb-1">Description</p>
                    <p className="text-sm">{project.projectDetails.description}</p>
                  </div>
                )}
              </div>

              {/* Team Members & Hours */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members & Hours
                </h4>
                
                {project.employees.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No team members found for this project
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.employees.map((employee, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{employee.name}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
                          {employee.hours.toFixed(1)} hrs
                        </Badge>
                      </div>
                    ))}
                    
                    {/* Total Hours Summary */}
                    <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg border border-blue-200">
                      <span className="font-semibold text-blue-800">Total Project Hours</span>
                      <Badge className="bg-blue-600 text-white font-semibold">
                        {project.totalHours.toFixed(1)} hrs
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export function TimesheetReport({ user }: TimesheetReportProps) {
  const currentWeek = getCurrentWeekDates();
  const [startDate, setStartDate] = useState(currentWeek.startDate);
  const [endDate, setEndDate] = useState(currentWeek.endDate);
  const [projectFilter, setProjectFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [projectData, setProjectData] = useState<ExpandedProjectData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState('by-employee');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Fetch projects for filter
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch report when filters change
  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, projectFilter]);

  const fetchProjects = async () => {
    try {
      const data = await projectApi.list();
      setProjects(data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        startDate,
        endDate,
      };

      if (projectFilter !== 'all') {
        params.projectId = projectFilter;
      }

      console.log('Fetching report with params:', params);

      const data = await reportsApi.timesheetReport(params);
      console.log('Timesheet report data:', data);
      
      // Enhance project data with project details and numeric IDs
      const enhancedProjectData = await Promise.all(
        (data.byProject || []).map(async (project: ProjectData) => {
          try {
            // Extract numeric ID from projectId (remove PRJ prefix)
            const numericProjectId = extractNumericProjectId(project.projectId);
            console.log(`Extracted numeric ID ${numericProjectId} from ${project.projectId}`);
            
            const projectDetails = await projectApi.get(numericProjectId);
            return {
              ...project,
              projectDetails,
              numericProjectId // Store the numeric ID for filtering
            };
          } catch (error) {
            console.error(`Failed to fetch details for project ${project.projectId}:`, error);
            return {
              ...project,
              numericProjectId: extractNumericProjectId(project.projectId)
            };
          }
        })
      );

      setEmployeeData(data.byEmployee || []);
      setProjectData(enhancedProjectData);
      setExpandedProjects(new Set()); // Reset expanded state when data changes
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load report: ${error.message}`);
      } else {
        toast.error('Failed to load timesheet report');
      }
      setEmployeeData([]);
      setProjectData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      if ((activeTab === 'by-employee' && employeeData.length === 0) || 
          (activeTab === 'by-project' && projectData.length === 0)) {
        toast.error('No data to export');
        return;
      }

      exportToExcel(employeeData, projectData, startDate, endDate, activeTab);
      toast.success('Timesheet report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // FIXED: Filter project data based on numeric project ID
  const filteredProjectData = projectFilter === 'all' 
    ? projectData 
    : projectData.filter(p => {
        const filterId = parseInt(projectFilter, 10);
        const projectNumericId = p.numericProjectId || extractNumericProjectId(p.projectId);
        console.log(`Filtering: ${projectNumericId} === ${filterId}`, projectNumericId === filterId);
        return projectNumericId === filterId;
      });

  const employeeTotals = {
    totalHours: employeeData.reduce((sum, row) => sum + row.totalHours, 0),
  };

  const projectTotals = {
    totalHours: filteredProjectData.reduce((sum, row) => sum + row.totalHours, 0),
    totalProjects: filteredProjectData.length,
    totalEmployees: filteredProjectData.reduce((sum, project) => sum + project.employees.length, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Timesheet Report</h1>
        <p className="text-gray-500">Analyze time allocation and project hours</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range and filters for the report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Project</label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleExport} 
                className="w-full gap-2" 
                disabled={isLoading || 
                  (activeTab === 'by-employee' && employeeData.length === 0) || 
                  (activeTab === 'by-project' && projectData.length === 0)}
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="by-employee" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="by-employee">By Employee</TabsTrigger>
          <TabsTrigger value="by-project">By Project</TabsTrigger>
        </TabsList>

        <TabsContent value="by-employee">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hours by Employee</CardTitle>
                  <CardDescription>
                    Report for {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="font-semibold">{employeeTotals.totalHours.toFixed(1)} hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-center">Projects Count</TableHead>
                      <TableHead>Project Names</TableHead>
                      <TableHead className="text-right">Total Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {isLoading ? 'Loading employee data...' : 'No timesheet data found for the selected filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {employeeData.map(row => (
                          <TableRow key={row.employeeId}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{row.employeeName}</p>
                                <p className="text-sm text-gray-500">{row.employeeId}</p>
                              </div>
                            </TableCell>
                            <TableCell>{row.department}</TableCell>
                            <TableCell className="text-center">{row.projects}</TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="text-sm text-gray-600 truncate" title={row.projectNames}>
                                  {row.projectNames || 'No projects'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{row.totalHours.toFixed(1)} hrs</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 bg-gray-50">
                          <TableCell colSpan={4} className="font-semibold">Total</TableCell>
                          <TableCell className="text-right font-semibold">{employeeTotals.totalHours.toFixed(1)} hrs</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-project">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Hours by Project</CardTitle>
                  <CardDescription>
                    Report for {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                    {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="font-semibold">{projectTotals.totalHours.toFixed(1)} hours</p>
                  <p className="text-xs text-gray-500">
                    {projectTotals.totalProjects} projects • {projectTotals.totalEmployees} team members
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Project Manager</TableHead>
                      <TableHead>Team Members</TableHead>
                      <TableHead className="text-right">Total Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjectData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          {isLoading ? 'Loading project data...' : 'No project data found for the selected filters'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {filteredProjectData.map(project => (
                          <ProjectRow
                            key={project.projectId}
                            project={project}
                            isExpanded={expandedProjects.has(project.projectId)}
                            onToggle={() => toggleProjectExpansion(project.projectId)}
                          />
                        ))}
                        <TableRow className="border-t-2 bg-gray-50 font-semibold">
                          <TableCell colSpan={4}>Total</TableCell>
                          <TableCell className="text-right">{projectTotals.totalHours.toFixed(1)} hrs</TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}