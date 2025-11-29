import { useState, useEffect, useRef } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { attendanceApi, AttendanceDay, AttendanceSummary, RecentAttendance } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface MyAttendanceProps {
  user: User;
}

export function MyAttendance({ user }: MyAttendanceProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [workedHours, setWorkedHours] = useState(0);
  const [currentSessionTime, setCurrentSessionTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceDay | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<AttendanceSummary | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<RecentAttendance[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [checkInTimestamp, setCheckInTimestamp] = useState<Date | null>(null);
  
  const useApi = apiConfig.hasBaseUrl();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateHours = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
  };

  const calculateCurrentTime = (start: Date) => {
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatCurrentSession = (time: { hours: number; minutes: number; seconds: number }) => {
    const { hours, minutes, seconds } = time;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Start/stop timer based on check-in status
  useEffect(() => {
    if (isCheckedIn && checkInTimestamp) {
      // Start the timer with 1-second intervals
      timerRef.current = setInterval(() => {
        const time = calculateCurrentTime(checkInTimestamp);
        setCurrentSessionTime(time);
      }, 1000); // Update every second

      // Initial calculation
      const time = calculateCurrentTime(checkInTimestamp);
      setCurrentSessionTime(time);
    } else {
      // Stop the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentSessionTime({ hours: 0, minutes: 0, seconds: 0 });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCheckedIn, checkInTimestamp]);

  // Fetch all attendance data on mount
  useEffect(() => {
    if (useApi) {
      fetchAllAttendanceData();
    }
  }, [useApi]);

  const fetchAllAttendanceData = async () => {
    await Promise.all([
      fetchTodayAttendance(),
      fetchWeeklySummary(),
      fetchRecentAttendance()
    ]);
  };

  const fetchTodayAttendance = async () => {
    if (!useApi) return;
    
    try {
      const data = await attendanceApi.getToday();
      setAttendanceData(data);
      
      if (data.check_in_at) {
        const checkInTime = new Date(data.check_in_at);
        setCheckInTime(checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));
        
        // If checked in but not checked out, start the timer
        if (!data.check_out_at) {
          setIsCheckedIn(true);
          setCheckInTimestamp(checkInTime);
        } else {
          setIsCheckedIn(false);
          setCheckInTimestamp(null);
        }
      }
      
      if (data.check_out_at) {
        setCheckOutTime(new Date(data.check_out_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));
        
        if (data.check_in_at) {
          const hours = calculateHours(data.check_in_at, data.check_out_at);
          setWorkedHours(hours);
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch today\'s attendance:', error.message);
      }
    }
  };

  const fetchWeeklySummary = async () => {
    if (!useApi) return;
    
    setLoadingSummary(true);
    try {
      const data = await attendanceApi.getWeeklySummary();
      setWeeklySummary(data);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch weekly summary:', error.message);
      }
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchRecentAttendance = async () => {
    if (!useApi) return;
    
    setLoadingRecent(true);
    try {
      const data = await attendanceApi.getRecentAttendance(7);
      setRecentAttendance(data);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch recent attendance:', error.message);
      }
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleCheckIn = async () => {
    if (useApi) {
      setIsLoading(true);
      try {
        const data = await attendanceApi.clockIn();
        setAttendanceData(data);
        
        const checkInTime = new Date(data.check_in_at!);
        const timeString = checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        
        setCheckInTime(timeString);
        setIsCheckedIn(true);
        setCheckInTimestamp(checkInTime);
        setCurrentSessionTime({ hours: 0, minutes: 0, seconds: 0 });
        toast.success(`Checked in at ${timeString}`);
        
        // Refresh all data after check-in
        await fetchAllAttendanceData();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock mode
      const time = getCurrentTime();
      const now = new Date();
      setCheckInTime(time);
      setIsCheckedIn(true);
      setCheckInTimestamp(now);
      setCurrentSessionTime({ hours: 0, minutes: 0, seconds: 0 });
      toast.success(`Checked in at ${time}`);
    }
  };

  const handleCheckOut = async () => {
    if (useApi) {
      setIsLoading(true);
      try {
        const data = await attendanceApi.clockOut();
        setAttendanceData(data);
        
        const time = new Date(data.check_out_at!).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        setCheckOutTime(time);
        setIsCheckedIn(false);
        setCheckInTimestamp(null);
        
        if (data.check_in_at) {
          const hours = calculateHours(data.check_in_at, data.check_out_at!);
          setWorkedHours(hours);
          toast.success(`Checked out at ${time}. Total hours: ${formatHours(hours)}`);
        }
        
        // Refresh all data after check-out
        await fetchAllAttendanceData();
      } catch (error) {
        if (error instanceof ApiError) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock mode
      const time = getCurrentTime();
      setCheckOutTime(time);
      setIsCheckedIn(false);
      setCheckInTimestamp(null);
      const hours = 8.5;
      setWorkedHours(hours);
      toast.success(`Checked out at ${time}. Total hours: ${formatHours(hours)}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
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
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
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
                      <p className={isCheckedIn ? 'text-green-600' : 'text-gray-600'}>
                        {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                      </p>
                      <p className="text-sm text-gray-500">Current Status</p>
                      {isCheckedIn && checkInTimestamp && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          Current session: {formatCurrentSession(currentSessionTime)}
                        </p>
                      )}
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
  <div className="border-2 border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 transition-colors">
    <p className="text-xs text-gray-600 mb-1">First Check-in</p>
    <p className="text-lg font-semibold text-gray-800">{checkInTime || '--:--'}</p>
  </div>

  <div className="border-2 border-gray-200 rounded-lg p-4 text-center hover:border-green-300 transition-colors">
    <p className="text-xs text-gray-600 mb-1">Last Check-out</p>
    <p className="text-lg font-semibold text-gray-800">{checkOutTime || '--:--'}</p>
  </div>

  <div className="border-2 border-gray-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
    <p className="text-xs text-gray-600 mb-1">Total Hours</p>
    <p className="text-lg font-semibold text-gray-800">{workedHours > 0 ? `${workedHours} hrs` : '--'}</p>
  </div>
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
                <span>{loadingSummary ? '...' : (weeklySummary?.daysPresent || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Hours</span>
                <span>{loadingSummary ? '...' : (weeklySummary?.totalHours ? `${weeklySummary.totalHours} hrs` : '0 hrs')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Hours</span>
                <span>{loadingSummary ? '...' : (weeklySummary?.averageHours ? `${weeklySummary.averageHours} hrs/day` : '0 hrs/day')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Late Arrivals</span>
                <span className="text-red-600">{loadingSummary ? '...' : (weeklySummary?.lateArrivals || 0)}</span>
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
          {loadingRecent ? (
            <div className="text-center py-8">
              <p>Loading recent attendance...</p>
            </div>
          ) : recentAttendance.length > 0 ? (
            <div className="space-y-2">
              {recentAttendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex-1">
                    <p>{formatDate(record.date)}</p>
                    <p className="text-sm text-gray-500">{formatDay(record.date)}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Check In</p>
                      <p>{record.checkIn || '--:--'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Check Out</p>
                      <p>{record.checkOut || '--:--'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Hours</p>
                      <p>{record.hours > 0 ? `${formatHours(record.hours)}` : '--'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      record.status === 'Present' ? 'bg-green-100 text-green-700' : 
                      record.status === 'Absent' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No attendance records found for the past week.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}