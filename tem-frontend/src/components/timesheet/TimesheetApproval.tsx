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
import { toast } from 'sonner';

interface TimesheetApprovalProps {
  user: any;
}

interface TimesheetSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  week: string;
  totalHours: number;
  submittedOn: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedRejectedBy?: string;
  approvedRejectedOn?: string;
  entries: {
    date: string;
    project: string;
    task: string;
    hours: number;
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
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  // Enhanced mock data with multiple entries per project/task
  const mockTimesheetSubmissions: TimesheetSubmission[] = [
    {
      id: '1',
      employeeId: 'EMP952',
      employeeName: 'System Administrator',
      week: 'Nov 17 - Nov 23, 2025',
      totalHours: 0.0,
      submittedOn: 'Nov 18, 2025',
      status: 'pending',
      entries: [
        {
          date: '2025-11-17',
          project: 'Select project',
          task: 'No specific task',
          hours: 0
        }
      ]
    },
    {
      id: '2',
      employeeId: 'EMP638',
      employeeName: 'New user Tk',
      week: 'Nov 10 - Nov 16, 2025',
      totalHours: 8.0,
      submittedOn: 'Nov 12, 2025',
      status: 'approved',
      approvedRejectedBy: 'System Administrator',
      approvedRejectedOn: 'Nov 12, 2025',
      entries: [
        {
          date: '2025-11-10',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 0
        },
        {
          date: '2025-11-11',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 0
        },
        {
          date: '2025-11-12',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 2.5
        },
        {
          date: '2025-11-13',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 4.5
        },
        {
          date: '2025-11-14',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 1
        },
        {
          date: '2025-11-15',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 0
        },
        {
          date: '2025-11-16',
          project: 'E-commerce Platform',
          task: 'User Login Functionality',
          hours: 0
        }
      ]
    },
    {
      id: '3',
      employeeId: 'EMP952',
      employeeName: 'System Administrator',
      week: 'Nov 10 - Nov 16, 2025',
      totalHours: 33.5,
      submittedOn: 'Nov 12, 2025',
      status: 'rejected',
      approvedRejectedBy: 'System Administrator',
      approvedRejectedOn: 'Nov 13, 2025',
      entries: [
        {
          date: '2025-11-10',
          project: 'Mobile App Redesign',
          task: 'UI Components',
          hours: 8
        },
        {
          date: '2025-11-11',
          project: 'Mobile App Redesign',
          task: 'UI Components',
          hours: 8
        },
        {
          date: '2025-11-12',
          project: 'Mobile App Redesign',
          task: 'UI Components',
          hours: 8
        },
        {
          date: '2025-11-13',
          project: 'Mobile App Redesign',
          task: 'UI Components',
          hours: 8
        },
        {
          date: '2025-11-14',
          project: 'Mobile App Redesign',
          task: 'UI Components',
          hours: 1.5
        }
      ]
    },
    {
      id: '4',
      employeeId: 'EMP951',
      employeeName: 'Test User',
      week: 'Nov 10 - Nov 16, 2025',
      totalHours: 6.0,
      submittedOn: 'Nov 12, 2025',
      status: 'rejected',
      approvedRejectedBy: 'Test User',
      approvedRejectedOn: 'Nov 14, 2025',
      entries: [
        {
          date: '2025-11-10',
          project: 'API Integration',
          task: 'Development',
          hours: 6
        }
      ]
    },
    {
      id: '5',
      employeeId: 'EMP953',
      employeeName: 'John Developer',
      week: 'Nov 3 - Nov 9, 2025',
      totalHours: 40.0,
      submittedOn: 'Nov 10, 2025',
      status: 'approved',
      approvedRejectedBy: 'System Administrator',
      approvedRejectedOn: 'Nov 11, 2025',
      entries: [
        {
          date: '2025-11-03',
          project: 'Dashboard Project',
          task: 'Frontend Development',
          hours: 8
        },
        {
          date: '2025-11-04',
          project: 'Dashboard Project',
          task: 'Frontend Development',
          hours: 8
        },
        {
          date: '2025-11-05',
          project: 'Dashboard Project',
          task: 'Frontend Development',
          hours: 8
        },
        {
          date: '2025-11-06',
          project: 'Dashboard Project',
          task: 'Frontend Development',
          hours: 8
        },
        {
          date: '2025-11-07',
          project: 'Dashboard Project',
          task: 'Frontend Development',
          hours: 8
        }
      ]
    }
  ];

  // Fetch timesheets
  const fetchTimesheets = async () => {
    // setLoading(f);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTimesheetSubmissions(mockTimesheetSubmissions);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      toast.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  // Filter timesheets based on criteria
  const filteredSubmissions = timesheetSubmissions.filter(submission => {
    const matchesSearch = searchTerm === '' || 
                         submission.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'pending' ? submission.status === 'pending' : 
                          statusFilter === 'approved' ? submission.status === 'approved' :
                          submission.status === 'rejected');
    
    return matchesSearch && matchesStatus;
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setTimesheetSubmissions(prev => 
        prev.map(ts => 
          ts.id === selectedTimesheet.id 
            ? { 
                ...ts, 
                status: 'approved' as const,
                approvedRejectedBy: user.name || 'System Administrator',
                approvedRejectedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            : ts
        )
      );
      
      toast.success(`Timesheet approved for ${selectedTimesheet.employeeName}`);
      setShowApproveDialog(false);
      setSelectedTimesheet(null);
    } catch (error) {
      console.error('Error approving timesheet:', error);
      toast.error('Failed to approve timesheet');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (timesheet: TimesheetSubmission) => {
    setSelectedTimesheet(timesheet);
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedTimesheet) return;
    
    if (!rejectionComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(selectedTimesheet.id);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setTimesheetSubmissions(prev => 
        prev.map(ts => 
          ts.id === selectedTimesheet.id 
            ? { 
                ...ts, 
                status: 'rejected' as const,
                approvedRejectedBy: user.name || 'System Administrator',
                approvedRejectedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            : ts
        )
      );
      
      toast.success(`Timesheet rejected for ${selectedTimesheet.employeeName}`);
      setShowRejectDialog(false);
      setRejectionComment('');
      setSelectedTimesheet(null);
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      toast.error('Failed to reject timesheet');
    } finally {
      setProcessing(null);
    }
  };

  // Helper function to group entries by project and task
  const groupEntriesByProjectTask = (entries: TimesheetSubmission['entries']) => {
    const grouped: { [key: string]: { project: string; task: string; hoursByDate: { [date: string]: number } } } = {};
    
    entries.forEach(entry => {
      const key = `${entry.project}|${entry.task}`;
      if (!grouped[key]) {
        grouped[key] = {
          project: entry.project,
          task: entry.task,
          hoursByDate: {}
        };
      }
      grouped[key].hoursByDate[entry.date] = entry.hours;
    });
    
    return Object.values(grouped);
  };

  // Helper function to get week dates from a timesheet
  const getWeekDates = (timesheet: TimesheetSubmission) => {
    // Extract start date from week string (assuming format like "Nov 10 - Nov 16, 2025")
    const weekStartStr = timesheet.week.split(' - ')[0] + ', 2025';
    const startDate = new Date(weekStartStr);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(date);
    }
    
    return weekDates;
  };

  // Helper function to format date as MM/DD/YYYY
  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Helper function to get day name
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Helper function to calculate daily totals
  const calculateDailyTotals = (groupedEntries: ReturnType<typeof groupEntriesByProjectTask>, weekDates: Date[]) => {
    const dailyTotals: number[] = Array(7).fill(0);
    
    groupedEntries.forEach(group => {
      weekDates.forEach((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        dailyTotals[index] += group.hoursByDate[dateStr] || 0;
      });
    });
    
    return dailyTotals;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
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
          <h1 className="text-3xl font-bold tracking-tight">Timesheet Approvals</h1>
          <p className="text-gray-500">Review and manage all team timesheets</p>
        </div>
        <Button onClick={fetchTimesheets} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Same as before */}
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
          <CardTitle>Timesheet Submissions</CardTitle>
          <CardDescription>Review and approve team timesheets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters Section */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by employee name or ID..."
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
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          {/* Timesheet Table */}
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
                      No timesheets found matching your criteria
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
                        {submission.status === 'approved' || submission.status === 'rejected' ? (
                          <div className="flex items-center gap-2">
                            {submission.status === 'approved' ? (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-600" />
                            )}
                            <span className={
                              submission.status === 'approved' ? 'text-green-700' : 'text-red-700'
                            }>
                              {submission.approvedRejectedBy}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'approved' || submission.status === 'rejected' ? (
                          <span className={
                            submission.status === 'approved' ? 'text-green-700' : 'text-red-700'
                          }>
                            {submission.approvedRejectedOn}
                          </span>
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

      {/* View Details Dialog with New Table Structure */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto" style={{ maxWidth: '1000px', width: '80vw', maxHeight: '1000px', height: 'auto'}}>
          <DialogHeader>
            <DialogTitle>Timesheet Details - {selectedTimesheet?.employeeName}</DialogTitle>
            <DialogDescription>
              {selectedTimesheet?.week} • Submitted on {selectedTimesheet?.submittedOn}
              {selectedTimesheet?.status === 'approved' && (
                <span className="text-green-600"> • Approved by {selectedTimesheet?.approvedRejectedBy} on {selectedTimesheet?.approvedRejectedOn}</span>
              )}
              {selectedTimesheet?.status === 'rejected' && (
                <span className="text-red-600"> • Rejected by {selectedTimesheet?.approvedRejectedBy} on {selectedTimesheet?.approvedRejectedOn}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTimesheet && (() => {
            const groupedEntries = groupEntriesByProjectTask(selectedTimesheet.entries);
            const weekDates = getWeekDates(selectedTimesheet);
            const dailyTotals = calculateDailyTotals(groupedEntries, weekDates);
            const grandTotal = dailyTotals.reduce((sum, total) => sum + total, 0);

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-semibold border-r" rowSpan={2}>
                          Project / Task
                        </th>
                        {weekDates.map((date, index) => (
                          <th key={index} className="text-center p-3 font-semibold border-r" colSpan={1}>
                            <div className="flex flex-col">
                              <span className="font-bold">{getDayName(date)}</span>
                              <span className="text-xs font-normal text-gray-500 mt-1">
                                {formatDateShort(date)}
                              </span>
                            </div>
                          </th>
                        ))}
                        <th className="text-center p-3 font-semibold" rowSpan={2}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedEntries.map((group, index) => {
                        const rowTotal = weekDates.reduce((sum, date) => {
                          const dateStr = date.toISOString().split('T')[0];
                          return sum + (group.hoursByDate[dateStr] || 0);
                        }, 0);

                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 border-r">
                              <div>
                                <p className="font-medium">{group.project}</p>
                                <p className="text-sm text-gray-500">{group.task}</p>
                              </div>
                            </td>
                            {weekDates.map((date, dateIndex) => {
                              const dateStr = date.toISOString().split('T')[0];
                              const hours = group.hoursByDate[dateStr] || 0;
                              return (
                                <td key={dateIndex} className="text-center p-3 border-r">
                                  {hours > 0 ? hours.toFixed(1) : '-'}
                                </td>
                              );
                            })}
                            <td className="text-center p-3 font-medium">
                              {rowTotal.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="border-t-2 bg-gray-50 font-semibold">
                        <td className="p-3 border-r">Daily Total</td>
                        {dailyTotals.map((total, index) => (
                          <td key={index} className="text-center p-3 border-r">
                            {total > 0 ? total.toFixed(1) : '0'}
                          </td>
                        ))}
                        <td className="text-center p-3 text-blue-600 font-bold">
                          {grandTotal.toFixed(1)}
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
            );
          })()}
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