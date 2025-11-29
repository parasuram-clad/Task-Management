import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { attendanceApi, AttendanceDay } from '../../services/api';
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
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceDay | null>(null);
  const useApi = apiConfig.hasBaseUrl();

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

  // Fetch today's attendance on mount
  useEffect(() => {
    if (useApi) {
      fetchTodayAttendance();
    }
  }, [useApi]);

  const fetchTodayAttendance = async () => {
    if (!useApi) return;
    
    try {
      const data = await attendanceApi.getToday();
      setAttendanceData(data);
      
      if (data.check_in_at) {
        setCheckInTime(new Date(data.check_in_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }));
        setIsCheckedIn(!data.check_out_at);
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
        console.error('Failed to fetch attendance:', error.message);
      }
    }
  };

  const handleCheckIn = async () => {
    if (useApi) {
      setIsLoading(true);
      try {
        const data = await attendanceApi.clockIn();
        setAttendanceData(data);
        
        const time = new Date(data.check_in_at!).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        setCheckInTime(time);
        setIsCheckedIn(true);
        toast.success(`Checked in at ${time}`);
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
        
        const time = new Date(data.check_out_at!).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        setCheckOutTime(time);
        setIsCheckedIn(false);
        
        if (data.check_in_at) {
          const hours = calculateHours(data.check_in_at, data.check_out_at!);
          setWorkedHours(hours);
          toast.success(`Checked out at ${time}. Total hours: ${hours}`);
        }
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
      const hours = 8.5;
      setWorkedHours(hours);
      toast.success(`Checked out at ${time}. Total hours: ${hours}`);
    }
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
        <h1>My Attendance</h1>
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
                    <p>{checkInTime || '--:--'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Last Check-out</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{checkOutTime || '--:--'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{workedHours > 0 ? `${workedHours} hrs` : '--'}</p>
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
                <span>4</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Hours</span>
                <span>32.5 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Hours</span>
                <span>8.1 hrs/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Late Arrivals</span>
                <span className="text-red-600">1</span>
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
            {[
              { date: 'Nov 6, 2024', day: 'Wednesday', checkIn: '09:10 AM', checkOut: '06:15 PM', hours: 8.5, status: 'Present' },
              { date: 'Nov 5, 2024', day: 'Tuesday', checkIn: '09:25 AM', checkOut: '06:10 PM', hours: 8.25, status: 'Present' },
              { date: 'Nov 4, 2024', day: 'Monday', checkIn: '09:05 AM', checkOut: '06:20 PM', hours: 8.75, status: 'Present' },
              { date: 'Nov 1, 2024', day: 'Friday', checkIn: '09:15 AM', checkOut: '06:05 PM', hours: 8.5, status: 'Present' },
              { date: 'Oct 31, 2024', day: 'Thursday', checkIn: '--', checkOut: '--', hours: 0, status: 'Absent' },
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
                <div className="flex-1">
                  <p>{record.date}</p>
                  <p className="text-sm text-gray-500">{record.day}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Check In</p>
                    <p>{record.checkIn}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Check Out</p>
                    <p>{record.checkOut}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Hours</p>
                    <p>{record.hours > 0 ? `${record.hours} hrs` : '--'}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {record.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
