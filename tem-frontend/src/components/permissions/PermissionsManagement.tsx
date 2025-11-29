import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Shield,
  Users,
  Search,
  Edit,
  Plus,
  Save,
  X,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Checkbox } from '../ui/checkbox';

interface Permission {
  id: string;
  module: string;
  action: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  user_count: number;
  permissions: string[];
  is_system: boolean;
}

interface RoleUser {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  current_role: string;
}

interface PermissionsManagementProps {
  user: User;
}

// Mock permissions
const mockPermissions: Permission[] = [
  // Dashboard
  { id: 'dashboard.view', module: 'Dashboard', action: 'View Dashboard', description: 'Access to main dashboard' },
  
  // Employees
  { id: 'employees.view', module: 'Employees', action: 'View Employees', description: 'View employee directory' },
  { id: 'employees.create', module: 'Employees', action: 'Create Employee', description: 'Add new employees' },
  { id: 'employees.edit', module: 'Employees', action: 'Edit Employee', description: 'Modify employee details' },
  { id: 'employees.delete', module: 'Employees', action: 'Delete Employee', description: 'Remove employees' },
  
  // Attendance
  { id: 'attendance.view', module: 'Attendance', action: 'View Attendance', description: 'View attendance records' },
  { id: 'attendance.mark', module: 'Attendance', action: 'Mark Attendance', description: 'Mark own attendance' },
  { id: 'attendance.approve', module: 'Attendance', action: 'Approve Attendance', description: 'Approve team attendance' },
  { id: 'attendance.manage', module: 'Attendance', action: 'Manage Attendance', description: 'Full attendance management' },
  
  // Leaves
  { id: 'leaves.view', module: 'Leaves', action: 'View Leaves', description: 'View leave requests' },
  { id: 'leaves.apply', module: 'Leaves', action: 'Apply Leave', description: 'Submit leave requests' },
  { id: 'leaves.approve', module: 'Leaves', action: 'Approve Leaves', description: 'Approve/reject leave requests' },
  { id: 'leaves.manage', module: 'Leaves', action: 'Manage Leave Types', description: 'Configure leave policies' },
  
  // Projects
  { id: 'projects.view', module: 'Projects', action: 'View Projects', description: 'View project details' },
  { id: 'projects.create', module: 'Projects', action: 'Create Project', description: 'Create new projects' },
  { id: 'projects.edit', module: 'Projects', action: 'Edit Project', description: 'Modify project details' },
  { id: 'projects.delete', module: 'Projects', action: 'Delete Project', description: 'Remove projects' },
  
  // Tasks
  { id: 'tasks.view', module: 'Tasks', action: 'View Tasks', description: 'View task lists' },
  { id: 'tasks.create', module: 'Tasks', action: 'Create Task', description: 'Create new tasks' },
  { id: 'tasks.assign', module: 'Tasks', action: 'Assign Tasks', description: 'Assign tasks to team members' },
  { id: 'tasks.update', module: 'Tasks', action: 'Update Task Status', description: 'Update task status' },
  
  // Performance
  { id: 'performance.view', module: 'Performance', action: 'View Appraisals', description: 'View performance reviews' },
  { id: 'performance.submit', module: 'Performance', action: 'Submit Self-Assessment', description: 'Complete self-assessment' },
  { id: 'performance.review', module: 'Performance', action: 'Review Appraisals', description: 'Conduct performance reviews' },
  { id: 'performance.manage', module: 'Performance', action: 'Manage Appraisal Cycles', description: 'Configure appraisal cycles' },
  
  // Documents
  { id: 'documents.view', module: 'Documents', action: 'View Documents', description: 'View documents' },
  { id: 'documents.upload', module: 'Documents', action: 'Upload Documents', description: 'Upload new documents' },
  { id: 'documents.manage', module: 'Documents', action: 'Manage Documents', description: 'Full document management' },
  
  // Reports
  { id: 'reports.view', module: 'Reports', action: 'View Reports', description: 'Access reports' },
  { id: 'reports.export', module: 'Reports', action: 'Export Reports', description: 'Export report data' },
  
  // Settings
  { id: 'settings.company', module: 'Settings', action: 'Company Settings', description: 'Configure company settings' },
  { id: 'settings.roles', module: 'Settings', action: 'Manage Roles', description: 'Manage roles and permissions' },
];

