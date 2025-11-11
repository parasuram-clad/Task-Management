import { useState } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
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

interface TimesheetApprovalProps {
  user: User;
}

interface TimesheetSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  week: string;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedOn: string;
  entries: {
    project: string;
    task: string;
    hours: { [key: string]: number };
  }[];
}

export function TimesheetApproval({ user }: TimesheetApprovalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetSubmission | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');

  // Mock data
  const timesheetSubmissions: TimesheetSubmission[] = [
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      week: 'Oct 28 - Nov 3, 2024',
      totalHours: 42,
      status: 'pending',
      submittedOn: 'Nov 4, 2024',
      entries: [
        { project: 'E-commerce Platform', task: 'Bug Fixes', hours: { mon: 8, tue: 7, wed: 8, thu: 6, fri: 5 } },
        { project: 'Mobile App', task: 'UI Updates', hours: { mon: 0, tue: 1, wed: 0, thu: 2, fri: 3 } },
      ],
    },
    {
      id: '2',
      employeeId: 'EMP003',
      employeeName: 'Jane Smith',
      week: 'Oct 28 - Nov 3, 2024',
      totalHours: 40,
      status: 'pending',
      submittedOn: 'Nov 4, 2024',
      entries: [
        { project: 'API Integration', task: 'Development', hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8 } },
      ],
    },
    {
      id: '3',
      employeeId: 'EMP005',
      employeeName: 'Sarah Connor',
      week: 'Oct 28 - Nov 3, 2024',
      totalHours: 38,
      status: 'pending',
      submittedOn: 'Nov 4, 2024',
      entries: [
        { project: 'E-commerce Platform', task: 'Testing', hours: { mon: 7, tue: 8, wed: 8, thu: 7, fri: 8 } },
      ],
    },
    {
      id: '4',
      employeeId: 'EMP006',
      employeeName: 'Tom Hardy',
      week: 'Oct 21 - Oct 27, 2024',
      totalHours: 40,
      status: 'approved',
      submittedOn: 'Oct 28, 2024',
      entries: [
        { project: 'Mobile App', task: 'Development', hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8 } },
      ],
    },
  ];

  const filteredSubmissions = timesheetSubmissions.filter(submission => {
    const matchesSearch = submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = timesheetSubmissions.filter(s => s.status === 'pending').length;

  const handleViewDetails = (timesheet: TimesheetSubmission) => {
    setSelectedTimesheet(timesheet);
    setShowDetailDialog(true);
  };

  const handleApprove = (timesheet: TimesheetSubmission) => {
    toast.success(`Timesheet approved for ${timesheet.employeeName}`);
  };

  const handleRejectClick = (timesheet: TimesheetSubmission) => {
    setSelectedTimesheet(timesheet);
    setShowRejectDialog(true);
  };

  const handleReject = () => {
    if (!rejectionComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    toast.success(`Timesheet rejected for ${selectedTimesheet?.employeeName}`);
    setShowRejectDialog(false);
    setRejectionComment('');
    setSelectedTimesheet(null);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Timesheet Approvals</h1>
        <p className="text-gray-500">Review and approve team timesheets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Approval</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-orange-600">{pendingCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved This Week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-600">
              {timesheetSubmissions.filter(s => s.status === 'approved').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Hours (Pending)</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {timesheetSubmissions
                .filter(s => s.status === 'pending')
                .reduce((sum, s) => sum + s.totalHours, 0)} hrs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted Timesheets</CardTitle>
          <CardDescription>Review and take action on timesheet submissions</CardDescription>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p>{submission.employeeName}</p>
                        <p className="text-sm text-gray-500">{submission.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{submission.week}</TableCell>
                    <TableCell>{submission.totalHours} hrs</TableCell>
                    <TableCell>{submission.submittedOn}</TableCell>
                    <TableCell>
                      <Badge variant={
                        submission.status === 'approved' ? 'default' :
                        submission.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(submission)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {submission.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRejectClick(submission)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(submission)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Timesheet Details - {selectedTimesheet?.employeeName}</DialogTitle>
            <DialogDescription>
              {selectedTimesheet?.week}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTimesheet && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Project / Task</th>
                      {weekDays.map(day => (
                        <th key={day} className="text-center p-3">{day}</th>
                      ))}
                      <th className="text-center p-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTimesheet.entries.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">
                          <div>
                            <p>{entry.project}</p>
                            <p className="text-sm text-gray-500">{entry.task}</p>
                          </div>
                        </td>
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                          <td key={day} className="text-center p-3">
                            {entry.hours[day] || '-'}
                          </td>
                        ))}
                        <td className="text-center p-3">
                          {Object.values(entry.hours).reduce((sum, h) => sum + h, 0)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2">
                      <td className="p-3">Daily Total</td>
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                        <td key={day} className="text-center p-3">
                          {selectedTimesheet.entries.reduce((sum, entry) => sum + (entry.hours[day] || 0), 0)}
                        </td>
                      ))}
                      <td className="text-center p-3">
                        {selectedTimesheet.totalHours}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {selectedTimesheet.status === 'pending' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      setShowDetailDialog(false);
                      setShowRejectDialog(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => {
                    handleApprove(selectedTimesheet);
                    setShowDetailDialog(false);
                  }}>
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Timesheet</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this timesheet
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p>{selectedTimesheet?.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Week</p>
              <p>{selectedTimesheet?.week}</p>
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
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Timesheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
