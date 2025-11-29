import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Umbrella,
  Heart,
  Plane,
  Home,
  Activity,
  FileText,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Progress } from '../ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface LeaveBalance {
  type: string;
  icon: any;
  total: number;
  used: number;
  pending: number;
  available: number;
  color: string;
}

interface LeaveRequest {
  id: string;
  type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_date: string;
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
}

interface MyLeavesProps {
  user: User;
  navigateTo: (page: string, params?: any) => void;
}

// Mock data
const mockLeaveBalances: LeaveBalance[] = [
  {
    type: 'Casual Leave',
    icon: Umbrella,
    total: 12,
    used: 5,
    pending: 2,
    available: 5,
    color: 'blue',
  },
  {
    type: 'Sick Leave',
    icon: Activity,
    total: 10,
    used: 3,
    pending: 0,
    available: 7,
    color: 'red',
  },
  {
    type: 'Privilege Leave',
    icon: Plane,
    total: 15,
    used: 8,
    pending: 0,
    available: 7,
    color: 'purple',
  },
  {
    type: 'Maternity/Paternity',
    icon: Heart,
    total: 90,
    used: 0,
    pending: 0,
    available: 90,
    color: 'pink',
  },
  {
    type: 'Work From Home',
    icon: Home,
    total: 24,
    used: 10,
    pending: 1,
    available: 13,
    color: 'green',
  },
];

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    type: 'Casual Leave',
    from_date: '2024-12-20',
    to_date: '2024-12-22',
    days: 3,
    reason: 'Family function',
    status: 'pending',
    applied_date: '2024-11-15',
  },
  {
    id: '2',
    type: 'Sick Leave',
    from_date: '2024-11-05',
    to_date: '2024-11-06',
    days: 2,
    reason: 'Fever and cold',
    status: 'approved',
    applied_date: '2024-11-04',
    approved_by: 'Sarah Johnson',
    approved_date: '2024-11-04',
  },
  {
    id: '3',
    type: 'Privilege Leave',
    from_date: '2024-10-10',
    to_date: '2024-10-14',
    days: 5,
    reason: 'Vacation with family',
    status: 'approved',
    applied_date: '2024-09-20',
    approved_by: 'Sarah Johnson',
    approved_date: '2024-09-21',
  },
  {
    id: '4',
    type: 'Work From Home',
    from_date: '2024-09-15',
    to_date: '2024-09-15',
    days: 1,
    reason: 'Personal work',
    status: 'rejected',
    applied_date: '2024-09-14',
    approved_by: 'Sarah Johnson',
    approved_date: '2024-09-14',
    rejection_reason: 'Important team meeting scheduled',
  },
  {
    id: '5',
    type: 'Casual Leave',
    from_date: '2024-08-20',
    to_date: '2024-08-21',
    days: 2,
    reason: 'Wedding to attend',
    status: 'approved',
    applied_date: '2024-08-10',
    approved_by: 'Sarah Johnson',
    approved_date: '2024-08-11',
  },
];

export function MyLeaves({ user, navigateTo }: MyLeavesProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const totalLeaves = mockLeaveBalances.reduce((sum, b) => sum + b.total, 0);
  const usedLeaves = mockLeaveBalances.reduce((sum, b) => sum + b.used, 0);
  const pendingLeaves = mockLeaveBalances.reduce((sum, b) => sum + b.pending, 0);
  const availableLeaves = mockLeaveBalances.reduce((sum, b) => sum + b.available, 0);

  const filteredRequests = mockLeaveRequests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.type === filterType;
    return matchesStatus && matchesType;
  });

  const getStatusBadge = (status: LeaveRequest['status']) => {
    const variants: Record<LeaveRequest['status'], { className: string; label: string; icon: any }> = {
      'pending': { className: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
      'approved': { className: 'bg-green-100 text-green-700', label: 'Approved', icon: CheckCircle2 },
      'rejected': { className: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
      'cancelled': { className: 'bg-gray-100 text-gray-700', label: 'Cancelled', icon: XCircle },
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

  const getLeaveTypeIcon = (type: string) => {
    const balance = mockLeaveBalances.find(b => b.type === type);
    if (!balance) return FileText;
    return balance.icon;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; gradient: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-400 to-blue-600' },
      red: { bg: 'bg-red-100', text: 'text-red-700', gradient: 'from-red-400 to-red-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-400 to-purple-600' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-700', gradient: 'from-pink-400 to-pink-600' },
      green: { bg: 'bg-green-100', text: 'text-green-700', gradient: 'from-green-400 to-green-600' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl mb-2">My Leaves</h1>
            <p className="text-muted-foreground">
              Manage your leave requests and view leave balance
            </p>
          </div>
          <Button onClick={() => navigateTo('leave-form')}>
            <Plus className="h-4 w-4 mr-2" />
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leaves</p>
                <p className="text-2xl">{totalLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-2xl">{usedLeaves}</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl">{pendingLeaves}</p>
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
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl">{availableLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Calendar className="h-4 w-4 mr-2" />
            Leave Balance
          </TabsTrigger>
          <TabsTrigger value="requests">
            <FileText className="h-4 w-4 mr-2" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {/* Leave Balance Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockLeaveBalances.map((balance) => {
              const Icon = balance.icon;
              const colors = getColorClasses(balance.color);
              const usagePercentage = (balance.used / balance.total) * 100;

              return (
                <Card key={balance.type} className="overflow-hidden">
                  <CardHeader className={`${colors.bg} pb-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-gradient-to-br ${colors.gradient} rounded-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className={colors.text}>{balance.type}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{balance.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-orange-600">{balance.used}</p>
                        <p className="text-xs text-muted-foreground">Used</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-yellow-600">{balance.pending}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold text-green-600">{balance.available}</p>
                        <p className="text-xs text-muted-foreground">Available</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Usage</span>
                        <span className="text-sm text-muted-foreground">
                          {usagePercentage.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-6">
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mockLeaveBalances.map((balance) => (
                  <SelectItem key={balance.type} value={balance.type}>
                    {balance.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests ({filteredRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>From Date</TableHead>
                    <TableHead>To Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const Icon = getLeaveTypeIcon(request.type);
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium">{request.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(request.from_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(request.to_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.days} day{request.days > 1 ? 's' : ''}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          {new Date(request.applied_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigateTo('leave-detail', { leaveId: request.id })
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No leave requests found</p>
                  <p className="text-sm text-muted-foreground">
                    {filterStatus !== 'all' || filterType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Apply for your first leave'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
