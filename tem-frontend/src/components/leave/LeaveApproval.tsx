import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Umbrella,
  Activity,
  Plane,
  Heart,
  Home,
  User as UserIcon,
  Calendar,
  Mail,
  Phone,
  MapPin,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner@2.0.3';
import { Separator } from '../ui/separator';

interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  department: string;
  designation: string;
  type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason: string;
  contact_number: string;
  address_during_leave: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_date: string;
}

interface LeaveApprovalProps {
  user: User;
}

// Mock data
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'John Doe',
    employee_email: 'john.doe@company.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    type: 'Casual Leave',
    from_date: '2024-12-20',
    to_date: '2024-12-22',
    days: 3,
    reason: 'Family function - cousin\'s wedding. Need to travel to another city.',
    contact_number: '+1 (555) 123-4567',
    address_during_leave: '123 Main St, New York, NY 10001',
    status: 'pending',
    applied_date: '2024-11-15',
  },
  {
    id: '2',
    employee_id: '3',
    employee_name: 'Mike Chen',
    employee_email: 'mike.chen@company.com',
    department: 'Engineering',
    designation: 'Frontend Developer',
    type: 'Work From Home',
    from_date: '2024-11-20',
    to_date: '2024-11-20',
    days: 1,
    reason: 'Internet installation at home',
    contact_number: '+1 (555) 987-6543',
    address_during_leave: '456 Oak Ave, San Francisco, CA 94102',
    status: 'pending',
    applied_date: '2024-11-18',
  },
  {
    id: '3',
    employee_id: '4',
    employee_name: 'Emily Davis',
    employee_email: 'emily.davis@company.com',
    department: 'Design',
    designation: 'UX Designer',
    type: 'Sick Leave',
    from_date: '2024-11-19',
    to_date: '2024-11-20',
    days: 2,
    reason: 'Fever and flu symptoms. Doctor advised rest.',
    contact_number: '+1 (555) 456-7890',
    address_during_leave: '789 Elm St, Los Angeles, CA 90001',
    status: 'pending',
    applied_date: '2024-11-19',
  },
];

export function LeaveApproval({ user }: LeaveApprovalProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch =
      request.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || request.type === filterType;
    const matchesDepartment = filterDepartment === 'all' || request.department === filterDepartment;

    return matchesSearch && matchesType && matchesDepartment;
  });

  const getLeaveTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'Casual Leave': Umbrella,
      'Sick Leave': Activity,
      'Privilege Leave': Plane,
      'Maternity/Paternity': Heart,
      'Work From Home': Home,
    };
    return icons[type] || Umbrella;
  };

  const handleApproval = (request: LeaveRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setRejectionReason('');
    setShowApprovalDialog(true);
  };

  const handleSubmitApproval = async () => {
    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRequests(requests.map(r =>
        r.id === selectedRequest?.id
          ? { ...r, status: approvalAction === 'approve' ? 'approved' : 'rejected' }
          : r
      ));

      toast.success(
        approvalAction === 'approve'
          ? 'Leave request approved successfully'
          : 'Leave request rejected'
      );

      setShowApprovalDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to process leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve leave requests from your team
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl">{pendingRequests.length}</p>
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
                <p className="text-sm text-muted-foreground">Approved This Month</p>
                <p className="text-2xl">15</p>
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
                <p className="text-sm text-muted-foreground">Rejected This Month</p>
                <p className="text-2xl">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee, department, or designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leave Types</SelectItem>
            <SelectItem value="Casual Leave">Casual Leave</SelectItem>
            <SelectItem value="Sick Leave">Sick Leave</SelectItem>
            <SelectItem value="Privilege Leave">Privilege Leave</SelectItem>
            <SelectItem value="Work From Home">Work From Home</SelectItem>
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

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-900">
                You have {pendingRequests.length} leave request{pendingRequests.length > 1 ? 's' : ''} waiting for your approval
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                const Icon = getLeaveTypeIcon(request.type);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.designation} - {request.department}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span>{request.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(request.from_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">to</div>
                        <div>{new Date(request.to_date).toLocaleDateString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {request.days} day{request.days > 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.applied_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate">{request.reason}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setApprovalAction('approve');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApproval(request, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleApproval(request, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No pending requests</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterType !== 'all' || filterDepartment !== 'all'
                  ? 'Try adjusting your filters'
                  : 'All leave requests have been processed'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval/Rejection Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              Review the details before {approvalAction === 'approve' ? 'approving' : 'rejecting'} this request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Employee Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Employee</p>
                        <p className="font-medium">{selectedRequest.employee_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedRequest.employee_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Department</p>
                        <p className="font-medium">{selectedRequest.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Designation</p>
                        <p className="font-medium">{selectedRequest.designation}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Leave Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Leave Type</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = getLeaveTypeIcon(selectedRequest.type);
                      return <Icon className="h-4 w-4 text-primary" />;
                    })()}
                    <span className="font-medium">{selectedRequest.type}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {new Date(selectedRequest.from_date).toLocaleDateString()} -{' '}
                    {new Date(selectedRequest.to_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Days</span>
                  <Badge>{selectedRequest.days} day{selectedRequest.days > 1 ? 's' : ''}</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Reason</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.contact_number && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <p className="text-sm font-medium">{selectedRequest.contact_number}</p>
                  </div>
                </div>
              )}

              {selectedRequest.address_during_leave && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address During Leave</p>
                    <p className="text-sm font-medium">{selectedRequest.address_during_leave}</p>
                  </div>
                </div>
              )}

              {approvalAction === 'reject' && (
                <>
                  <Separator />
                  <div>
                    <Label htmlFor="rejection_reason">Reason for Rejection *</Label>
                    <Textarea
                      id="rejection_reason"
                      placeholder="Please provide a reason for rejecting this request..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmitApproval}
                  disabled={isSubmitting || (approvalAction === 'reject' && !rejectionReason.trim())}
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                >
                  {approvalAction === 'approve' ? (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting
                    ? 'Processing...'
                    : approvalAction === 'approve'
                    ? 'Approve Request'
                    : 'Reject Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApprovalDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
