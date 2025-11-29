import { useState, useEffect } from 'react';
import { Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { reportsApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface AttendanceReportProps {
  user: User;
}

export function AttendanceReport({ user }: AttendanceReportProps) {
  const [startDate, setStartDate] = useState('2024-11-01');
  const [endDate, setEndDate] = useState('2024-11-07');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [apiReportData, setApiReportData] = useState<any[]>([]);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch report when filters change
  useEffect(() => {
    if (useApi) {
      fetchReport();
    }
  }, [startDate, endDate, departmentFilter, useApi]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        startDate,
        endDate,
      };
      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
      }
      const data = await reportsApi.attendanceReport(params);
      setApiReportData(data.data || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load report: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock report data
  const mockReportData = [
    {
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      department: 'Engineering',
      location: 'New York',
      daysPresent: 5,
      daysAbsent: 0,
      leaves: 0,
      lateArrivals: 1,
      earlyCheckouts: 0,
      totalHours: 42.5,
    },
    {
      employeeId: 'EMP002',
      employeeName: 'Sarah Johnson',
      department: 'Engineering',
      location: 'New York',
      daysPresent: 5,
      daysAbsent: 0,
      leaves: 0,
      lateArrivals: 0,
      earlyCheckouts: 0,
      totalHours: 40.0,
    },
    {
      employeeId: 'EMP003',
      employeeName: 'Jane Smith',
      department: 'Engineering',
      location: 'New York',
      daysPresent: 4,
      daysAbsent: 0,
      leaves: 1,
      lateArrivals: 0,
      earlyCheckouts: 0,
      totalHours: 32.0,
    },
    {
      employeeId: 'EMP004',
      employeeName: 'Mike Wilson',
      department: 'Engineering',
      location: 'San Francisco',
      daysPresent: 5,
      daysAbsent: 0,
      leaves: 0,
      lateArrivals: 2,
      earlyCheckouts: 1,
      totalHours: 38.5,
    },
    {
      employeeId: 'EMP005',
      employeeName: 'Tom Hardy',
      department: 'Design',
      location: 'San Francisco',
      daysPresent: 4,
      daysAbsent: 1,
      leaves: 0,
      lateArrivals: 0,
      earlyCheckouts: 0,
      totalHours: 32.0,
    },
  ];

  // Use API data if available, otherwise use mock
  const reportData = useApi ? apiReportData : mockReportData;

  const departments = ['Engineering', 'Design', 'Human Resources'];

  const filteredData = reportData.filter(row => 
    departmentFilter === 'all' || row.department === departmentFilter
  );

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  const totals = {
    daysPresent: filteredData.reduce((sum, row) => sum + row.daysPresent, 0),
    daysAbsent: filteredData.reduce((sum, row) => sum + row.daysAbsent, 0),
    leaves: filteredData.reduce((sum, row) => sum + row.leaves, 0),
    lateArrivals: filteredData.reduce((sum, row) => sum + row.lateArrivals, 0),
    earlyCheckouts: filteredData.reduce((sum, row) => sum + row.earlyCheckouts, 0),
    totalHours: filteredData.reduce((sum, row) => sum + row.totalHours, 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Attendance Report</h1>
        <p className="text-gray-500">Generate and export attendance reports</p>
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
              <label className="text-sm mb-2 block">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Report for {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-green-600">{totals.daysPresent}</p>
              <p className="text-xs text-gray-600">Total Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-red-600">{totals.daysAbsent}</p>
              <p className="text-xs text-gray-600">Total Absent</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-600">{totals.leaves}</p>
              <p className="text-xs text-gray-600">Total Leaves</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-yellow-600">{totals.lateArrivals}</p>
              <p className="text-xs text-gray-600">Late Arrivals</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-orange-600">{totals.earlyCheckouts}</p>
              <p className="text-xs text-gray-600">Early Checkouts</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p>{totals.totalHours.toFixed(1)}h</p>
              <p className="text-xs text-gray-600">Total Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Days Present</TableHead>
                  <TableHead className="text-center">Days Absent</TableHead>
                  <TableHead className="text-center">Leaves</TableHead>
                  <TableHead className="text-center">Late Arrivals</TableHead>
                  <TableHead className="text-center">Early Checkouts</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(row => (
                  <TableRow key={row.employeeId}>
                    <TableCell>
                      <div>
                        <p>{row.employeeName}</p>
                        <p className="text-sm text-gray-500">{row.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600">{row.daysPresent}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={row.daysAbsent > 0 ? 'text-red-600' : ''}>
                        {row.daysAbsent}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{row.leaves}</TableCell>
                    <TableCell className="text-center">
                      <span className={row.lateArrivals > 0 ? 'text-yellow-600' : ''}>
                        {row.lateArrivals}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={row.earlyCheckouts > 0 ? 'text-orange-600' : ''}>
                        {row.earlyCheckouts}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{row.totalHours.toFixed(1)} hrs</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