// Mock roles
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    display_name: 'Administrator',
    description: 'Full system access with all permissions',
    user_count: 5,
    permissions: mockPermissions.map(p => p.id),
    is_system: true,
  },
  {
    id: '2',
    name: 'manager',
    display_name: 'Manager',
    description: 'Can manage team members and approve requests',
    user_count: 12,
    permissions: [
      'dashboard.view',
      'employees.view',
      'attendance.view',
      'attendance.approve',
      'leaves.view',
      'leaves.approve',
      'projects.view',
      'projects.create',
      'projects.edit',
      'tasks.view',
      'tasks.create',
      'tasks.assign',
      'tasks.update',
      'performance.view',
      'performance.review',
      'reports.view',
    ],
    is_system: true,
  },
  {
    id: '3',
    name: 'hr',
    display_name: 'HR',
    description: 'Human resources with employee and policy management',
    user_count: 8,
    permissions: [
      'dashboard.view',
      'employees.view',
      'employees.create',
      'employees.edit',
      'attendance.view',
      'attendance.manage',
      'leaves.view',
      'leaves.manage',
      'performance.view',
      'performance.manage',
      'documents.view',
      'documents.upload',
      'documents.manage',
      'reports.view',
      'reports.export',
    ],
    is_system: true,
  },
  {
    id: '4',
    name: 'employee',
    display_name: 'Employee',
    description: 'Basic access for regular employees',
    user_count: 120,
    permissions: [
      'dashboard.view',
      'employees.view',
      'attendance.view',
      'attendance.mark',
      'leaves.view',
      'leaves.apply',
      'tasks.view',
      'tasks.update',
      'performance.view',
      'performance.submit',
      'documents.view',
    ],
    is_system: true,
  },
];

const mockRoleUsers: RoleUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    current_role: 'employee',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    department: 'Engineering',
    designation: 'Tech Lead',
    current_role: 'manager',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    department: 'HR',
    designation: 'HR Manager',
    current_role: 'hr',
  },
];

