import { useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  Eye,
  FileText,
  TrendingUp,
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
import { Separator } from '../ui/separator';

interface PayrollApprovalRequest {
  id: string;
  month: string;
  year: number;
  period_start: string;
  period_end: string;
  total_employees: number;
  total_amount: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  initiated_by: string;
  initiated_date: string;
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
  breakdown: {
    total_basic: number;
    total_allowances: number;
    total_bonuses: number;
    total_deductions: number;
  };
}

interface PayrollApprovalProps {
  user: User;
}

// Mock data
const mockApprovalRequests: PayrollApprovalRequest[] = [
  {
    id: '1',
    month: 'November',
    year: 2024,
    period_start: '2024-11-01',
    period_end: '2024-11-30',
    total_employees: 145,
    total_amount: 10875000,
    status: 'pending_approval',
    initiated_by: 'Finance Team',
    initiated_date: '2024-11-25',
    breakdown: {
      total_basic: 7250000,
      total_allowances: 4350000,
      total_bonuses: 725000,
      total_deductions: 2450000,
    },
  },
  {
    id: '2',
    month: 'October',
    year: 2024,
    period_start: '2024-10-01',
    period_end: '2024-10-31',
    total_employees: 145,
    total_amount: 10650000,
    status: 'approved',
    initiated_by: 'Finance Team',
    initiated_date: '2024-10-25',
    approved_by: 'Admin',
    approved_date: '2024-10-28',
    breakdown: {
      total_basic: 7250000,
      total_allowances: 4200000,
      total_bonuses: 500000,
      total_deductions: 2300000,
    },
  },
  {
    id: '3',
    month: 'September',
    year: 2024,
    period_start: '2024-09-01',
    period_end: '2024-09-30',
    total_employees: 142,
    total_amount: 10400000,
    status: 'approved',
    initiated_by: 'Finance Team',
    initiated_date: '2024-09-25',
    approved_by: 'Admin',
    approved_date: '2024-09-27',
    breakdown: {
      total_basic: 7100000,
      total_allowances: 4100000,
      total_bonuses: 450000,
      total_deductions: 2250000,
    },
  },
];

export function PayrollApproval({ user }: PayrollApprovalProps) {
  const [requests, setRequests] = useState<PayrollApprovalRequest[]>(mockApprovalRequests);
  const [selectedRequest, setSelectedRequest] = useState<PayrollApprovalRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingRequests = requests.filter(r => r.status === 'pending_approval');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.total_amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: PayrollApprovalRequest['status']) => {
    const variants: Record<PayrollApprovalRequest['status'], { className: string; label: string; icon: any }> = {
      'pending_approval': { className: 'bg-yellow-100 text-yellow-700', label: 'Pending Approval', icon: Clock },
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

  const handleApproval = (request: PayrollApprovalRequest, action: 'approve' | 'reject') => {
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
      await new Promise(resolve => setTimeout(resolve, 1500));

      setRequests(
        requests.map(r =>
          r.id === selectedRequest?.id
            ? {
                ...r,
                status: approvalAction === 'approve' ? 'approved' : 'rejected',
                approved_by: user.name,
                approved_date: new Date().toISOString().split('T')[0],
                rejection_reason: approvalAction === 'reject' ? rejectionReason : undefined,
              }
            : r
        )
      );

      toast.success(
        approvalAction === 'approve'
          ? 'Payroll approved successfully'
          : 'Payroll rejected'
      );

      setShowApprovalDialog(false);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to process payroll approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Payroll Approval</h1>
        <p className="text-muted-foreground">
          Review and approve monthly payroll cycles
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-xl">{formatCurrency(totalPendingAmount)}</p>
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
                <p className="text-2xl">{approvedRequests.length}</p>
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
                <p className="text-2xl">{rejectedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {pendingRequests.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-900">
                You have {pendingRequests.length} payroll cycle{pendingRequests.length > 1 ? 's' : ''} pending approval worth {formatCurrency(totalPendingAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Approvals ({pendingRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Initiated By</TableHead>
                  <TableHead>Initiated Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.month} {request.year}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(request.period_start).toLocaleDateString()} -{' '}
                        {new Date(request.period_end).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{request.total_employees}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(request.total_amount)}
                    </TableCell>
                    <TableCell>{request.initiated_by}</TableCell>
                    <TableCell>
                      {new Date(request.initiated_date).toLocaleDateString()}
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Requests */}
      <Card>
        <CardHeader>
          <CardTitle>All Payroll Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Initiated By</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.month} {request.year}
                  </TableCell>
                  <TableCell>{request.total_employees}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(request.total_amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{request.initiated_by}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.initiated_date).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.approved_by ? (
                      <div>
                        <p className="text-sm">{request.approved_by}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.approved_date && new Date(request.approved_date).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setApprovalAction('approve');
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Approve' : 'Reject'} Payroll Cycle
            </DialogTitle>
            <DialogDescription>
              Review the payroll details before {approvalAction === 'approve' ? 'approving' : 'rejecting'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Cycle Information */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Period</p>
                      <p className="font-medium">
                        {selectedRequest.month} {selectedRequest.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Employees</p>
                      <p className="font-medium">{selectedRequest.total_employees}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="font-medium text-primary">
                        {formatCurrency(selectedRequest.total_amount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Breakdown */}
              <div>
                <h4 className="font-semibold mb-4">Payroll Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Total Basic Salary</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(selectedRequest.breakdown.total_basic)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Total Allowances</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(selectedRequest.breakdown.total_allowances)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Total Bonuses</span>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(selectedRequest.breakdown.total_bonuses)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Total Deductions</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      -{formatCurrency(selectedRequest.breakdown.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Initiated By */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Initiated By</p>
                  <p className="font-medium">{selectedRequest.initiated_by}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Initiated Date</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.initiated_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {approvalAction === 'reject' && (
                <>
                  <Separator />
                  <div>
                    <Label htmlFor="rejection_reason">Reason for Rejection *</Label>
                    <Textarea
                      id="rejection_reason"
                      placeholder="Please provide a detailed reason for rejecting this payroll..."
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
                  disabled={
                    isSubmitting || (approvalAction === 'reject' && !rejectionReason.trim())
                  }
                  className={
                    approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''
                  }
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
                    ? 'Approve Payroll'
                    : 'Reject Payroll'}
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
