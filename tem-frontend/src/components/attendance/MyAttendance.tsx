// components/attendance/MyAttendance.tsx
import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { User } from '../../App';
import { attendanceApi, AttendanceDay } from '../../services/attendance-api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface MyAttendanceProps {
  user: User;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  holiday: number;
  totalHours: number;
  averageHours: number;
}

export function MyAttendance({ user }: MyAttendanceProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [workedHours, setWorkedHours] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceDay | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    holiday: 0,
    totalHours: 0,
    averageHours: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<AttendanceDay[]>([]);
  const useApi = apiConfig.hasBaseUrl();

  // Fetch today's attendance and weekly data on mount
  useEffect(() => {
    if (useApi) {
      fetchTodayAttendance();
      fetchWeeklyStats();
      fetchRecentAttendance();
    } else {
      // Mock data for demo
      loadMockData();
    }
  }, [useApi]);

  const loadMockData = () => {
    setWeeklyStats({
      present: 4,
      absent: 1,
      late: 1,
      halfDay: 0,
      leave: 1,
      holiday: 0,
      totalHours: 32.5,
      averageHours: 8.1
    });
    
    const mockRecent: AttendanceDay[] = [
      {
        id: '1',
        companyId: '1',
        employeeId: '1',
        date: '2024-11-06',
        clockIn: '2024-11-06T09:10:00Z',
        clockOut: '2024-11-06T18:15:00Z',
        status: 'present',
        workHours: 8.5,
        createdAt: '2024-11-06T09:10:00Z',
        updatedAt: '2024-11-06T18:15:00Z'
      },
      // Add more mock data as needed
    ];
    setRecentAttendance(mockRecent);
  };

  const fetchTodayAttendance = async () => {
    if (!useApi) return;
    
    try {
      const data = await attendanceApi.getToday();
      setAttendanceData(data);
      
      if (data) {
        setCheckInTime(formatTime(data.clockIn));
        setIsCheckedIn(!data.clockOut);
        
        if (data.clockOut) {
          setCheckOutTime(formatTime(data.clockOut));
          setWorkedHours(data.workHours || 0);
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch attendance:', error.message);
      }
    }
  };

  const fetchWeeklyStats = async () => {
    if (!useApi) return;
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const stats = await attendanceApi.getWeeklyStats(
        startDate.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      setWeeklyStats(stats);
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
    }
  };

  const fetchRecentAttendance = async () => {
    if (!useApi) return;
    
    try {
      const recent = await attendanceApi.getRecent(7);
      setRecentAttendance(recent);
    } catch (error) {
      console.error('Failed to fetch recent attendance:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleCheckIn = async () => {
    if (useApi) {
      setIsLoading(true);
      try {
        const data = await attendanceApi.clockIn();
        setAttendanceData(data);
        
        const time = formatTime(data.clockIn);
        setCheckInTime(time);
        setIsCheckedIn(true);
        toast.success(`Checked in at ${time}`);
        
        // Refresh data
        fetchWeeklyStats();
        fetchRecentAttendance();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock mode
      const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setCheckInTime(time);
      setIsCheckedIn(true);
      toast.success(`Checked in at ${time}`);
    }
  };

  const handleCheckOut = async () => {
    if (useApi) {
      setIsLoading(true);
      try {
        const data = await attendanceApi.clockOut();
        setAttendanceData(data);
        
        if (data.clockOut) {
          const time = formatTime(data.clockOut);
          setCheckOutTime(time);
          setIsCheckedIn(false);
          setWorkedHours(data.workHours || 0);
          toast.success(`Checked out at ${time}. Total hours: ${data.workHours}`);
        }
        
        // Refresh data
        fetchWeeklyStats();
        fetchRecentAttendance();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock mode
      const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      setCheckOutTime(time);
      setIsCheckedIn(false);
      const hours = 8.5;
      setWorkedHours(hours);
      toast.success(`Checked out at ${time}. Total hours: ${hours}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'present': { variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      'absent': { variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
      'on_leave': { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-700' },
      'holiday': { variant: 'outline' as const, className: 'bg-purple-100 text-purple-700' },
      'half_day': { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-700' },
      'late': { variant: 'outline' as const, className: 'bg-orange-100 text-orange-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDisplayDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-gray-500">{today}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
            <CardDescription>Track your attendance for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className={`p-6 rounded-lg border-2 ${
                isCheckedIn ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCheckedIn ? 'bg-green-600' : 'bg-gray-400'
                    }`}>
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${isCheckedIn ? 'text-green-600' : 'text-gray-600'}`}>
                        {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                      </p>
                      <p className="text-sm text-gray-500">Current Status</p>
                    </div>
                  </div>
                  {!checkOutTime && (
                    <Button
                      size="lg"
                      variant={isCheckedIn ? 'destructive' : 'default'}
                      onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                      className="gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        'Loading...'
                      ) : isCheckedIn ? (
                        <>
                          <LogOut className="w-4 h-4" />
                          Check Out
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          Check In
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">First Check-in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{checkInTime || '--:--'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Last Check-out</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{checkOutTime || '--:--'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{workedHours > 0 ? `${workedHours} hrs` : '--'}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week Summary</CardTitle>
            <CardDescription>Your attendance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Present</span>
                <span className="font-medium">{weeklyStats.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Days Absent</span>
                <span className="font-medium text-red-600">{weeklyStats.absent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Leaves Taken</span>
                <span className="font-medium text-blue-600">{weeklyStats.leave}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Holidays</span>
                <span className="font-medium text-purple-600">{weeklyStats.holiday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Late Arrivals</span>
                <span className="font-medium text-orange-600">{weeklyStats.late}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Half Days</span>
                <span className="font-medium text-yellow-600">{weeklyStats.halfDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Hours</span>
                <span className="font-medium">{weeklyStats.totalHours.toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Hours</span>
                <span className="font-medium">{weeklyStats.averageHours.toFixed(1)} hrs/day</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your attendance history for the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                <div className="flex-1">
                  <p className="font-medium">{formatDisplayDate(record.date)}</p>
                  <p className="text-sm text-gray-500">{formatDisplayDay(record.date)}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Check In</p>
                    <p className="font-medium">{record.clockIn ? formatTime(record.clockIn) : '--'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Check Out</p>
                    <p className="font-medium">{record.clockOut ? formatTime(record.clockOut) : '--'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Hours</p>
                    <p className="font-medium">{record.workHours ? `${record.workHours} hrs` : '--'}</p>
                  </div>
                  <div>
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              </div>
            ))}
            
            {recentAttendance.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No attendance records found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}