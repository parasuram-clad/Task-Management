import { useState, useEffect } from 'react';
import { Download, Calendar, Clock, UserCheck, UserX, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { toast } from 'sonner@2.0.3';
import { User } from '../../App';
import { reportsApi, attendanceApi } from '../../services/api';
import { apiConfig } from '../../services/api-config';
import { ApiError } from '../../services/api-client';

interface AttendanceReportProps {
  user: User;
}

interface ReportData {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  location: string;
  daysPresent: number;
  daysAbsent: number;
  leaves: number;
  lateArrivals: number;
  earlyCheckouts: number;
  totalHours: number;
}

interface DailyAttendance {
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: string;
  lateArrival: boolean;
  earlyCheckout: boolean;
  lateCheckout: boolean;
  earlyCheckin: boolean;
}

interface WeeklyEmployeeData {
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  dailyAttendance: DailyAttendance[];
  totalHours: number;
  presentDays: number;
  absentDays: number;
  lateArrivals: number;
  earlyCheckouts: number;
}

interface MonthlyWeekData {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  employees: WeeklyEmployeeData[];
  totalHours: number;
  presentDays: number;
  absentDays: number;
}

// Helper function to get week dates from a date
const getWeekDates = (date: Date) => {
  const dayOfWeek = date.getDay();
  
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    weekNumber: Math.ceil((startDate.getDate() + new Date(startDate.getFullYear(), startDate.getMonth(), 1).getDay()) / 7)
  };
};

// Helper function to get current week dates
const getCurrentWeekDates = () => {
  return getWeekDates(new Date());
};

// Helper function to get previous week
const getPreviousWeek = (currentStartDate: string) => {
  const date = new Date(currentStartDate);
  date.setDate(date.getDate() - 7);
  return getWeekDates(date);
};

// Helper function to get next week
const getNextWeek = (currentStartDate: string) => {
  const date = new Date(currentStartDate);
  date.setDate(date.getDate() + 7);
  return getWeekDates(date);
};

