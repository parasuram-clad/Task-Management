import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Settings,
  Users,
  TrendingUp,
  Umbrella,
  Activity,
  Plane,
  Heart,
  Home,
  Edit,
  Trash2,
  BarChart3,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';

interface LeaveType {
  id: string;
  name: string;
  icon: any;
  days_per_year: number;
  color: string;
  carry_forward: boolean;
  max_carry_forward: number;
  requires_document: boolean;
  is_active: boolean;
}

interface EmployeeLeave {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  type: string;
  from_date: string;
  to_date: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
}

interface LeaveManagementProps {
  user: User;
}

// Mock data
const mockLeaveTypes: LeaveType[] = [
  {
    id: '1',
    name: 'Casual Leave',
    icon: Umbrella,
    days_per_year: 12,
    color: 'blue',
    carry_forward: true,
    max_carry_forward: 5,
    requires_document: false,
    is_active: true,
  },
  {
    id: '2',
    name: 'Sick Leave',
    icon: Activity,
    days_per_year: 10,
    color: 'red',
    carry_forward: false,
    max_carry_forward: 0,
    requires_document: true,
    is_active: true,
  },
  {
    id: '3',
    name: 'Privilege Leave',
    icon: Plane,
    days_per_year: 15,
    color: 'purple',
    carry_forward: true,
    max_carry_forward: 10,
    requires_document: false,
    is_active: true,
  },
  {
    id: '4',
    name: 'Maternity/Paternity',
    icon: Heart,
    days_per_year: 90,
    color: 'pink',
    carry_forward: false,
    max_carry_forward: 0,
    requires_document: true,
    is_active: true,
  },
  {
    id: '5',
    name: 'Work From Home',
    icon: Home,
    days_per_year: 24,
    color: 'green',
    carry_forward: false,
    max_carry_forward: 0,
    requires_document: false,
    is_active: true,
  },
];

const mockEmployeeLeaves: EmployeeLeave[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'John Doe',
    department: 'Engineering',
    type: 'Casual Leave',
    from_date: '2024-12-20',
    to_date: '2024-12-22',
    days: 3,
    status: 'pending',
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: 'Sarah Johnson',
    department: 'Engineering',
    type: 'Privilege Leave',
    from_date: '2024-11-10',
    to_date: '2024-11-14',
    days: 5,
    status: 'approved',
    approved_by: 'Mike Chen',
  },
  {
    id: '3',
    employee_id: '3',
    employee_name: 'Mike Chen',
    department: 'Engineering',
    type: 'Sick Leave',
    from_date: '2024-10-15',
    to_date: '2024-10-16',
    days: 2,
    status: 'approved',
    approved_by: 'Sarah Johnson',
  },
];

