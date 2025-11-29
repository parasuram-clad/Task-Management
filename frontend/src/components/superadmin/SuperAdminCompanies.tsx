import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  MoreVertical,
  Power,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { toast } from 'sonner@2.0.3';
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

interface SuperAdminCompaniesProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

export function SuperAdminCompanies({ user, navigateTo }: SuperAdminCompaniesProps) {
  const { allCompanies, toggleCompanyStatus, deleteCompany, refreshData } = useSuperAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);

  const filteredCompanies = allCompanies.filter(company => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || company.plan === filterPlan;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && company.is_active) ||
      (filterStatus === 'inactive' && !company.is_active);

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleToggleStatus = async (companyId: number) => {
    try {
      await toggleCompanyStatus(companyId);
      toast.success('Company status updated');
      await refreshData();
    } catch (error) {
      toast.error('Failed to update company status');
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      await deleteCompany(companyToDelete);
      toast.success('Company deleted successfully');
      setCompanyToDelete(null);
      await refreshData();
    } catch (error) {
      toast.error('Failed to delete company');
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, string> = {
      free: 'bg-gray-100 text-gray-700',
      basic: 'bg-blue-100 text-blue-700',
      professional: 'bg-purple-100 text-purple-700',
      enterprise: 'bg-orange-100 text-orange-700',
    };

    return (
      <Badge className={variants[plan] || variants.free} variant="secondary">
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Company Management</h1>
            <p className="text-muted-foreground">
              Manage all companies on the platform
            </p>
          </div>
          <Button onClick={() => navigateTo('superadmin-create-company')}>
            <Plus className="h-4 w-4 mr-2" />
            New Company
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
            <p className="text-2xl">{allCompanies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-2xl text-green-600">
              {allCompanies.filter(c => c.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Inactive</p>
            <p className="text-2xl text-red-600">
              {allCompanies.filter(c => !c.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Users</p>
            <p className="text-2xl">
              {allCompanies.reduce((sum, c) => sum + c.user_count, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Subscription End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getPlanBadge(company.plan)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {company.user_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        company.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }
                      variant="secondary"
                    >
                      {company.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {company.subscription_end_date
                      ? new Date(company.subscription_end_date).toLocaleDateString()
                      : 'N/A'}
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
                          onClick={() =>
                            navigateTo('superadmin-edit-company', {
                              companyId: company.id,
                            })
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigateTo('superadmin-company-users', {
                              companyId: company.id,
                            })
                          }
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            navigateTo('superadmin-company-config', {
                              companyId: company.id,
                            })
                          }
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Features
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(company.id)}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          {company.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setCompanyToDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No companies found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or create a new company
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company? This action cannot be undone
              and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}