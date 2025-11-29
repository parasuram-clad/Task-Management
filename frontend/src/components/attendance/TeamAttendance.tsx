import { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { attendanceApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface TeamAttendanceProps {
  user: User;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'present' | 'absent' | 'on-leave';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
}

interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: string;
  proposedTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function TeamAttendance({ user }: TeamAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAttendanceRecords, setApiAttendanceRecords] = useState<any[]>([]);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch team attendance from API
  useEffect(() => {
    if (useApi) {
      fetchTeamAttendance();
    }
  }, [useApi]);

  const fetchTeamAttendance = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await attendanceApi.getTeamAttendance(today);
      setApiAttendanceRecords(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load team attendance: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock attendance data
  const mockAttendanceRecords: AttendanceRecord[] = [
    { id: '1', employeeId: 'EMP001', employeeName: 'John Doe', department: 'Engineering', status: 'present', checkInTime: '09:15 AM', checkOutTime: '06:10 PM', totalHours: 8.5 },
    { id: '2', employeeId: 'EMP003', employeeName: 'Jane Smith', department: 'Engineering', status: 'present', checkInTime: '09:05 AM', checkOutTime: '06:20 PM', totalHours: 8.75 },
    { id: '3', employeeId: 'EMP004', employeeName: 'Mike Wilson', department: 'Engineering', status: 'on-leave', checkInTime: undefined, checkOutTime: undefined, totalHours: 0 },
    { id: '4', employeeId: 'EMP005', employeeName: 'Sarah Connor', department: 'Engineering', status: 'present', checkInTime: '09:30 AM', checkOutTime: undefined, totalHours: 4.5 },
    { id: '5', employeeId: 'EMP006', employeeName: 'Tom Hardy', department: 'Engineering', status: 'absent', checkInTime: undefined, checkOutTime: undefined, totalHours: 0 },
    { id: '6', employeeId: 'EMP007', employeeName: 'Emma Watson', department: 'Engineering', status: 'present', checkInTime: '08:50 AM', checkOutTime: '05:55 PM', totalHours: 8.25 },
  ];

  // Use API data if available, otherwise use mock
  const attendanceRecords = useApi ? apiAttendanceRecords : mockAttendanceRecords;

  const regularizationRequests: RegularizationRequest[] = [
    { id: '1', employeeId: 'EMP001', employeeName: 'John Doe', date: 'Nov 5, 2024', type: 'Check-in correction', proposedTime: '09:00 AM', reason: 'Forgot to check in, was present in office', status: 'pending' },
    { id: '2', employeeId: 'EMP004', employeeName: 'Mike Wilson', date: 'Nov 4, 2024', type: 'Check-out correction', proposedTime: '06:30 PM', reason: 'System error during checkout', status: 'pending' },
  ];

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    onLeave: attendanceRecords.filter(r => r.status === 'on-leave').length,
  };

  const handleApprove = () => {
    toast.success(`Regularization request approved for ${selectedRequest?.employeeName}`);
    setShowApprovalDialog(false);
    setSelectedRequest(null);
  };

  const handleReject = () => {
    if (!rejectionComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    toast.success(`Regularization request rejected for ${selectedRequest?.employeeName}`);
    setShowApprovalDialog(false);
    setSelectedRequest(null);
    setRejectionComment('');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Team Attendance</h1>
        <p className="text-gray-500">Monitor and manage your team's attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Team Members</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Present Today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">{stats.present}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Absent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{stats.absent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>On Leave</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600">{stats.onLeave}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Real-time attendance status of your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead className="text-right">Total Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p>{record.employeeName}</p>
                        <p className="text-sm text-gray-500">{record.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell>
                      <Badge variant={
                        record.status === 'present' ? 'default' :
                        record.status === 'on-leave' ? 'secondary' :
                        'destructive'
                      }>
                        {record.status === 'present' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Present</>
                        ) : record.status === 'on-leave' ? (
                          <><Clock className="w-3 h-3 mr-1" /> On Leave</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Absent</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.checkInTime || '--'}</TableCell>
                    <TableCell>{record.checkOutTime || '--'}</TableCell>
                    <TableCell className="text-right">
                      {record.totalHours ? `${record.totalHours} hrs` : '--'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Regularization Requests</CardTitle>
          <CardDescription>Review and approve attendance corrections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regularizationRequests.filter(r => r.status === 'pending').map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p>{request.employeeName}</p>
                  <p className="text-sm text-gray-500">
                    {request.date} - {request.type} to {request.proposedTime}
                  </p>
                  <p className="text-sm mt-1 text-gray-600">Reason: {request.reason}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowApprovalDialog(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      handleApprove();
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            
            {regularizationRequests.filter(r => r.status === 'pending').length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending requests</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Regularization Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p>{selectedRequest?.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Request</p>
              <p>{selectedRequest?.type} - {selectedRequest?.proposedTime}</p>
            </div>
            <div>
              <label className="text-sm">Rejection Reason</label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
