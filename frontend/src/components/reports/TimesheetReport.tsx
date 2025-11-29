import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { reportsApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface TimesheetReportProps {
  user: User;
}

export function TimesheetReport({ user }: TimesheetReportProps) {
  const [startDate, setStartDate] = useState('2024-11-01');
  const [endDate, setEndDate] = useState('2024-11-07');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [apiEmployeeData, setApiEmployeeData] = useState<any[]>([]);
  const [apiProjectData, setApiProjectData] = useState<any[]>([]);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch report when filters change
  useEffect(() => {
    if (useApi) {
      fetchReport();
    }
  }, [startDate, endDate, projectFilter, useApi]);

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
      const data = await reportsApi.timesheetReport(params);
      setApiEmployeeData(data.byEmployee || []);
      setApiProjectData(data.byProject || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load report: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data - by employee
  const mockEmployeeData = [
    { employeeId: 'EMP001', employeeName: 'John Doe', department: 'Engineering', totalHours: 42, billableHours: 40, projects: 2 },
    { employeeId: 'EMP002', employeeName: 'Sarah Johnson', department: 'Engineering', totalHours: 40, billableHours: 40, projects: 3 },
    { employeeId: 'EMP003', employeeName: 'Jane Smith', department: 'Engineering', totalHours: 38, billableHours: 35, projects: 2 },
    { employeeId: 'EMP004', employeeName: 'Mike Wilson', department: 'Engineering', totalHours: 40, billableHours: 38, projects: 1 },
    { employeeId: 'EMP005', employeeName: 'Tom Hardy', department: 'Design', totalHours: 35, billableHours: 32, projects: 2 },
  ];

  // Mock data - by project
  const mockProjectData = [
    { 
      projectId: 'PRJ001', 
      projectName: 'E-commerce Platform', 
      totalHours: 120, 
      allocatedHours: 200,
      employees: [
        { name: 'John Doe', hours: 34 },
        { name: 'Jane Smith', hours: 30 },
        { name: 'Sarah Johnson', hours: 28 },
        { name: 'Mike Wilson', hours: 28 },
      ]
    },
    { 
      projectId: 'PRJ002', 
      projectName: 'Mobile App Redesign', 
      totalHours: 65, 
      allocatedHours: 150,
      employees: [
        { name: 'John Doe', hours: 8 },
        { name: 'Sarah Johnson', hours: 12 },
        { name: 'Tom Hardy', hours: 25 },
        { name: 'Jane Smith', hours: 20 },
      ]
    },
    { 
      projectId: 'PRJ003', 
      projectName: 'API Integration', 
      totalHours: 50, 
      allocatedHours: 100,
      employees: [
        { name: 'Mike Wilson', hours: 40 },
        { name: 'Tom Hardy', hours: 10 },
      ]
    },
  ];

  // Use API data if available, otherwise use mock
  const employeeData = useApi ? apiEmployeeData : mockEmployeeData;
  const projectData = useApi ? apiProjectData : mockProjectData;

  const projects = ['E-commerce Platform', 'Mobile App Redesign', 'API Integration'];

  const filteredProjectData = projectFilter === 'all' 
    ? projectData 
    : projectData.filter(p => p.projectName === projectFilter);

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  const employeeTotals = {
    totalHours: employeeData.reduce((sum, row) => sum + row.totalHours, 0),
    billableHours: employeeData.reduce((sum, row) => sum + row.billableHours, 0),
  };

  const projectTotals = {
    totalHours: filteredProjectData.reduce((sum, row) => sum + row.totalHours, 0),
    allocatedHours: filteredProjectData.reduce((sum, row) => sum + row.allocatedHours, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Timesheet Report</h1>
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
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="by-employee" className="space-y-4">
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
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p>{employeeTotals.totalHours} hours</p>
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
                      <TableHead className="text-center">Projects</TableHead>
                      <TableHead className="text-right">Total Hours</TableHead>
                      <TableHead className="text-right">Billable Hours</TableHead>
                      <TableHead className="text-right">Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeData.map(row => (
                      <TableRow key={row.employeeId}>
                        <TableCell>
                          <div>
                            <p>{row.employeeName}</p>
                            <p className="text-sm text-gray-500">{row.employeeId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{row.department}</TableCell>
                        <TableCell className="text-center">{row.projects}</TableCell>
                        <TableCell className="text-right">{row.totalHours} hrs</TableCell>
                        <TableCell className="text-right">{row.billableHours} hrs</TableCell>
                        <TableCell className="text-right">
                          {((row.billableHours / row.totalHours) * 100).toFixed(0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className="text-right">{employeeTotals.totalHours} hrs</TableCell>
                      <TableCell className="text-right">{employeeTotals.billableHours} hrs</TableCell>
                      <TableCell className="text-right">
                        {((employeeTotals.billableHours / employeeTotals.totalHours) * 100).toFixed(0)}%
                      </TableCell>
                    </TableRow>
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
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p>{projectTotals.totalHours} / {projectTotals.allocatedHours} hours</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredProjectData.map(project => (
                <Card key={project.projectId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{project.projectName}</CardTitle>
                        <CardDescription className="text-xs">{project.projectId}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p>{project.totalHours} / {project.allocatedHours} hrs</p>
                        <p className="text-xs text-gray-500">
                          {((project.totalHours / project.allocatedHours) * 100).toFixed(0)}% utilized
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.employees.map((employee, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{employee.name}</span>
                          <span className="text-sm">{employee.hours} hrs</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