// Helper function to get month weeks
const getMonthWeeks = (year: number, month: number) => {
  const weeks: MonthlyWeekData[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentDate = new Date(firstDay);
  
  while (currentDate <= lastDay) {
    const weekDates = getWeekDates(new Date(currentDate));
    
    // Only include weeks that have at least one day in the current month
    if (new Date(weekDates.endDate).getMonth() === month || new Date(weekDates.startDate).getMonth() === month) {
      weeks.push({
        weekStart: weekDates.startDate,
        weekEnd: weekDates.endDate,
        weekNumber: weekDates.weekNumber,
        employees: [],
        totalHours: 0,
        presentDays: 0,
        absentDays: 0
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
};

// Helper function to get week days
const getWeekDays = (startDate: string) => {
  const start = new Date(startDate);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: formattedDate
    });
  }
  
  return days;
};

// Helper function to get all weeks in a month
const getWeeksInMonth = (year: number, month: number) => {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let currentDate = new Date(firstDay);
  
  while (currentDate <= lastDay) {
    const weekDates = getWeekDates(new Date(currentDate));
    
    // Only include weeks that have at least one day in the current month
    if (new Date(weekDates.endDate).getMonth() === month || new Date(weekDates.startDate).getMonth() === month) {
      weeks.push({
        value: weekDates.startDate,
        label: `Week ${weekDates.weekNumber} (${new Date(weekDates.startDate).toLocaleDateString()} - ${new Date(weekDates.endDate).toLocaleDateString()})`
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Helper function to format time
const formatTime = (timeString: string) => {
  if (!timeString) return '-';
  return new Date(timeString).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Helper function to export to Excel
const exportToExcel = (data: any[], filename: string) => {
  if (data.length === 0) {
    toast.error('No data to export');
    return;
  }

  const headers = Array.from(new Set(data.flatMap(row => Object.keys(row))));
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function AttendanceReport({ user }: AttendanceReportProps) {
  const currentWeek = getCurrentWeekDates();
  const currentDate = new Date();
  const [activeTab, setActiveTab] = useState('weekly');
  const [startDate, setStartDate] = useState(currentWeek.startDate);
  const [endDate, setEndDate] = useState(currentWeek.endDate);
  const [selectedDate, setSelectedDate] = useState(currentDate.toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(currentWeek.startDate);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyEmployeeData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyWeekData[]>([]);
  const [dateBasedData, setDateBasedData] = useState<WeeklyEmployeeData[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const roles = ['all', 'employee', 'manager', 'hr', 'admin', 'finance'];
  const months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];
  
  const years = Array.from({ length: 50 }, (_, i) => currentDate.getFullYear() - 25 + i);
  const currentMonthWeeks = getWeeksInMonth(selectedYear, selectedMonth);

  // Set dates based on active tab
  useEffect(() => {
    if (activeTab === 'weekly') {
      const weekDates = getWeekDates(new Date(selectedWeek));
      setStartDate(weekDates.startDate);
      setEndDate(weekDates.endDate);
    } else if (activeTab === 'monthly') {
      const monthDates = getMonthWeeks(selectedYear, selectedMonth);
      if (monthDates.length > 0) {
        setStartDate(monthDates[0].weekStart);
        setEndDate(monthDates[monthDates.length - 1].weekEnd);
      }
    }
  }, [activeTab, selectedMonth, selectedYear, selectedWeek]);

  // Fetch report when filters change
  useEffect(() => {
    console.log('Fetching reports with:', { activeTab, startDate, endDate, roleFilter, selectedDate, selectedMonth, selectedYear, selectedWeek });
    
    fetchReport();
    if (activeTab === 'weekly') {
      fetchWeeklyDetailedReport();
    } else if (activeTab === 'monthly') {
      fetchMonthlyDetailedReport();
    } else if (activeTab === 'dateBased') {
      fetchDateBasedReport();
    }
  }, [startDate, endDate, roleFilter, activeTab, selectedDate, selectedMonth, selectedYear, selectedWeek]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        startDate,
        endDate,
      };

      if (roleFilter && roleFilter !== 'all') {
        params.roles = roleFilter;
      }

      const data = await reportsApi.attendanceReport(params);
      setReportData(data || []);
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(`Failed to load report: ${error.message}`);
      } else {
        toast.error('Failed to load attendance report');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeeklyDetailedReport = async () => {
    try {
      console.log('Fetching weekly report for:', startDate, 'to', endDate);
      
      const params: any = {
        startDate,
        endDate,
      };

      if (roleFilter && roleFilter !== 'all') {
        params.roles = roleFilter;
      }

      const data = await reportsApi.weeklyAttendanceReport(params);
      console.log('Weekly data received:', data);
      setWeeklyData(data || []);
    } catch (error) {
      console.error('Failed to load weekly detailed report:', error);
      toast.error('Failed to load weekly attendance data');
    }
  };

  const fetchMonthlyDetailedReport = async () => {
    try {
      const monthWeeks = getMonthWeeks(selectedYear, selectedMonth);
      const monthlyReportData: MonthlyWeekData[] = [];

      for (const week of monthWeeks) {
        console.log('Fetching monthly week:', week.weekStart, 'to', week.weekEnd);
        
        const params: any = {
          startDate: week.weekStart,
          endDate: week.weekEnd,
        };

        if (roleFilter && roleFilter !== 'all') {
          params.roles = roleFilter;
        }

        const weeklyData = await reportsApi.weeklyAttendanceReport(params);
        console.log(`Week ${week.weekNumber} data:`, weeklyData);
        
        monthlyReportData.push({
          ...week,
          employees: weeklyData || [],
          totalHours: weeklyData ? weeklyData.reduce((sum, emp) => sum + emp.totalHours, 0) : 0,
          presentDays: weeklyData ? weeklyData.reduce((sum, emp) => sum + emp.presentDays, 0) : 0,
          absentDays: weeklyData ? weeklyData.reduce((sum, emp) => sum + emp.absentDays, 0) : 0
        });
      }

      setMonthlyData(monthlyReportData);
      console.log('Monthly data set:', monthlyReportData);
    } catch (error) {
      console.error('Failed to load monthly detailed report:', error);
      toast.error('Failed to load monthly attendance data');
    }
  };

  const fetchDateBasedReport = async () => {
    try {
      const teamData = await attendanceApi.getTeamAttendance(selectedDate);
      console.log('teamData:', teamData);
      const dateData = transformToDateBasedView(teamData);
      setDateBasedData(dateData);
    } catch (error) {
      console.error('Failed to load date-based report:', error);
      toast.error('Failed to load date-based attendance data');
    }
  };

  const transformToDateBasedView = (attendanceData: any[]): WeeklyEmployeeData[] => {
    const employeeMap = new Map();

    if (attendanceData && attendanceData.length > 0) {
      attendanceData.forEach(record => {
        if (!employeeMap.has(record.user_id)) {
          const checkInTime = record.check_in_at;
          const checkOutTime = record.check_out_at;
          
          // Use the same logic as backend for consistency
          const lateArrival = checkInTime ? new Date(checkInTime).getHours() >= 9 : false;
          const earlyCheckout = checkInTime && checkOutTime ? 
            (new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()) / (1000 * 60 * 60) < 8 : false;
          const earlyCheckin = checkInTime ? new Date(checkInTime).getHours() < 9 : false;
          const lateCheckout = checkOutTime ? new Date(checkOutTime).getHours() >= 18 : false;
          
          let hours = 0;
          if (checkInTime && checkOutTime) {
            hours = (new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()) / (1000 * 60 * 60);
            hours = Math.round(hours * 10) / 10;
          }

          const status = record.status || (checkInTime ? 'present' : 'absent');

          employeeMap.set(record.user_id, {
            employeeId: record.employee_code || `EMP${record.user_id}`,
            employeeName: record.user_name,
            department: record.department || 'Not Assigned',
            role: record.role || 'employee',
            dailyAttendance: [{
              date: selectedDate,
              day: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }),
              checkIn: checkInTime,
              checkOut: checkOutTime,
              hours: hours,
              status: status,
              lateArrival: lateArrival,
              earlyCheckout: earlyCheckout,
              earlyCheckin: earlyCheckin,
              lateCheckout: lateCheckout
            }],
            totalHours: hours,
            presentDays: status === 'present' ? 1 : 0,
            absentDays: status === 'present' ? 0 : 1,
            lateArrivals: lateArrival ? 1 : 0,
            earlyCheckouts: earlyCheckout ? 1 : 0
          });
        }
      });
    }

    return Array.from(employeeMap.values());
  };

  const handlePreviousWeek = () => {
    const prevWeek = getPreviousWeek(startDate);
    setStartDate(prevWeek.startDate);
    setEndDate(prevWeek.endDate);
    setSelectedWeek(prevWeek.startDate);
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeek(startDate);
    setStartDate(nextWeek.startDate);
    setEndDate(nextWeek.endDate);
    setSelectedWeek(nextWeek.startDate);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 0) {
        setSelectedYear(prevYear => prevYear - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      if (prev === 11) {
        setSelectedYear(prevYear => prevYear + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const toggleDateExpansion = (date: string) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const toggleWeekExpansion = (weekStart: string) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekStart)) {
        newSet.delete(weekStart);
      } else {
        newSet.add(weekStart);
      }
      return newSet;
    });
  };

  const handleExportWeekly = () => {
    const exportData = weeklyDataByDate.flatMap(dateData => 
      dateData.employees.map(employee => ({
        'Date': dateData.fullDate,
        'Day': dateData.day,
        'Employee Code': employee.employeeId,
        'Employee Name': employee.employeeName,
        'Department': employee.department,
        'Status': employee.status,
        'Check In': formatTime(employee.checkIn),
        'Check Out': formatTime(employee.checkOut),
        'Late Arrival': employee.lateArrival ? 'Yes' : 'No',
        'Early Checkin': employee.earlyCheckin ? 'Yes' : 'No',
        'Late Checkout': employee.lateCheckout ? 'Yes' : 'No',
        'Early Checkout': employee.earlyCheckout ? 'Yes' : 'No',
        'Total Hours': employee.hours > 0 ? `${employee.hours}h` : '-'
      }))
    );
    
    exportToExcel(exportData, `weekly-attendance-report-${startDate}-to-${endDate}`);
    toast.success('Weekly report exported successfully');
  };

  const handleExportMonthly = () => {
    const exportData = monthlyData.flatMap(week => 
      week.employees.flatMap(employee => 
        employee.dailyAttendance.map(day => ({
          'Week': `Week ${week.weekNumber}`,
          'Date': `${new Date(day.date).getDate().toString().padStart(2, '0')}/${(new Date(day.date).getMonth() + 1).toString().padStart(2, '0')}/${new Date(day.date).getFullYear()}`,
          'Day': day.day,
          'Employee Code': employee.employeeId,
          'Employee Name': employee.employeeName,
          'Department': employee.department,
          'Status': day.status,
          'Check In': formatTime(day.checkIn),
          'Check Out': formatTime(day.checkOut),
          'Late Arrival': day.lateArrival ? 'Yes' : 'No',
          'Early Checkin': day.earlyCheckin ? 'Yes' : 'No',
          'Late Checkout': day.lateCheckout ? 'Yes' : 'No',
          'Early Checkout': day.earlyCheckout ? 'Yes' : 'No',
          'Total Hours': day.hours > 0 ? `${day.hours}h` : '-'
        }))
      )
    );
    
    exportToExcel(exportData, `monthly-attendance-report-${selectedYear}-${selectedMonth + 1}`);
    toast.success('Monthly report exported successfully');
  };

  const handleExportDateBased = () => {
    const exportData = filteredDateBasedData.map(employee => {
      const day = employee.dailyAttendance[0];
      return {
        'Date': `${new Date(selectedDate).getDate().toString().padStart(2, '0')}/${(new Date(selectedDate).getMonth() + 1).toString().padStart(2, '0')}/${new Date(selectedDate).getFullYear()}`,
        'Day': day.day,
        'Employee Code': employee.employeeId,
        'Employee Name': employee.employeeName,
        'Department': employee.department,
        'Status': day.status,
        'Check In': formatTime(day.checkIn),
        'Check Out': formatTime(day.checkOut),
        'Late Arrival': day.lateArrival ? 'Yes' : 'No',
        'Early Checkin': day.earlyCheckin ? 'Yes' : 'No',
        'Late Checkout': day.lateCheckout ? 'Yes' : 'No',
        'Early Checkout': day.earlyCheckout ? 'Yes' : 'No',
        'Total Hours': day.hours > 0 ? `${day.hours}h` : '-'
      };
    });
    
    exportToExcel(exportData, `date-based-attendance-report-${selectedDate}`);
    toast.success('Date-based report exported successfully');
  };

  const filteredData = reportData.filter(row => {
    const roleMatch = roleFilter === 'all' || row.role === roleFilter;
    return roleMatch;
  });

  const filteredWeeklyData = weeklyData.filter(row => {
    const roleMatch = roleFilter === 'all' || row.role === roleFilter;
    return roleMatch;
  });

  const filteredDateBasedData = dateBasedData.filter(row => {
    const roleMatch = roleFilter === 'all' || true;
    return roleMatch;
  });

  const getStatusBadge = (attendance: DailyAttendance) => {
    if (attendance.status === 'present') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <UserCheck className="w-3 h-3 mr-1" />
          Present
        </Badge>
      );
    } else if (attendance.status === 'absent') {
      return (
        <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">
          <UserX className="w-3 h-3 mr-1" />
          Absent
        </Badge>
      );
    } else if (attendance.status === 'leave') {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Calendar className="w-3 h-3 mr-1" />
          Leave
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-500">
          {attendance.status}
        </Badge>
      );
    }
  };

  // Group weekly data by date
  const getWeeklyDataByDate = () => {
    const dateMap = new Map();
    const weekDays = getWeekDays(startDate);
    
    // Initialize all dates in the week
    weekDays.forEach(day => {
      dateMap.set(day.date, {
        date: day.date,
        fullDate: day.fullDate,
        day: day.day,
        employees: []
      });
    });

    // Fill in employee data for each date
    filteredWeeklyData.forEach(employee => {
      employee.dailyAttendance.forEach(day => {
        const dateData = dateMap.get(day.date);
        if (dateData) {
          dateData.employees.push({
            employeeId: employee.employeeId,
            employeeName: employee.employeeName,
            department: employee.department,
            ...day
          });
        }
      });
    });
    
    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const weeklyDataByDate = getWeeklyDataByDate();

  const WeekNavigation = () => (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous Week
      </Button>
      <div className="text-center">
        <h3 className="font-semibold">
          Week of {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </h3>
      </div>
      <Button variant="outline" size="sm" onClick={handleNextWeek}>
        Next Week
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  const MonthNavigation = () => (
    <div className="flex items-center justify-between mb-4">
      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous Month
      </Button>
      <div className="text-center">
        <h3 className="font-semibold">
          {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
      </div>
      <Button variant="outline" size="sm" onClick={handleNextMonth}>
        Next Month
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );

  const AttendanceTable = ({ employees }: { employees: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee Code</TableHead>
          <TableHead>Employee Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Check In</TableHead>
          <TableHead>Check Out</TableHead>
          <TableHead>Late Arrival</TableHead>
          <TableHead>Early Checkin</TableHead>
          <TableHead>Late Checkout</TableHead>
          <TableHead>Early Checkout</TableHead>
          <TableHead className="text-right">Total Hours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={11} className="text-center py-8 text-gray-500">
              No attendance records found for this date
            </TableCell>
          </TableRow>
        ) : (
          employees.map((employee, index) => (
            <TableRow key={`${employee.employeeId}-${employee.date}-${index}`}>
              <TableCell className="font-medium">
                {employee.employeeId}
              </TableCell>
              <TableCell>
                {employee.employeeName}
              </TableCell>
              <TableCell>
                {employee.department}
              </TableCell>
              <TableCell>
                {getStatusBadge(employee)}
              </TableCell>
              <TableCell>
                {formatTime(employee.checkIn)}
              </TableCell>
              <TableCell>
                {formatTime(employee.checkOut)}
              </TableCell>
              <TableCell>
                {employee.lateArrival ? (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Late
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {employee.earlyCheckin ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Early
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {employee.lateCheckout ? (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Late
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {employee.earlyCheckout ? (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Early
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                {employee.hours > 0 ? `${employee.hours}h` : '-'}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Attendance Report</h1>
        <p className="text-gray-500">Generate and export detailed attendance reports</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="dateBased">Date Based Report</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Weekly Attendance Report</CardTitle>
                  <CardDescription>
                    Detailed daily attendance for the selected week
                    {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='w-full'>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="text-sm mb-2 block">Year</label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Month</label>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Week</label>
                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentMonthWeeks.map(week => (
                          <SelectItem key={week.value} value={week.value}>{week.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button onClick={handleExportWeekly} className="w-full gap-2" >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              <WeekNavigation />
              <div className="space-y-4">
                {weeklyDataByDate.map((dateData) => (
                  <Collapsible 
                    key={dateData.date} 
                    open={expandedDates.has(dateData.date)} 
                    onOpenChange={() => toggleDateExpansion(dateData.date)}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold">
                          {dateData.fullDate} ({dateData.day})
                        </div>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Total Employees: {dateData.employees.length}</span>
                          <span>
                            Present: {dateData.employees.filter(emp => emp.status === 'present').length}
                          </span>
                          <span>
                            Absent: {dateData.employees.filter(emp => emp.status === 'absent').length}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expandedDates.has(dateData.date) ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t">
                        <div className="overflow-x-auto">
                          <AttendanceTable employees={dateData.employees} />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Monthly Attendance Report</CardTitle>
                  <CardDescription>
                    Monthly attendance summary with weekly breakdown
                    {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='w-full'>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="text-sm mb-2 block">Year</label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Month</label>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">Role</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role === 'all' ? 'All Roles' : capitalizeFirstLetter(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleExportMonthly} className="w-full gap-2" >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              <MonthNavigation />
              <div className="space-y-4">
                {monthlyData.map((week, weekIndex) => (
                  <Collapsible 
                    key={week.weekStart} 
                    open={expandedWeeks.has(week.weekStart)} 
                    onOpenChange={() => toggleWeekExpansion(week.weekStart)}
                    className="border rounded-lg"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-semibold">
                          Week {week.weekNumber} ({new Date(week.weekStart).toLocaleDateString()} - {new Date(week.weekEnd).toLocaleDateString()})
                        </div>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>Employees: {week.employees.length}</span>
                          <span>Present Days: {week.presentDays}</span>
                          <span>Total Hours: {week.totalHours.toFixed(1)}h</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expandedWeeks.has(week.weekStart) ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="space-y-4 p-4">
                        {getWeekDays(week.weekStart).map((day) => {
                          const dayEmployees = week.employees.flatMap(employee => 
                            employee.dailyAttendance
                              .filter(d => d.date === day.date)
                              .map(d => ({
                                employeeId: employee.employeeId,
                                employeeName: employee.employeeName,
                                department: employee.department,
                                ...d
                              }))
                          );
                          
                          return (
                            <Collapsible 
                              key={day.date} 
                              open={expandedDates.has(day.date)} 
                              onOpenChange={() => toggleDateExpansion(day.date)}
                              className="border rounded-lg"
                            >
                              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                  <div className="text-md font-semibold">
                                    {day.fullDate} ({day.day})
                                  </div>
                                  <div className="flex space-x-4 text-sm text-gray-600">
                                    <span>Employees: {dayEmployees.length}</span>
                                    <span>
                                      Present: {dayEmployees.filter(emp => emp.status === 'present').length}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expandedDates.has(day.date) ? 'rotate-90' : ''}`} />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="border-t">
                                  <div className="overflow-x-auto">
                                    <AttendanceTable employees={dayEmployees} />
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dateBased">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Date Based Attendance Report</CardTitle>
                  <CardDescription>
                    Attendance report for selected date
                    {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='w-80'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div >
                    <label className="text-sm mb-2 block">Select Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleExportDateBased} className="w-full gap-2" >
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg overflow-x-auto">
                <AttendanceTable employees={filteredDateBasedData.map(employee => ({
                  employeeId: employee.employeeId,
                  employeeName: employee.employeeName,
                  department: employee.department,
                  ...employee.dailyAttendance[0]
                }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}