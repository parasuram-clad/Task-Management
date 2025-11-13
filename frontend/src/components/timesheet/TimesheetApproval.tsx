import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, RefreshCw, UserCheck, UserX, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Timesheet, timesheetApi } from '../../services/api';
import { User } from '../../App';

interface TimesheetApprovalProps {
  user: User;
}

// Extended interface to match backend response
interface TimesheetSubmission extends Timesheet {
  employeeName: string;
  employeeId: string;
  week: string;
  totalHours: number;
  submittedOn: string;
  approverName?: string;
  rejectorName?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  entries: {
    project: string;
    task: string;
    hours: { [key: string]: number };
  }[];
}

export function TimesheetApproval({ user }: TimesheetApprovalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetSubmission | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionComment, setRejectionComment] = useState('');
  const [timesheetSubmissions, setTimesheetSubmissions] = useState<TimesheetSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch timesheets for approval
  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await timesheetApi.getTimesheetsForApproval();
      
      console.log('API Response:', response);
      
      const timesheetsData = Array.isArray(response) ? response : (response.data || []);
      
      // Transform backend data to frontend format
      const transformedTimesheets: TimesheetSubmission[] = timesheetsData.map((ts: any) => {
        // Calculate total hours from entries
        const totalHours = ts.entries?.reduce((sum: number, entry: any) => {
          return sum + (parseFloat(entry.hours) || 0);
        }, 0) || 0;
        
        // Format week range
        const weekStart = new Date(ts.week_start_date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const week = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        
        // Format dates
        const submittedOn = ts.submitted_at 
          ? new Date(ts.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Not submitted';

        const approvedOn = ts.approved_at 
          ? new Date(ts.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : undefined;

        const rejectedOn = ts.rejected_at 
          ? new Date(ts.rejected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : undefined;

        // Enhanced entries transformation
        const entries = ts.entries?.map((entry: any) => {
          const hours: { [key: string]: number } = {};
          
          if (entry.work_date) {
            try {
              const date = new Date(entry.work_date);
              const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
              const dayName = dayNames[date.getDay()];
              hours[dayName] = parseFloat(entry.hours) || 0;
            } catch (error) {
              console.error('Error parsing work_date:', entry.work_date, error);
            }
          }
          
          return {
            project: entry.project_name || 'Unknown Project',
            task: entry.task_title || 'General Work',
            hours,
            rawEntry: entry
          };
        }) || [];

        return {
          ...ts,
          id: ts.id?.toString() || Math.random().toString(),
          employeeId: ts.employee_code || `EMP${ts.user_id}`.padStart(4, '0'),
          employeeName: ts.user_name || 'Unknown Employee',
          week,
          totalHours,
          submittedOn,
          approvedAt: approvedOn,
          rejectedAt: rejectedOn,
          approverName: ts.approver_name,
          rejectorName: ts.rejector_name,
          rejectionReason: ts.rejection_reason,
          entries,
          status: (ts.status === 'submitted' ? 'pending' : ts.status) as 'pending' | 'approved' | 'rejected',
          weekStartDate: ts.week_start_date // Keep original for filtering
        };
      });

      console.log('Transformed timesheets:', transformedTimesheets);
      setTimesheetSubmissions(transformedTimesheets);
    } catch (error: any) {
      console.error('Error fetching timesheets:', error);
      toast.error(`Failed to load timesheets: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  // Calculate minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (!startDate) return '';
    
    const minDate = new Date(startDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  // Handle start date change
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    
    // If end date is before or equal to start date, clear it
    if (endDate && date) {
      const endDateObj = new Date(endDate);
      const startDateObj = new Date(date);
      
      if (endDateObj <= startDateObj) {
        setEndDate('');
      }
    }
  };

  // Filter timesheets based on all criteria
  const filteredSubmissions = timesheetSubmissions.filter(submission => {
    // Search filter (employee name or ID)
    const matchesSearch = searchTerm === '' || 
                         submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' ? submission.status === 'pending' : 
                          statusFilter === 'approved' ? submission.status === 'approved' :
                          submission.status === 'rejected');
    
    // Date filter
    let matchesDate = true;
    if (startDate && endDate) {
      const submissionDate = new Date(submission.weekStartDate);
      const filterStartDate = new Date(startDate);
      const filterEndDate = new Date(endDate);
      filterEndDate.setDate(filterEndDate.getDate() + 6); // Include the entire week
      
      matchesDate = submissionDate >= filterStartDate && submissionDate <= filterEndDate;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const pendingCount = timesheetSubmissions.filter(s => s.status === 'pending').length;
  const approvedCount = timesheetSubmissions.filter(s => s.status === 'approved').length;
  const rejectedCount = timesheetSubmissions.filter(s => s.status === 'rejected').length;

  const handleViewDetails = (timesheet: TimesheetSubmission) => {
    setSelectedTimesheet(timesheet);
    setShowDetailDialog(true);
  };

  const handleApproveClick = (timesheet: TimesheetSubmission) => {
    setSelectedTimesheet(timesheet);
    setShowApproveDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedTimesheet) return;
    
    try {
      setProcessing(selectedTimesheet.id);
      const timesheetId = parseInt(selectedTimesheet.id);
      if (isNaN(timesheetId)) {
        throw new Error('Invalid timesheet ID');
      }
      
      await timesheetApi.reviewTimesheet(timesheetId, 'approve');
      toast.success(`Timesheet approved for ${selectedTimesheet.employeeName}`);
      setShowApproveDialog(false);
      setSelectedTimesheet(null);
      await fetchTimesheets();
    } catch (error: any) {
      console.error('Error approving timesheet:', error);
      toast.error(`Failed to approve timesheet: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedTimesheet) return;
    
    if (!rejectionComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(selectedTimesheet.id);
      const timesheetId = parseInt(selectedTimesheet.id);
      if (isNaN(timesheetId)) {
        throw new Error('Invalid timesheet ID');
      }
      
      await timesheetApi.reviewTimesheet(timesheetId, 'reject', rejectionComment);
      toast.success(`Timesheet rejected for ${selectedTimesheet.employeeName}`);
      setShowRejectDialog(false);
      setRejectionComment('');
      setSelectedTimesheet(null);
      await fetchTimesheets();
    } catch (error: any) {
      console.error('Error rejecting timesheet:', error);
      toast.error(`Failed to reject timesheet: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (timesheet: TimesheetSubmission) => {
    setSelectedTimesheet(timesheet);
    setShowRejectDialog(true);
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading timesheets...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Timesheet Approvals</h1>
          <p className="text-gray-500">Review and manage all team timesheets</p>
        </div>
        <Button onClick={fetchTimesheets} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Pending Approval Card */}
  <Card className="relative overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:scale-[1.02]">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
            <RefreshCw className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Pending</p>
            <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-orange-600 font-medium">Awaiting</p>
          <p className="text-xs text-gray-400">review</p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Approved Card */}
  <Card className="relative overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:scale-[1.02]">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Approved</p>
            <p className="text-xl font-bold text-gray-900">{approvedCount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-600 font-medium">Completed</p>
          <p className="text-xs text-gray-400">reviews</p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Rejected Card */}
  <Card className="relative overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:scale-[1.02]">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Rejected</p>
            <p className="text-xl font-bold text-gray-900">{rejectedCount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-600 font-medium">Needs</p>
          <p className="text-xs text-gray-400">revision</p>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Total Hours Card */}
  <Card className="relative overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300 border-0 hover:scale-[1.02]">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Total Hours</p>
            <p className="text-xl font-bold text-gray-900">
              {timesheetSubmissions.reduce((sum, s) => sum + s.totalHours, 0).toFixed(1)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-blue-600 font-medium">All</p>
          <p className="text-xs text-gray-400">timesheets</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      <Card>
        <CardHeader>
          <CardTitle>All Timesheets</CardTitle>
          <CardDescription>Manage and review all timesheet submissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Employee Search */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
                min={getMinEndDate()}
                disabled={!startDate}
              />
            </div>

            {/* Clear Filters Button */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              disabled={!searchTerm && statusFilter === 'all' && !startDate && !endDate}
            >
              Clear Filters
            </Button>
          </div>

          {startDate && !endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                Please select an end date to apply the date filter. End date must be after {startDate}.
              </p>
            </div>
          )}

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Week</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approved/Rejected By</TableHead>
                  <TableHead>Approved/Rejected On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {timesheetSubmissions.length === 0 
                        ? 'No timesheets found' 
                        : startDate && !endDate
                        ? 'Please select an end date to apply date filter'
                        : 'No timesheets found matching your criteria'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map(submission => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{submission.employeeName}</p>
                          <p className="text-sm text-gray-500">{submission.employeeId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{submission.week}</TableCell>
                      <TableCell>{submission.totalHours.toFixed(1)} hrs</TableCell>
                      <TableCell>{submission.submittedOn}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            submission.status === 'approved' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : submission.status === 'rejected' 
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-black text-white border-black'
                          }
                        >
                          {submission.status === 'pending' ? 'Pending' : submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.status === 'approved' ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-700">{submission.approverName || 'Unknown'}</span>
                          </div>
                        ) : submission.status === 'rejected' ? (
                          <div className="flex items-center gap-2">
                            <UserX className="w-4 h-4 text-red-600" />
                            <span className="text-red-700">{submission.rejectorName || 'Unknown'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'approved' ? (
                          <span className="text-green-700">{submission.approvedAt}</span>
                        ) : submission.status === 'rejected' ? (
                          <span className="text-red-700">{submission.rejectedAt}</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(submission)}
                            disabled={processing === submission.id}
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
                                disabled={processing === submission.id}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApproveClick(submission)}
                                disabled={processing === submission.id}
                              >
                                {processing === submission.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
 <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
  <DialogContent className="max-w-4xl overflow-y-auto" style={{ maxWidth: '1000px', width: '80vw', maxHeight: '1000px', height: '95vh'}}>
    <DialogHeader>
      <DialogTitle>Timesheet Details - {selectedTimesheet?.employeeName}</DialogTitle>
      <DialogDescription>
        {selectedTimesheet?.week} • Submitted on {selectedTimesheet?.submittedOn}
        {selectedTimesheet?.status === 'approved' && (
          <span className="text-green-600"> • Approved by {selectedTimesheet?.approverName} on {selectedTimesheet?.approvedAt}</span>
        )}
        {selectedTimesheet?.status === 'rejected' && (
          <span className="text-red-600"> • Rejected by {selectedTimesheet?.rejectorName} on {selectedTimesheet?.rejectedAt}</span>
        )}
      </DialogDescription>
    </DialogHeader>
    
    {selectedTimesheet && (
      <div className="space-y-4">
        {/* Display rejection reason if rejected */}
        {selectedTimesheet.status === 'rejected' && selectedTimesheet.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
            <p className="text-sm text-red-700 mt-1">{selectedTimesheet.rejectionReason}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-semibold">Project / Task</th>
                {weekDays.map((day, index) => {
                  // Calculate the date for each day of the week
                  const weekStart = new Date(selectedTimesheet.weekStartDate);
                  const currentDay = new Date(weekStart);
                  currentDay.setDate(weekStart.getDate() + index);
                  
                  const dateString = currentDay.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  });
                  
                  return (
                    <th key={day} className="text-center p-3 font-semibold">
                      <div className="flex flex-col">
                        <span>{day}</span>
                        <span className="text-xs font-normal text-gray-500 mt-1">
                          {dateString}
                        </span>
                      </div>
                    </th>
                  );
                })}
                <th className="text-center p-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedTimesheet.entries.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{entry.project}</p>
                      <p className="text-sm text-gray-500">{entry.task}</p>
                    </div>
                  </td>
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                    <td key={day} className="text-center p-3">
                      {entry.hours[day] || '-'}
                    </td>
                  ))}
                  <td className="text-center p-3 font-medium">
                    {Object.values(entry.hours).reduce((sum, h) => sum + h, 0)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 bg-gray-50 font-semibold">
                <td className="p-3">Daily Total</td>
                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                  <td key={day} className="text-center p-3">
                    {selectedTimesheet.entries.reduce((sum, entry) => sum + (entry.hours[day] || 0), 0)}
                  </td>
                ))}
                <td className="text-center p-3 text-blue-600">
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
              disabled={processing === selectedTimesheet.id}
            >
              Reject
            </Button>
            <Button 
              onClick={() => {
                setShowDetailDialog(false);
                setShowApproveDialog(true);
              }}
              disabled={processing === selectedTimesheet.id}
            >
              {processing === selectedTimesheet.id ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve'
              )}
            </Button>
          </div>
        )}
      </div>
    )}
  </DialogContent>
</Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Timesheet</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this timesheet?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Employee</p>
              <p className="font-medium">{selectedTimesheet?.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Week</p>
              <p className="font-medium">{selectedTimesheet?.week}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="font-medium">{selectedTimesheet?.totalHours.toFixed(1)} hours</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                Once approved, this timesheet cannot be modified by the employee.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApproveDialog(false)}
              disabled={processing === selectedTimesheet?.id}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={processing === selectedTimesheet?.id}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing === selectedTimesheet?.id ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Yes, Approve Timesheet'
              )}
            </Button>
          </DialogFooter>
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
              <p className="font-medium">{selectedTimesheet?.employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Week</p>
              <p className="font-medium">{selectedTimesheet?.week}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Rejection Reason *</label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
              disabled={processing === selectedTimesheet?.id}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processing === selectedTimesheet?.id}
            >
              {processing === selectedTimesheet?.id ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Timesheet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}