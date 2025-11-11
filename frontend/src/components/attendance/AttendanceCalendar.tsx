import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { User } from '../../App';
import { attendanceApi, AttendanceDay } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface AttendanceCalendarProps {
  user: User;
}

interface DayData {
  date: number;
  status: 'present' | 'absent' | 'leave' | 'weekend' | 'holiday' | 'half-day' | null;
  checkIn?: string;
  checkOut?: string;
  hours?: number;
  notes?: string;
  workDate?: string;
}

export function AttendanceCalendar({ user }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [regularizationType, setRegularizationType] = useState<'check_in' | 'check_out'>('check_in');
  const [proposedTime, setProposedTime] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch attendance data when month changes
  useEffect(() => {
    if (useApi) {
      fetchAttendanceData();
    }
  }, [currentMonth, useApi]);

  const fetchAttendanceData = async () => {
    if (!useApi) return;
    
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await attendanceApi.getCalendar(year, month);
      console.log("Calendar Data", data);
      setAttendanceData(data);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch attendance calendar:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize dates for comparison
  const normalizeDate = (dateString: string): string => {
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  // Helper function to format time in Indian format (24-hour format)
  const formatTimeToIndian = (dateString: string): string => {
    const date = new Date(dateString);
    // Use IST timezone (UTC+5:30)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Use 24-hour format
    });
  };

  // Helper function to create date string in IST
  const createISTDateString = (year: number, month: number, day: number): string => {
    // Create date in local timezone (assuming server uses IST)
    const date = new Date(year, month, day);
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (DayData | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month with real attendance data
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const dayOfWeek = currentDate.getDay();
      const dateString = createISTDateString(year, month, i);
      
      // Find attendance record for this date using normalized comparison
      const attendanceRecord = attendanceData.find(record => {
        const recordDate = normalizeDate(record.work_date);
        return recordDate === dateString;
      });

      let status: DayData['status'] = null;
      
      // Determine status based on day and attendance record
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      } else if (attendanceRecord) {
        if (attendanceRecord.status === 'present') {
          status = 'present';
        } else if (attendanceRecord.status === 'absent') {
          status = 'absent';
        } else if (attendanceRecord.status === 'leave') {
          status = 'leave';
        } else if (attendanceRecord.status === 'half-day') {
          status = 'half-day';
        }
      } else {
        // No record found for a weekday - consider as future day or absent
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (currentDate > today) {
          status = null; // Future date
        } else {
          status = 'absent'; // Past weekday with no attendance record
        }
      }

      // Calculate hours if check-in and check-out exist
      let hours = undefined;
      if (attendanceRecord?.check_in_at && attendanceRecord?.check_out_at) {
        const checkIn = new Date(attendanceRecord.check_in_at);
        const checkOut = new Date(attendanceRecord.check_out_at);
        const diff = checkOut.getTime() - checkIn.getTime();
        hours = Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
      }

      days.push({
        date: i,
        status,
        checkIn: attendanceRecord?.check_in_at ? 
          formatTimeToIndian(attendanceRecord.check_in_at) : undefined,
        checkOut: attendanceRecord?.check_out_at ? 
          formatTimeToIndian(attendanceRecord.check_out_at) : undefined,
        hours,
        workDate: dateString
      });
    }
    
    return days;
  };

  const handleRequestRegularization = async () => {
    if (!selectedDay || !proposedTime || !reason.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await attendanceApi.requestRegularization({
        workDate: selectedDay.workDate!,
        type: regularizationType,
        proposedTime,
        reason
      });
      
      toast.success('Regularization request submitted successfully');
      setShowRegularizationModal(false);
      setProposedTime('');
      setReason('');
      setRegularizationType('check_in');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to submit request: ${error.message}`);
      }
      console.error('Error submitting regularization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-IN', { 
    month: 'long', 
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getStatusColor = (status: DayData['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200';
      case 'absent':
        return 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200';
      case 'leave':
        return 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200';
      case 'weekend':
        return 'bg-gray-100 border-gray-300 text-gray-500';
      case 'holiday':
        return 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200';
      case 'half-day':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200';
      default:
        return 'bg-white border-gray-200 text-gray-400';
    }
  };

  const handleDayClick = (day: DayData) => {
    console.log('Clicked date:', day.date, 'Work date:', day.workDate);
    if (day.status && day.status !== 'weekend') {
      setSelectedDay(day);
      setShowDetails(true);
    }
  };

  // Calculate statistics from real data
  const stats = {
    present: attendanceData.filter(d => d.status === 'present').length,
    absent: attendanceData.filter(d => d.status === 'absent').length,
    leaves: attendanceData.filter(d => d.status === 'leave').length,
    totalHours: attendanceData
      .filter(d => d.check_in_at && d.check_out_at)
      .reduce((sum, d) => {
        const checkIn = new Date(d.check_in_at!);
        const checkOut = new Date(d.check_out_at!);
        const diff = checkOut.getTime() - checkIn.getTime();
        return sum + (diff / (1000 * 60 * 60));
      }, 0),
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Format date for display in Indian format
  const formatIndianDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Attendance Calendar</h1>
        <p className="text-gray-500">View your monthly attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-l-4 border-green-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Days Present</p>
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-red-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Days Absent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-blue-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Leaves Taken</p>
              <p className="text-2xl font-bold text-gray-900">{stats.leaves}</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-purple-500 bg-white rounded-r-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalHours > 0 ? `${formatHours(stats.totalHours)}` : '0h 0m'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{monthName}</CardTitle>
              <CardDescription>
                {loading ? 'Loading attendance data...' : 'Click on any day to view details'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth} disabled={loading}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} disabled={loading}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading calendar data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center p-2 text-sm text-gray-500">
                    {day}
                  </div>
                ))}
                
                {days.map((day, index) => (
                  <div key={index}>
                    {day ? (
                      <button
                        onClick={() => handleDayClick(day)}
                        className={`w-full aspect-square p-2 rounded-lg border-2 transition-all ${getStatusColor(day.status)} ${
                          day.status && day.status !== 'weekend' ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                        }`}
                        disabled={!day.status || day.status === 'weekend'}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className={day.status ? '' : 'text-gray-400'}>{day.date}</span>
                          {day.hours && <span className="text-xs mt-1">{formatHours(day.hours)}</span>}
                          {day.status === 'half-day' && !day.hours && (
                            <span className="text-xs mt-1">½</span>
                          )}
                        </div>
                      </button>
                    ) : (
                      <div className="w-full aspect-square" />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300" />
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300" />
                  <span>Leave</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300" />
                  <span>Weekend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300" />
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300" />
                  <span>Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-white border-2 border-gray-200" />
                  <span>Future Date</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Day Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Attendance Details - {currentMonth.toLocaleDateString('en-IN', { 
                month: 'long',
                timeZone: 'Asia/Kolkata'
              })} {selectedDay?.date}
            </DialogTitle>
            <DialogDescription>
              View your attendance information for this day
            </DialogDescription>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                <Badge 
                  variant={
                    selectedDay.status === 'present' ? 'default' :
                    selectedDay.status === 'absent' ? 'destructive' :
                    selectedDay.status === 'leave' ? 'secondary' :
                    'outline'
                  }
                >
                  {selectedDay.status ? selectedDay.status.charAt(0).toUpperCase() + selectedDay.status.slice(1) : 'No Record'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Check In Time</span>
                <span>{selectedDay.checkIn || '--'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Check Out Time</span>
                <span>{selectedDay.checkOut || '--'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Hours</span>
                <span>{selectedDay.hours ? `${formatHours(selectedDay.hours)}` : '--'}</span>
              </div>
              
              {/* Debug information */}
              <div className="text-xs text-gray-400 border-t pt-2">
                <div>Date: {selectedDay.date}</div>
                <div>Work Date: {selectedDay.workDate}</div>
                <div>Formatted: {selectedDay.workDate ? formatIndianDate(selectedDay.workDate) : 'N/A'}</div>
              </div>
              
              {selectedDay.notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedDay.notes}</p>
                </div>
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  console.log('Opening regularization for:', selectedDay.date, selectedDay.workDate);
                  setShowDetails(false);
                  setShowRegularizationModal(true);
                }}
              >
                Request Regularization
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Regularization Request Modal */}
      <Dialog open={showRegularizationModal} onOpenChange={setShowRegularizationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Attendance Regularization</DialogTitle>
            <DialogDescription>
              Request correction for {selectedDay?.workDate ? formatIndianDate(selectedDay.workDate) : 'selected date'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Correction Type</Label>
              <Select value={regularizationType} onValueChange={(value: 'check_in' | 'check_out') => setRegularizationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check_in">Check-in Time</SelectItem>
                  <SelectItem value="check_out">Check-out Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Proposed Time</Label>
              <Input
                type="time"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                placeholder="Explain why you need this correction..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegularizationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestRegularization} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}