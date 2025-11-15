import { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, XCircle, Clock, Edit ,Users, TrendingUp, TrendingDown} from 'lucide-react';
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
import { attendanceApi, TeamAttendanceRecord, RegularizationRequest, employeeApi, Employee } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface TeamAttendanceProps {
  user: User;
}

interface ProcessedAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'present' | 'absent';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  hasAttendanceRecord: boolean;
  userId: string;
  workDate: string;
}

interface EditAttendanceModalProps {
  record: ProcessedAttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

function EditAttendanceModal({ record, isOpen, onClose, onSave }: EditAttendanceModalProps) {
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      
      // Only set times for present status
      if (record.status === 'present') {
        // Use current time in 24-hour format for defaults
        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;
        
        if (record.checkInTime && record.checkInTime !== '--') {
          // If checkInTime is in 12-hour format, convert it to 24-hour for the time input
          let timeString = record.checkInTime;
          if (timeString.includes('AM') || timeString.includes('PM')) {
            // Convert 12-hour to 24-hour format
            const [time, modifier] = timeString.split(' ');
            let [hours, minutes] = time.split(':');
            
            if (modifier === 'PM' && hours !== '12') {
              hours = String(parseInt(hours) + 12);
            } else if (modifier === 'AM' && hours === '12') {
              hours = '00';
            }
            
            timeString = `${hours.padStart(2, '0')}:${minutes}`;
          }
          setCheckInTime(timeString);
        } else {
          // For new records or when no check-in time exists
          setCheckInTime(currentTime);
        }

        if (record.checkOutTime && record.checkOutTime !== '--') {
          // If checkOutTime is in 12-hour format, convert it to 24-hour for the time input
          let timeString = record.checkOutTime;
          if (timeString.includes('AM') || timeString.includes('PM')) {
            // Convert 12-hour to 24-hour format
            const [time, modifier] = timeString.split(' ');
            let [hours, minutes] = time.split(':');
            
            if (modifier === 'PM' && hours !== '12') {
              hours = String(parseInt(hours) + 12);
            } else if (modifier === 'AM' && hours === '12') {
              hours = '00';
            }
            
            timeString = `${hours.padStart(2, '0')}:${minutes}`;
          }
          setCheckOutTime(timeString);
        } else {
          // For new records or when no check-out time exists
          const currentHour = now.getHours();
          if (currentHour >= 17) {
            setCheckOutTime(currentTime);
          } else {
            setCheckOutTime('');
          }
        }
      } else {
        // Clear times for absent status
        setCheckInTime('');
        setCheckOutTime('');
      }
    }
  }, [record]);

  const handleSave = async () => {
    if (!record) return;

    setIsLoading(true);
    try {
      // Validate time formats before sending (only for present status)
      const validateTimeFormat = (time: string) => {
        if (!time) return null;
        const [hours, minutes] = time.split(':');
        const hoursNum = parseInt(hours);
        const minutesNum = parseInt(minutes);
        
        if (isNaN(hoursNum) || isNaN(minutesNum) || 
            hoursNum < 0 || hoursNum > 23 || 
            minutesNum < 0 || minutesNum > 59) {
          return null;
        }
        
        // Convert 24-hour format to 12-hour format with AM/PM for display
        let displayTime = time;
        if (hoursNum === 0) {
          displayTime = `12:${minutes} AM`;
        } else if (hoursNum === 12) {
          displayTime = `12:${minutes} PM`;
        } else if (hoursNum > 12) {
          displayTime = `${(hoursNum - 12).toString().padStart(2, '0')}:${minutes} PM`;
        } else {
          displayTime = `${hoursNum.toString().padStart(2, '0')}:${minutes} AM`;
        }
        
        return displayTime;
      };

      // Ensure workDate is in correct format (YYYY-MM-DD)
      let workDate = record.workDate;
      if (workDate.includes('T')) {
        workDate = workDate.split('T')[0];
      }

      const attendanceData = {
        status: status,
        checkInTime: status === 'present' ? validateTimeFormat(checkInTime) : null,
        checkOutTime: status === 'present' ? validateTimeFormat(checkOutTime) : null,
        userId: record.userId,
        workDate: workDate
      };

      console.log('Saving attendance data:', attendanceData);

      await onSave(attendanceData);
      onClose();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance. Please check the time format.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show time fields only for present status
  const showTimeFields = status === 'present';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogDescription>
            Update attendance for {record?.employeeName} on {record?.workDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Show the date being edited */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700">Date: {record?.workDate}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value: 'present' | 'absent') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showTimeFields && (
            <>
              <div>
                <label className="text-sm font-medium">Check In Time</label>
                <Input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Check Out Time</label>
                <Input
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TeamAttendance({ user }: TeamAttendanceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<RegularizationRequest | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ProcessedAttendanceRecord | null>(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<ProcessedAttendanceRecord[]>([]);
  const [regularizationRequests, setRegularizationRequests] = useState<RegularizationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch team attendance, regularization requests, and total employees count
  useEffect(() => {
    if (useApi) {
      fetchTeamAttendance();
      fetchRegularizationRequests();
      fetchTotalEmployees();
    }
  }, [useApi]);

  const fetchTotalEmployees = async () => {
    try {
      const employees = await employeeApi.list({ active: true });
      setTotalEmployees(employees.length);
    } catch (error) {
      console.error('Error fetching total employees:', error);
    }
  };

const fetchTeamAttendance = async () => {
  setIsLoading(true);
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching attendance for date:', today);
    
    const data = await attendanceApi.getTeamAttendance(today);
    
    console.log('Raw API data:', data);
    
    const processedData: ProcessedAttendanceRecord[] = data.map(record => {
      let totalHours = undefined;
      
      // Calculate total hours only if both check-in and check-out exist
      if (record.check_in_at && record.check_out_at) {
        const checkIn = new Date(record.check_in_at);
        const checkOut = new Date(record.check_out_at);
        const diff = checkOut.getTime() - checkIn.getTime();
        totalHours = Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
      }

      // Determine status
      let status: 'present' | 'absent' = 'absent';
      if (record.status === 'present') {
        status = 'present';
      }

      // Format time directly from API response - NO TIMEZONE CONVERSION
      const formatTimeFromAPI = (timeString: string | null) => {
        if (!timeString) return '--';
        
        // If the API returns time in 12-hour format already, use it directly
        if (timeString.includes('AM') || timeString.includes('PM')) {
          return timeString;
        }
        
        // If it's in ISO format, extract and format the time part
        if (timeString.includes('T')) {
          const date = new Date(timeString);
          return date.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          });
        }
        
        // If it's already in a display format, return as is
        return timeString;
      };

      return {
        id: record.attendance_id || `user_${record.user_id}`,
        employeeId: record.employee_code && record.employee_code.trim() !== "" 
          ? record.employee_code 
          : `EMP${String(record.user_id).padStart(3, '0')}`,
        employeeName: record.user_name,
        department: record.department || 'Not assigned',
        status,
        checkInTime: status === 'present' ? formatTimeFromAPI(record.check_in_at) : undefined,
        checkOutTime: status === 'present' ? formatTimeFromAPI(record.check_out_at) : undefined,
        totalHours,
        hasAttendanceRecord: !!record.attendance_id,
        userId: record.user_id,
        workDate: record.work_date // Use directly from API
      };
    });

    setAttendanceRecords(processedData);
    console.log('Processed team attendance:', processedData);
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to load team attendance: ${error.message}`);
    }
    console.error('Error fetching team attendance:', error);
  } finally {
    setIsLoading(false);
  }
};

const handleEditAttendance = async (attendanceData: any) => {
  try {
    // Ensure the workDate is in YYYY-MM-DD format
    let workDate = attendanceData.workDate;
    
    // If workDate is a full ISO string, extract just the date part
    if (workDate.includes('T')) {
      workDate = workDate.split('T')[0];
    }
    
    // Ensure the data is properly formatted
    const formattedData = {
      userId: parseInt(attendanceData.userId),
      workDate: workDate,
      status: attendanceData.status,
      checkInTime: attendanceData.checkInTime || null,
      checkOutTime: attendanceData.checkOutTime || null
    };

    console.log('Sending attendance update:', formattedData);
    
    await attendanceApi.updateTeamAttendance(formattedData);
    toast.success(`Attendance updated for ${selectedRecord?.employeeName}`);
    
    // Refresh the data
    await fetchTeamAttendance();
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(`Failed to update attendance: ${error.message}`);
    }
    console.error('Error updating attendance:', error);
  }
};

  const openEditModal = (record: ProcessedAttendanceRecord) => {
    setSelectedRecord(record);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const fetchRegularizationRequests = async () => {
    setLoadingRequests(true);
    try {
      const data = await attendanceApi.getRegularizationRequests();
      setRegularizationRequests(data);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load regularization requests: ${error.message}`);
      }
      console.error('Error fetching regularization requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats based on ALL employees (not just attendance records)
  const stats = {
    total: totalEmployees,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
  };

  const handleApprove = async (request: RegularizationRequest) => {
    try {
      await attendanceApi.approveRegularization(request.id, 'approve');
      toast.success(`Regularization request approved for ${request.user_name}`);
      
      // Refresh the requests list
      fetchRegularizationRequests();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to approve request: ${error.message}`);
      }
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionComment.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await attendanceApi.approveRegularization(selectedRequest.id, 'reject', rejectionComment);
      toast.success(`Regularization request rejected for ${selectedRequest.user_name}`);
      
      // Refresh the requests list
      fetchRegularizationRequests();
      
      setShowApprovalDialog(false);
      setSelectedRequest(null);
      setRejectionComment('');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to reject request: ${error.message}`);
      }
      console.error('Error rejecting request:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Team Attendance</h1>
        <p className="text-gray-500">Monitor and manage your team's attendance</p>
      </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Total Team Card */}
  <div className="border-l-4 border-blue-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-lg">
        <Users className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Team</p>
        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
      </div>
    </div>
  </div>

  {/* Present Today Card */}
  <div className="border-l-4 border-green-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <CheckCircle className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Present Today</p>
        <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
      </div>
    </div>
  </div>

  {/* Absent Card */}
  <div className="border-l-4 border-red-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-100 rounded-lg">
        <XCircle className="w-6 h-6 text-red-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">Absent</p>
        <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
      </div>
    </div>
  </div>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading attendance data...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map(record => (
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
                          record.status === 'present' ? 'default' : 'destructive'
                        }>
                          {record.status === 'present' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Present</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Absent</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.checkInTime || '--'}</TableCell>
                      <TableCell>{record.checkOutTime || '--'}</TableCell>
                      <TableCell className="text-right">
                        {record.totalHours ? `${formatHours(record.totalHours)}` : '--'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(record)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditAttendanceModal
        record={selectedRecord}
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditAttendance}
      />

      <Card>
        <CardHeader>
          <CardTitle>Pending Regularization Requests</CardTitle>
          <CardDescription>Review and approve attendance corrections</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <div className="text-center py-8">
              <p>Loading regularization requests...</p>
            </div>
          ) : regularizationRequests.filter(r => r.status === 'pending').length > 0 ? (
            <div className="space-y-3">
              {regularizationRequests.filter(r => r.status === 'pending').map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="font-medium">{request.user_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(request.work_date)} - {request.type.replace('_', ' ')} to {request.proposed_time}
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
                      onClick={() => handleApprove(request)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No pending requests</p>
          )}
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
              <p>{selectedRequest?.user_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Request</p>
              <p>{selectedRequest?.type.replace('_', ' ')} - {selectedRequest?.proposed_time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p>{selectedRequest ? formatDate(selectedRequest.work_date) : ''}</p>
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