export function PermissionsManagement({ user }: PermissionsManagementProps) {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [roleData, setRoleData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[],
  });

  const [selectedUser, setSelectedUser] = useState<RoleUser | null>(null);
  const [assignRole, setAssignRole] = useState('');

  const filteredUsers = mockRoleUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPermissions = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handleCreateRole = () => {
    setRoleData({
      name: '',
      display_name: '',
      description: '',
      permissions: [],
    });
    setIsEditing(false);
    setSelectedRole(null);
    setShowRoleDialog(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.is_system) {
      toast.error('System roles cannot be edited');
      return;
    }
    setRoleData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsEditing(true);
    setSelectedRole(role);
    setShowRoleDialog(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isEditing && selectedRole) {
        setRoles(
          roles.map(r =>
            r.id === selectedRole.id
              ? { ...r, ...roleData }
              : r
          )
        );
        toast.success('Role updated successfully');
      } else {
        const newRole: Role = {
          id: `role-${Date.now()}`,
          ...roleData,
          user_count: 0,
          is_system: false,
        };
        setRoles([...roles, newRole]);
        toast.success('Role created successfully');
      }

      setShowRoleDialog(false);
      setSelectedRole(null);
    } catch (error) {
      toast.error('Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !assignRole) {
      toast.error('Please select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Role assigned to ${selectedUser.name} successfully`);
      setShowAssignDialog(false);
      setSelectedUser(null);
      setAssignRole('');
    } catch (error) {
      toast.error('Failed to assign role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (roleData.permissions.includes(permissionId)) {
      setRoleData({
        ...roleData,
        permissions: roleData.permissions.filter(p => p !== permissionId),
      });
    } else {
      setRoleData({
        ...roleData,
        permissions: [...roleData.permissions, permissionId],
      });
    }
  };

  const getRoleBadge = (roleName: string) => {
    const role = roles.find(r => r.name === roleName);
    const variants: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-700',
      'manager': 'bg-blue-100 text-blue-700',
      'hr': 'bg-green-100 text-green-700',
      'employee': 'bg-gray-100 text-gray-700',
    };

    return (
      <Badge className={variants[roleName] || 'bg-gray-100 text-gray-700'} variant="secondary">
        {role?.display_name || roleName}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Permissions & Access Control</h1>
            <p className="text-muted-foreground">
              Manage roles, permissions, and user access
            </p>
          </div>
          <Button onClick={handleCreateRole}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl">{roles.reduce((sum, r) => sum + r.user_count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permissions</p>
                <p className="text-2xl">{mockPermissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custom Roles</p>
                <p className="text-2xl">{roles.filter(r => !r.is_system).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            All Permissions
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Roles
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className={role.is_system ? 'border-primary/20' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{role.display_name}</CardTitle>
                        {role.is_system && (
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    {!role.is_system && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Users assigned</span>
                      <Badge variant="secondary">{role.user_count} users</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Permissions</span>
                      <Badge variant="secondary">{role.permissions.length} granted</Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleData({
                          name: role.name,
                          display_name: role.display_name,
                          description: role.description,
                          permissions: role.permissions,
                        });
                        setShowRoleDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All System Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      {module}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <Unlock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{permission.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.designation}</TableCell>
                      <TableCell>{getRoleBadge(user.current_role)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setAssignRole(user.current_role);
                            setShowAssignDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Change Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Role' : selectedRole ? 'Role Details' : 'Create Custom Role'}
            </DialogTitle>
            <DialogDescription>
              {selectedRole && !isEditing
                ? 'View role permissions and settings'
                : 'Configure role permissions and access levels'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRole} className="space-y-6">
            {(!selectedRole || isEditing) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={roleData.display_name}
                      onChange={(e) =>
                        setRoleData({ ...roleData, display_name: e.target.value })
                      }
                      placeholder="e.g., Project Manager"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Role ID *</Label>
                    <Input
                      id="name"
                      value={roleData.name}
                      onChange={(e) =>
                        setRoleData({ ...roleData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                      }
                      placeholder="e.g., project_manager"
                      required
                      disabled={isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={roleData.description}
                    onChange={(e) =>
                      setRoleData({ ...roleData, description: e.target.value })
                    }
                    placeholder="Brief description of this role"
                  />
                </div>
              </>
            )}

            <div>
              <h3 className="font-semibold mb-4">Permissions</h3>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <Card key={module}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{module}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {perms.map((permission) => {
                          const isGranted = roleData.permissions.includes(permission.id);
                          const isReadOnly = selectedRole && !isEditing;

                          return (
                            <div
                              key={permission.id}
                              className="flex items-start gap-3 p-2 rounded hover:bg-gray-50"
                            >
                              <Checkbox
                                id={permission.id}
                                checked={isGranted}
                                onCheckedChange={() => !isReadOnly && togglePermission(permission.id)}
                                disabled={isReadOnly}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={permission.id}
                                  className="font-medium cursor-pointer"
                                >
                                  {permission.action}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                              {isGranted && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {(!selectedRole || isEditing) && (
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRoleDialog(false);
                  setSelectedRole(null);
                  setIsEditing(false);
                }}
              >
                {selectedRole && !isEditing ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Role</Label>
              <select
                className="w-full p-2 border rounded-md mt-2"
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAssignRole} disabled={isSubmitting}>
                {isSubmitting ? 'Assigning...' : 'Assign Role'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAssignDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
