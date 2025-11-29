import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Briefcase, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../../services/api';

const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR: 'hr',
  ADMIN: 'admin',
  FINANCE: 'finance',
};

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Human Resources',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Customer Support'
];

const POSITIONS = [
  // Engineering
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Software Engineer',
  'Principal Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Software Architect',
  'Engineering Manager',
  'Technical Lead',
  
  // Design
  'UI Designer',
  'UX Designer',
  'Product Designer',
  'Graphic Designer',
  'Visual Designer',
  'Design Manager',
  'Creative Director',
  
  // Human Resources
  'HR Coordinator',
  'HR Specialist',
  'HR Manager',
  'Recruiter',
  'Talent Acquisition Specialist',
  'HR Business Partner',
  'Compensation Analyst',
  'HR Director',
  
  // Finance
  'Financial Analyst',
  'Senior Financial Analyst',
  'Accountant',
  'Senior Accountant',
  'Finance Manager',
  'Financial Controller',
  'CFO',
  'Auditor',
  
  // Marketing
  'Marketing Coordinator',
  'Marketing Specialist',
  'Digital Marketing Manager',
  'Content Marketing Manager',
  'SEO Specialist',
  'Social Media Manager',
  'Marketing Director',
  'Brand Manager',
  
  // Sales
  'Sales Representative',
  'Account Executive',
  'Senior Account Executive',
  'Sales Manager',
  'Regional Sales Manager',
  'Business Development Manager',
  'Sales Director',
  'VP of Sales',
  
  // Operations
  'Operations Coordinator',
  'Operations Manager',
  'Supply Chain Manager',
  'Logistics Coordinator',
  'Project Manager',
  'Program Manager',
  'Operations Director',
  'Chief Operating Officer',
  
  // Customer Support
  'Customer Support Representative',
  'Technical Support Specialist',
  'Support Team Lead',
  'Customer Success Manager',
  'Support Manager',
  'Customer Experience Manager',
  'Head of Customer Support'
];

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Intern'
];

const SHIFTS = [
  '9:00 AM - 6:00 PM',
  '10:00 AM - 7:00 PM',
  'Night Shift',
  'Flexible'
];
const LOCATIONS = [
  'India',
    'New York',
  'San Francisco',
  'London',
]

export function AddEmployee() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeId: '',
    role: ROLES.EMPLOYEE,
    department: '',
    position: '',
    manager: '',
    dateOfBirth: '',
    dateOfJoin: '',
    employmentType: '',
    shift: '',
    location: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Generate employee ID only once when component mounts
  useEffect(() => {
    if (!employeeData.employeeId) {
      const generatedId = generateEmployeeId();
      setEmployeeData(prev => ({
        ...prev,
        employeeId: generatedId
      }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setEmployeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateEmployeeId = () => {
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EMP${randomNum}`;
  };

  const handleGenerateNewId = () => {
    const newId = generateEmployeeId();
    setEmployeeData(prev => ({
      ...prev,
      employeeId: newId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!employeeData.firstName || !employeeData.lastName || !employeeData.email || !employeeData.dateOfJoin) {
        toast.error('Please fill all required fields');
        return;
      }

      // Prepare the data for API
      const employeePayload = {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone || undefined,
        employeeId: employeeData.employeeId || undefined,
        role: employeeData.role,
        department: employeeData.department || undefined,
        position: employeeData.position || undefined,
        manager: employeeData.manager || undefined,
        dateOfBirth: employeeData.dateOfBirth || undefined,
        dateOfJoin: employeeData.dateOfJoin,
        employmentType: employeeData.employmentType || undefined,
        shift: employeeData.shift || undefined,
        status: employeeData.status,
        location: employeeData.location || undefined
      };

      // Call the actual API
      const response = await employeeApi.create(employeePayload);
      
      toast.success('Employee added successfully');
      
      // Show success message with email info
      if (response.emailSent) {
        toast.info('Welcome email with credentials has been sent to the employee');
      }
      
      navigate('/employees');
    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast.error(error.message || 'Failed to add employee');
    } finally {
      setIsLoading(false);
    }
  };

  // Format today's date for date input max attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/employees')}
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
          <p className="text-gray-500">Create a new employee profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic personal details of the employee</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={employeeData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={employeeData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={employeeData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john.doe@company.com"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={employeeData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </div>
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={employeeData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  max={getTodayDate()}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfJoin">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Join *
                  </div>
                </Label>
                <Input
                  id="dateOfJoin"
                  type="date"
                  value={employeeData.dateOfJoin}
                  onChange={(e) => handleInputChange('dateOfJoin', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information Section */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            <div>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Job details and role information</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="employeeId"
                    value={employeeData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    placeholder="EMP001"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleGenerateNewId}
                    disabled={isLoading}
                  >
                    Generate
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={employeeData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ROLES.EMPLOYEE}>Employee</SelectItem>
                    <SelectItem value={ROLES.MANAGER}>Manager</SelectItem>
                    <SelectItem value={ROLES.HR}>HR</SelectItem>
                    <SelectItem value={ROLES.ADMIN}>Admin</SelectItem>
                    <SelectItem value={ROLES.FINANCE}>Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={employeeData.department} 
                  onValueChange={(value) => handleInputChange('department', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position/Title</Label>
                <Select 
                  value={employeeData.position} 
                  onValueChange={(value) => handleInputChange('position', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map(position => (
                      <SelectItem key={position} value={position}>{position}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select 
                  value={employeeData.employmentType} 
                  onValueChange={(value) => handleInputChange('employmentType', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select 
                  value={employeeData.shift} 
                  onValueChange={(value) => handleInputChange('shift', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map(shift => (
                      <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select 
                  value={employeeData.location} 
                  onValueChange={(value) => handleInputChange('location', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={employeeData.status} 
                  onValueChange={(value: 'active' | 'inactive') => handleInputChange('status', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/employees')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Adding Employee...' : 'Add Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
}