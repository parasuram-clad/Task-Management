import { useState, useEffect } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { User } from '../../App';
import { employeeApi, Employee as ApiEmployee } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';
import { toast } from 'sonner@2.0.3';

interface EmployeeDirectoryProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  manager: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export function EmployeeDirectory({ user, navigateTo }: EmployeeDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [apiEmployees, setApiEmployees] = useState<ApiEmployee[]>([]);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch employees from API
  useEffect(() => {
    if (useApi) {
      fetchEmployees();
    }
  }, [useApi, departmentFilter, statusFilter]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await employeeApi.list(params);
      setApiEmployees(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load employees: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Map API employee to local Employee format
  const mapApiEmployeeToLocal = (apiEmp: ApiEmployee): Employee => ({
    id: apiEmp.id.toString(),
    name: apiEmp.full_name,
    employeeId: apiEmp.employee_id,
    email: apiEmp.email,
    phone: apiEmp.phone || 'N/A',
    role: apiEmp.position,
    department: apiEmp.department,
    location: apiEmp.location || 'N/A',
    manager: apiEmp.manager_name || 'N/A',
    status: apiEmp.status as 'active' | 'inactive',
    avatar: apiEmp.avatar,
  });

  // Mock employees
  const mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'John Doe',
      employeeId: 'EMP001',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8901',
      role: 'Senior Developer',
      department: 'Engineering',
      location: 'New York',
      manager: 'Sarah Johnson',
      status: 'active',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      employeeId: 'EMP002',
      email: 'sarah.johnson@company.com',
      phone: '+1 234 567 8902',
      role: 'Engineering Manager',
      department: 'Engineering',
      location: 'New York',
      manager: 'Mike Chen',
      status: 'active',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      employeeId: 'HR001',
      email: 'mike.wilson@company.com',
      phone: '+1 234 567 8903',
      role: 'HR Manager',
      department: 'Human Resources',
      location: 'San Francisco',
      manager: 'Admin User',
      status: 'active',
    },
    {
      id: '4',
      name: 'Jane Smith',
      employeeId: 'EMP003',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8904',
      role: 'Frontend Developer',
      department: 'Engineering',
      location: 'New York',
      manager: 'Sarah Johnson',
      status: 'active',
    },
    {
      id: '5',
      name: 'Tom Hardy',
      employeeId: 'EMP004',
      email: 'tom.hardy@company.com',
      phone: '+1 234 567 8905',
      role: 'UI/UX Designer',
      department: 'Design',
      location: 'San Francisco',
      manager: 'Sarah Johnson',
      status: 'active',
    },
    {
      id: '6',
      name: 'Emma Watson',
      employeeId: 'EMP005',
      email: 'emma.watson@company.com',
      phone: '+1 234 567 8906',
      role: 'QA Engineer',
      department: 'Engineering',
      location: 'Boston',
      manager: 'Sarah Johnson',
      status: 'active',
    },
  ];

  // Use API employees if available, otherwise use mock
  const employees = useApi 
    ? apiEmployees.map(mapApiEmployeeToLocal)
    : mockEmployees;

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Employee Directory</h1>
        <p className="text-gray-500">View and manage employee information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map(employee => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigateTo('employee-profile', { employeeId: employee.id })}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.location}</TableCell>
                    <TableCell>{employee.manager}</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length === 0 && (
            <p className="text-center text-gray-500 py-8">No employees found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
