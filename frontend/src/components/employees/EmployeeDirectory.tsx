import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { User } from '../../App';
import { employeeApi, Employee as ApiEmployee } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface EmployeeDirectoryProps {
  user: User;
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
  position?: string;
  joiningDate?: string;
  employmentType?: string;
  shift?: string;
}

const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR: 'hr',
  ADMIN: 'admin',
  FINANCE: 'finance',
};

export function EmployeeDirectory({ user }: EmployeeDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isLoading, setIsLoading] = useState(false);
  const [apiEmployees, setApiEmployees] = useState<ApiEmployee[]>([]);
  const useApi = apiConfig.hasBaseUrl();
  const navigate = useNavigate();

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
console.log('API Employees:', apiEmployees);
  // Map API employee to local Employee format
  const mapApiEmployeeToLocal = (apiEmp: ApiEmployee): Employee => ({
    id: apiEmp.id.toString(),
    name: apiEmp.name || 'Unknown',
    employeeId: apiEmp.employee_code || 'N/A',
    email: apiEmp.email || 'N/A',
    phone: apiEmp.phone || 'N/A',
    role: apiEmp.position || 'Unknown',
    department: apiEmp.department || 'Unknown',
    location: apiEmp.location || 'N/A',
    manager: apiEmp.manager_name || 'N/A',
    status: (apiEmp.status as 'active' | 'inactive') || 'active',
    avatar: apiEmp.avatar,
  });


  // Use API employees if available, otherwise use mock
  const employees = useApi 
    ? apiEmployees.map(mapApiEmployeeToLocal)
    : [];
    

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filteredEmployees = employees.filter(employee => {
    // Safely handle potentially undefined/null values
    const name = employee.name || '';
    const employeeId = employee.employeeId || '';
    const email = employee.email || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });
console.log('Filtered Employees:', filteredEmployees);
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Check if user has permission to add employees
  const canAddEmployee = user.role === ROLES.ADMIN || user.role === ROLES.HR;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-gray-500">View and manage employee information</p>
        </div>
        {canAddEmployee && (
          <Button 
            className="gap-2" 
            onClick={() => navigate('/employees/new')}
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        )}
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
                    onClick={() => navigate(`/employees/${employee.id}`)}
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
            <div className="text-center text-gray-500 py-8">
              <p>No employees found</p>
              {canAddEmployee && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/employees/new')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Employee
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}