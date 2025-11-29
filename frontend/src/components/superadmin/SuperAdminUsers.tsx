import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Mail,
  Building2,
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface SuperAdminUsersProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

export function SuperAdminUsers({ user, navigateTo }: SuperAdminUsersProps) {
  const {
    allUsers,
    allCompanies,
    userCompanyAssignments,
    createUser,
    updateUser,
    deleteUser,
    assignUserToCompany,
    refreshData,
  } = useSuperAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAssignUser, setShowAssignUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    is_super_admin: false,
  });

  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    is_super_admin: false,
  });

  const [assignmentData, setAssignmentData] = useState({
    company_id: '',
    role: 'employee',
  });

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserCompanies = (userId: number) => {
    const companyIds = userCompanyAssignments
      .filter((a) => a.user_id === userId)
      .map((a) => a.company_id);
    return allCompanies.filter((c) => companyIds.includes(c.id));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createUser(newUserData);
      toast.success('User created successfully');
      setShowCreateUser(false);
      setNewUserData({ name: '', email: '', is_super_admin: false });
      await refreshData();
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsSubmitting(true);

    try {
      await updateUser(selectedUserId, editUserData);
      toast.success('User updated successfully');
      setShowEditUser(false);
      setEditUserData({ name: '', email: '', is_super_admin: false });
      await refreshData();
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setIsSubmitting(true);

    try {
      await assignUserToCompany(
        selectedUserId,
        parseInt(assignmentData.company_id),
        assignmentData.role
      );
      toast.success('User assigned to company');
      setShowAssignUser(false);
      setAssignmentData({ company_id: '', role: 'employee' });
      await refreshData();
    } catch (error) {
      toast.error('Failed to assign user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSubmitting(true);

    try {
      await deleteUser(userToDelete);
      toast.success('User deleted successfully');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      await refreshData();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage all users across the platform
            </p>
          </div>
          <Button onClick={() => setShowCreateUser(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New User
          </Button>
        </div>

        {/* Search */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Users</p>
            <p className="text-2xl">{allUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Super Admins</p>
            <p className="text-2xl text-purple-600">
              {allUsers.filter((u) => u.is_super_admin).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Regular Users</p>
            <p className="text-2xl text-blue-600">
              {allUsers.filter((u) => !u.is_super_admin).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => {
                const userCompanies = getUserCompanies(u.id);
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {u.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {u.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {u.is_super_admin ? (
                        <Badge className="bg-purple-100 text-purple-700">
                          Super Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Regular User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {userCompanies.length > 0 ? (
                          userCompanies.slice(0, 2).map((company) => (
                            <Badge key={company.id} variant="outline" className="text-xs">
                              {company.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                        {userCompanies.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{userCompanies.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setEditUserData({ name: u.name, email: u.email, is_super_admin: u.is_super_admin });
                              setShowEditUser(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setUserToDelete(u.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setShowAssignUser(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign to Company
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigateTo('superadmin-user-companies', { userId: u.id })
                            }
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            View Companies
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No users found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or create a new user
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the platform
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newUserData.name}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_super_admin"
                checked={newUserData.is_super_admin}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, is_super_admin: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="is_super_admin">Make Super Admin</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateUser(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_super_admin"
                checked={editUserData.is_super_admin}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, is_super_admin: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="is_super_admin">Make Super Admin</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedUserId}
              >
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditUser(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign User to Company Dialog */}
      <Dialog open={showAssignUser} onOpenChange={setShowAssignUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign User to Company</DialogTitle>
            <DialogDescription>
              Add this user to a company workspace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignUser} className="space-y-4">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Select
                value={assignmentData.company_id}
                onValueChange={(value) =>
                  setAssignmentData({ ...assignmentData, company_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {allCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={assignmentData.role}
                onValueChange={(value) =>
                  setAssignmentData({ ...assignmentData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !assignmentData.company_id}
              >
                {isSubmitting ? 'Assigning...' : 'Assign User'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAssignUser(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}