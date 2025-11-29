import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { User } from '../../App';
import { attendanceApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface AttendanceCalendarProps {
  user: User;
}

interface DayData {
  date: Date;
  status: 'present' | 'absent' | 'leave' | 'weekend' | 'holiday' | 'half-day' | 'late' | null;
  checkIn?: string;
  checkOut?: string;
  hours?: number;
  notes?: string;
  isToday?: boolean;
  canRegularize?: boolean;
}

interface RegularizationRequest {
  date: string;
  type: 'check-in' | 'check-out' | 'both';
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  reason: string;
}

export function AttendanceCalendar({ user }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRegularization, setShowRegularization] = useState(false);
  const [regularizationData, setRegularizationData] = useState<RegularizationRequest>({
    date: '',
    type: 'check-in',
    reason: ''
  });
  const [calendarData, setCalendarData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch calendar data
  useEffect(() => {
    if (useApi) {
      fetchCalendarData();
    } else {
      // Mock data for demo
      generateMockCalendarData();
    }
  }, [currentMonth, useApi]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await attendanceApi.getCalendar(year, month);
      setCalendarData(transformApiData(data));
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load calendar: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: DayData[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      
      let status: DayData['status'] = null;
      let checkIn, checkOut, hours;

      // Mock logic for different statuses
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = 'weekend';
      } else if (i % 10 === 0) {
        status = 'holiday';
      } else if (i % 7 === 0) {
        status = 'leave';
      } else if (i % 8 === 0) {
        status = 'absent';
      } else if (i % 12 === 0) {
        status = 'half-day';
        checkIn = '09:00 AM';
        checkOut = '01:00 PM';
        hours = 4;
      } else if (i % 5 === 0) {
        status = 'late';
        checkIn = '10:30 AM';
        checkOut = '06:00 PM';
        hours = 7.5;
      } else {
        status = 'present';
        checkIn = '09:15 AM';
        checkOut = '06:10 PM';
        hours = 8.5;
      }

      data.push({
        date,
        status,
        checkIn,
        checkOut,
        hours,
        isToday: isToday(date),
        canRegularize: canRegularize(date, status)
      });
    }

    setCalendarData(data);
  };

  const transformApiData = (apiData: any[]): DayData[] => {
    return apiData.map(item => ({
      date: new Date(item.date),
      status: item.status as DayData['status'],
      checkIn: item.check_in_at ? new Date(item.check_in_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : undefined,
      checkOut: item.check_out_at ? new Date(item.check_out_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : undefined,
      hours: item.work_hours,
      notes: item.remarks,
      isToday: isToday(new Date(item.date)),
      canRegularize: canRegularize(new Date(item.date), item.status)
    }));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const canRegularize = (date: Date, status: DayData['status']) => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return date >= sevenDaysAgo && date <= today && 
           (status === 'absent' || status === 'late' || status === null);
  };

  const getDaysInMonthGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (DayData | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    calendarData.forEach(day => {
      days.push(day);
    });
    
    return days;
  };

  const days = getDaysInMonthGrid();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
      case 'late':
        return 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getStatusBadge = (status: DayData['status']) => {
    const statusConfig = {
      'present': { variant: 'default' as const, label: 'Present' },
      'absent': { variant: 'destructive' as const, label: 'Absent' },
      'leave': { variant: 'secondary' as const, label: 'Leave' },
      'weekend': { variant: 'outline' as const, label: 'Weekend' },
      'holiday': { variant: 'outline' as const, label: 'Holiday' },
      'half-day': { variant: 'outline' as const, label: 'Half Day' },
      'late': { variant: 'outline' as const, label: 'Late' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline', label: 'Not Recorded' };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const handleDayClick = (day: DayData) => {
    setSelectedDay(day);
    setShowDetails(true);
  };

  const handleRegularization = () => {
    if (!selectedDay) return;
    
    setRegularizationData({
      date: selectedDay.date.toISOString().split('T')[0],
      type: 'check-in',
      reason: ''
    });
    setShowDetails(false);
    setShowRegularization(true);
  };

  const submitRegularization = async () => {
    if (!regularizationData.reason.trim()) {
      toast.error('Please provide a reason for regularization');
      return;
    }

    setIsLoading(true);
    try {
      if (useApi) {
        await attendanceApi.requestRegularization(regularizationData);
        toast.success('Regularization request submitted successfully');
      } else {
        // Mock success
        toast.success('Regularization request submitted for approval');
      }
      setShowRegularization(false);
      fetchCalendarData(); // Refresh data
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to submit request: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    present: calendarData.filter(d => d.status === 'present').length,
    absent: calendarData.filter(d => d.status === 'absent').length,
    leaves: calendarData.filter(d => d.status === 'leave').length,
    holidays: calendarData.filter(d => d.status === 'holiday').length,
    late: calendarData.filter(d => d.status === 'late').length,
    halfDays: calendarData.filter(d => d.status === 'half-day').length,
    totalHours: calendarData.filter(d => d.hours).reduce((sum, d) => sum + (d.hours || 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Calendar</h1>
        <p className="text-gray-500">View your monthly attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Days Present</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 font-medium">{stats.present}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Days Absent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 font-medium">{stats.absent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Leaves Taken</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-600 font-medium">{stats.leaves}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{stats.totalHours.toFixed(1)} hrs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{monthName}</CardTitle>
              <CardDescription>Click on any day to view details</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center p-2 text-sm text-gray-500 font-medium">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => (
              <div key={index}>
                {day ? (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`w-full aspect-square p-2 rounded-lg border-2 transition-all ${getStatusColor(day.status)} ${
                      day.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className={`font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.date.getDate()}
                      </span>
                      {day.hours && <span className="text-xs mt-1">{day.hours}h</span>}
                      {day.canRegularize && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1" title="Can regularize" />
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
              <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-300" />
              <span>Late</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Attendance Details - {selectedDay?.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </DialogTitle>
            <DialogDescription>
              View your attendance information for this day
            </DialogDescription>
          </DialogHeader>
          
          {selectedDay && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Status</span>
                {getStatusBadge(selectedDay.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Check In Time</span>
                <span className="font-medium">{selectedDay.checkIn || '--'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Check Out Time</span>
                <span className="font-medium">{selectedDay.checkOut || '--'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Hours</span>
                <span className="font-medium">{selectedDay.hours ? `${selectedDay.hours} hours` : '--'}</span>
              </div>
              
              {selectedDay.notes && (
                <div>
                  <p className="text-gray-500 text-sm mb-1">Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedDay.notes}</p>
                </div>
              )}
              
              {selectedDay.canRegularize && (
                <Button onClick={handleRegularization} className="w-full gap-2">
                  <Clock className="w-4 h-4" />
                  Request Regularization
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Regularization Dialog */}
      <Dialog open={showRegularization} onOpenChange={setShowRegularization}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Request Attendance Regularization
              </div>
            </DialogTitle>
            <DialogDescription>
              Submit a request to correct your attendance for {regularizationData.date}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Regularization Type</label>
              <Select 
                value={regularizationData.type} 
                onValueChange={(value: 'check-in' | 'check-out' | 'both') => 
                  setRegularizationData({...regularizationData, type: value})
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check-in">Check-in Correction</SelectItem>
                  <SelectItem value="check-out">Check-out Correction</SelectItem>
                  <SelectItem value="both">Both Check-in & Check-out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(regularizationData.type === 'check-in' || regularizationData.type === 'both') && (
              <div>
                <label className="text-sm font-medium">Proposed Check-in Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={regularizationData.proposedCheckIn}
                  onChange={(e) => setRegularizationData({...regularizationData, proposedCheckIn: e.target.value})}
                />
              </div>
            )}

            {(regularizationData.type === 'check-out' || regularizationData.type === 'both') && (
              <div>
                <label className="text-sm font-medium">Proposed Check-out Time</label>
                <input
                  type="time"
                  className="w-full p-2 border rounded-md"
                  value={regularizationData.proposedCheckOut}
                  onChange={(e) => setRegularizationData({...regularizationData, proposedCheckOut: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Reason for Regularization</label>
              <Textarea
                placeholder="Please explain why you need to regularize this attendance..."
                value={regularizationData.reason}
                onChange={(e) => setRegularizationData({...regularizationData, reason: e.target.value})}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegularization(false)}>
              Cancel
            </Button>
            <Button onClick={submitRegularization} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}