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
  position: string;
  department: string;
  location: string;
  manager: string;
  status: 'active' | 'inactive';
  is_active?: boolean;
  avatar?: string;
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [apiEmployees, setApiEmployees] = useState<ApiEmployee[]>([]);
  const useApi = apiConfig.hasBaseUrl();
  const navigate = useNavigate();

  // Fetch employees from API
  useEffect(() => {
    if (useApi) {
      fetchEmployees();
    }
  }, [useApi]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await employeeApi.list();
      setApiEmployees(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load employees: ${error.message}`);
      } else {
        toast.error('Failed to load employees');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Map API employee to local Employee format - FIXED VERSION
  const mapApiEmployeeToLocal = (apiEmp: ApiEmployee): Employee => ({
    id: apiEmp.id.toString(),
    name: apiEmp.name || `${apiEmp.firstName || ''} ${apiEmp.lastName || ''}`.trim() || 'Unknown',
    employeeId: apiEmp.employee_code || apiEmp.employee_id || 'N/A',
    email: apiEmp.email || 'N/A',
    phone: apiEmp.phone || 'N/A',
    role: apiEmp.role || 'employee', // This is the user role (admin, hr, manager, etc.)
    position: apiEmp.position || apiEmp.designation || 'Employee', // This is the job position
    department: apiEmp.department || 'Not specified',
    location: apiEmp.location || 'Not specified',
    manager: apiEmp.manager || 'Not assigned',
    status: apiEmp.is_active ? 'active' : 'inactive',
    is_active: apiEmp.is_active,
    avatar: apiEmp.avatar,
  });

  // Use API employees if available
  const employees = useApi ? apiEmployees.map(mapApiEmployeeToLocal) : [];

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  const filteredEmployees = employees.filter(employee => {
    const name = employee.name || '';
    const employeeId = employee.employeeId || '';
    const email = employee.email || '';
    const position = employee.position || '';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
                             employee.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if user has permission to add employees
  const canAddEmployee = user.role === ROLES.ADMIN || user.role === ROLES.HR;

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

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
                placeholder="Search by name, ID, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
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
                  <TableHead className="font-semibold">Employee</TableHead>
                  <TableHead className="font-semibold">Position</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Location</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{employee.name}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{employee.email}</span>
                            </div>
                            {employee.phone && employee.phone !== 'N/A' && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="w-3 h-3" />
                                <span>{employee.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.position}</span>
                          <span className="text-sm text-gray-500">{employee.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{employee.location}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(employee.status)}>
                          {employee.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        <p>No employees found</p>
                        {canAddEmployee && searchTerm && (
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => navigate('/employees/new')}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Employee
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}