export function LeaveManagement({ user }: LeaveManagementProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(mockLeaveTypes);
  const [showLeaveTypeDialog, setShowLeaveTypeDialog] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaveTypeData, setLeaveTypeData] = useState({
    name: '',
    days_per_year: 0,
    carry_forward: false,
    max_carry_forward: 0,
    requires_document: false,
  });

  const pendingCount = mockEmployeeLeaves.filter(l => l.status === 'pending').length;
  const approvedCount = mockEmployeeLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = mockEmployeeLeaves.filter(l => l.status === 'rejected').length;

  const filteredLeaves = mockEmployeeLeaves.filter(leave => {
    const matchesSearch =
      leave.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || leave.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleSaveLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingLeaveType) {
        setLeaveTypes(
          leaveTypes.map(lt =>
            lt.id === editingLeaveType.id
              ? { ...lt, ...leaveTypeData }
              : lt
          )
        );
        toast.success('Leave type updated successfully');
      } else {
        const newLeaveType: LeaveType = {
          id: `lt-${Date.now()}`,
          ...leaveTypeData,
          icon: Umbrella,
          color: 'blue',
          is_active: true,
        };
        setLeaveTypes([...leaveTypes, newLeaveType]);
        toast.success('Leave type created successfully');
      }

      setShowLeaveTypeDialog(false);
      setEditingLeaveType(null);
      setLeaveTypeData({
        name: '',
        days_per_year: 0,
        carry_forward: false,
        max_carry_forward: 0,
        requires_document: false,
      });
    } catch (error) {
      toast.error('Failed to save leave type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLeaveType = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    setLeaveTypeData({
      name: leaveType.name,
      days_per_year: leaveType.days_per_year,
      carry_forward: leaveType.carry_forward,
      max_carry_forward: leaveType.max_carry_forward,
      requires_document: leaveType.requires_document,
    });
    setShowLeaveTypeDialog(true);
  };

  const getStatusBadge = (status: EmployeeLeave['status']) => {
    const variants: Record<EmployeeLeave['status'], { className: string; label: string; icon: any }> = {
      'pending': { className: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
      'approved': { className: 'bg-green-100 text-green-700', label: 'Approved', icon: CheckCircle2 },
      'rejected': { className: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
    };

    const variant = variants[status];
    const Icon = variant.icon;

    return (
      <Badge className={variant.className} variant="secondary">
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">Leave Management</h1>
            <p className="text-muted-foreground">
              Manage leave types, policies, and employee leave requests
            </p>
          </div>
          <Button onClick={() => setShowLeaveTypeDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Leave Type
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leave Types</p>
                <p className="text-2xl">{leaveTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-lg">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="types">
            <Settings className="h-4 w-4 mr-2" />
            Leave Types
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Calendar className="h-4 w-4 mr-2" />
            All Requests
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Usage by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveTypes.slice(0, 5).map((type) => {
                    const Icon = type.icon;
                    const usage = Math.floor(Math.random() * type.days_per_year);
                    const percentage = (usage / type.days_per_year) * 100;

                    return (
                      <div key={type.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{type.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {usage}/{type.days_per_year} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department-wise Leave Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { dept: 'Engineering', total: 120, used: 85 },
                    { dept: 'Design', total: 60, used: 42 },
                    { dept: 'Marketing', total: 75, used: 50 },
                    { dept: 'Sales', total: 90, used: 68 },
                  ].map((item) => {
                    const percentage = (item.used / item.total) * 100;
                    return (
                      <div key={item.dept}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{item.dept}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.used}/{item.total} days
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leave Types Tab */}
        <TabsContent value="types" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configured Leave Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Days per Year</TableHead>
                    <TableHead>Carry Forward</TableHead>
                    <TableHead>Max Carry Forward</TableHead>
                    <TableHead>Requires Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <TableRow key={type.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{type.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{type.days_per_year} days</TableCell>
                        <TableCell>
                          {type.carry_forward ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          {type.carry_forward ? `${type.max_carry_forward} days` : '-'}
                        </TableCell>
                        <TableCell>
                          {type.requires_document ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={type.is_active ? 'default' : 'secondary'}>
                            {type.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLeaveType(type)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Leave Requests ({filteredLeaves.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approved By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.employee_name}</TableCell>
                      <TableCell>{leave.department}</TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{leave.days} day{leave.days > 1 ? 's' : ''}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>{leave.approved_by || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredLeaves.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No leave requests found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Leave Type Dialog */}
      <Dialog open={showLeaveTypeDialog} onOpenChange={setShowLeaveTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLeaveType ? 'Edit Leave Type' : 'Add Leave Type'}
            </DialogTitle>
            <DialogDescription>
              Configure leave type settings and policies
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveLeaveType} className="space-y-4">
            <div>
              <Label htmlFor="name">Leave Type Name *</Label>
              <Input
                id="name"
                value={leaveTypeData.name}
                onChange={(e) =>
                  setLeaveTypeData({ ...leaveTypeData, name: e.target.value })
                }
                placeholder="e.g., Casual Leave"
                required
              />
            </div>

            <div>
              <Label htmlFor="days_per_year">Days per Year *</Label>
              <Input
                id="days_per_year"
                type="number"
                min="0"
                value={leaveTypeData.days_per_year}
                onChange={(e) =>
                  setLeaveTypeData({
                    ...leaveTypeData,
                    days_per_year: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="carry_forward"
                checked={leaveTypeData.carry_forward}
                onChange={(e) =>
                  setLeaveTypeData({
                    ...leaveTypeData,
                    carry_forward: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="carry_forward" className="cursor-pointer">
                Allow carry forward to next year
              </Label>
            </div>

            {leaveTypeData.carry_forward && (
              <div>
                <Label htmlFor="max_carry_forward">Maximum Carry Forward Days</Label>
                <Input
                  id="max_carry_forward"
                  type="number"
                  min="0"
                  value={leaveTypeData.max_carry_forward}
                  onChange={(e) =>
                    setLeaveTypeData({
                      ...leaveTypeData,
                      max_carry_forward: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requires_document"
                checked={leaveTypeData.requires_document}
                onChange={(e) =>
                  setLeaveTypeData({
                    ...leaveTypeData,
                    requires_document: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="requires_document" className="cursor-pointer">
                Requires supporting document
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingLeaveType
                  ? 'Update Leave Type'
                  : 'Add Leave Type'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLeaveTypeDialog(false);
                  setEditingLeaveType(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
