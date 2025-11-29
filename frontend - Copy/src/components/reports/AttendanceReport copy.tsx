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
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  }
  
  return days;
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

// Helper function to check if time is late (after 9:00 AM)
const isLateArrival = (checkInTime: string) => {
  if (!checkInTime) return false;
  const checkIn = new Date(checkInTime);
  const lateTime = new Date(checkIn);
  lateTime.setHours(9, 0, 0, 0); // 9:00 AM
  return checkIn > lateTime;
};

// Helper function to check if checkout is early (less than 8 hours)
const isEarlyCheckout = (checkInTime: string, checkOutTime: string) => {
  if (!checkInTime || !checkOutTime) return false;
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
  return hoursWorked < 8; // Less than 8 hours
};

// Helper function to check if checkin is early (before 9:00 AM)
const isEarlyCheckin = (checkInTime: string) => {
  if (!checkInTime) return false;
  const checkIn = new Date(checkInTime);
  const earlyTime = new Date(checkIn);
  earlyTime.setHours(9, 0, 0, 0); // 9:00 AM
  return checkIn < earlyTime;
};

// Helper function to check if checkout is late (after 6:00 PM)
const isLateCheckout = (checkOutTime: string) => {
  if (!checkOutTime) return false;
  const checkOut = new Date(checkOutTime);
  const lateTime = new Date(checkOut);
  lateTime.setHours(18, 0, 0, 0); // 6:00 PM
  return checkOut > lateTime;
};

// Helper function to export to Excel
const exportToExcel = (data: ReportData[], startDate: string, endDate: string, activeTab: string) => {
  const headers = ['Employee ID', 'Employee Name', 'Department', 'Role', 'Location', 'Days Present', 'Days Absent', 'Leaves', 'Late Arrivals', 'Early Checkouts', 'Total Hours'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      `"${row.employeeId}"`,
      `"${row.employeeName}"`,
      `"${row.department}"`,
      `"${capitalizeFirstLetter(row.role)}"`,
      `"${row.location}"`,
      row.daysPresent,
      row.daysAbsent,
      row.leaves,
      row.lateArrivals,
      row.earlyCheckouts,
      row.totalHours.toFixed(1)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `attendance-report-${activeTab}-${startDate}-to-${endDate}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function AttendanceReport({ user }: AttendanceReportProps) {
  const currentWeek = getCurrentWeekDates();
  const [activeTab, setActiveTab] = useState('weekly');
  const [startDate, setStartDate] = useState(currentWeek.startDate);
  const [endDate, setEndDate] = useState(currentWeek.endDate);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [roleFilter, setRoleFilter] = useState<string[]>(['all']);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyEmployeeData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyWeekData[]>([]);
  const [dateBasedData, setDateBasedData] = useState<WeeklyEmployeeData[]>([]);
  const [teamAttendance, setTeamAttendance] = useState<any[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const roles = ['employee', 'manager', 'hr', 'admin', 'finance'];
  const departments = ['Engineering', 'Design', 'Human Resources', 'Finance', 'Marketing', 'Sales', 'Operations'];

  // Set dates based on active tab
  useEffect(() => {
    if (activeTab === 'weekly') {
      const weekDates = getCurrentWeekDates();
      setStartDate(weekDates.startDate);
      setEndDate(weekDates.endDate);
    } else if (activeTab === 'monthly') {
      const monthDates = getMonthWeeks(selectedYear, selectedMonth);
      if (monthDates.length > 0) {
        setStartDate(monthDates[0].weekStart);
        setEndDate(monthDates[monthDates.length - 1].weekEnd);
      }
    }
  }, [activeTab, selectedMonth, selectedYear]);

  // Fetch report when filters change
  useEffect(() => {
    fetchReport();
    if (activeTab === 'weekly') {
      fetchWeeklyDetailedReport();
    } else if (activeTab === 'monthly') {
      fetchMonthlyDetailedReport();
    } else if (activeTab === 'dateBased') {
      fetchDateBasedReport();
    }
  }, [startDate, endDate, roleFilter, departmentFilter, activeTab, selectedDate, selectedMonth, selectedYear]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        startDate,
        endDate,
      };

      if (roleFilter.length > 0 && !roleFilter.includes('all')) {
        params.roles = roleFilter;
      }

      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
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
      const teamData = await attendanceApi.getTeamAttendance(startDate);
      setTeamAttendance(teamData || []);
      const weeklyReportData = transformToWeeklyView(teamData);
      setWeeklyData(weeklyReportData);
    } catch (error) {
      console.error('Failed to load weekly detailed report:', error);
    }
  };

  const fetchMonthlyDetailedReport = async () => {
    try {
      const monthWeeks = getMonthWeeks(selectedYear, selectedMonth);
      const monthlyReportData: MonthlyWeekData[] = [];

      for (const week of monthWeeks) {
        const teamData = await attendanceApi.getTeamAttendance(week.weekStart);
        const weeklyData = transformToWeeklyView(teamData);
        
        monthlyReportData.push({
          ...week,
          employees: weeklyData,
          totalHours: weeklyData.reduce((sum, emp) => sum + emp.totalHours, 0),
          presentDays: weeklyData.reduce((sum, emp) => sum + emp.presentDays, 0),
          absentDays: weeklyData.reduce((sum, emp) => sum + emp.absentDays, 0)
        });
      }

      setMonthlyData(monthlyReportData);
    } catch (error) {
      console.error('Failed to load monthly detailed report:', error);
    }
  };

  const fetchDateBasedReport = async () => {
    try {
      const teamData = await attendanceApi.getTeamAttendance(selectedDate);
      const dateData = transformToDateBasedView(teamData);
      setDateBasedData(dateData);
    } catch (error) {
      console.error('Failed to load date-based report:', error);
    }
  };

  const transformToWeeklyView = (attendanceData: any[]): WeeklyEmployeeData[] => {
    const weekDays = getWeekDays(startDate);
    const employeeMap = new Map();

    attendanceData.forEach(record => {
      if (!employeeMap.has(record.user_id)) {
        employeeMap.set(record.user_id, {
          employeeId: record.employee_code || `EMP${record.user_id}`,
          employeeName: record.user_name,
          department: record.department || 'Not Assigned',
          dailyAttendance: weekDays.map(day => ({
            date: day.date,
            day: day.day,
            checkIn: '',
            checkOut: '',
            hours: 0,
            status: 'absent',
            lateArrival: false,
            earlyCheckout: false,
            lateCheckout: false,
            earlyCheckin: false
          })),
          totalHours: 0,
          presentDays: 0,
          absentDays: 0,
          lateArrivals: 0,
          earlyCheckouts: 0
        });
      }

      const employee = employeeMap.get(record.user_id);
      const dayIndex = weekDays.findIndex(day => day.date === record.work_date);
      
      if (dayIndex !== -1) {
        const checkInTime = record.check_in_at;
        const checkOutTime = record.check_out_at;
        const lateArrival = isLateArrival(checkInTime);
        const earlyCheckout = isEarlyCheckout(checkInTime, checkOutTime);
        const earlyCheckin = isEarlyCheckin(checkInTime);
        const lateCheckout = isLateCheckout(checkOutTime);
        
        let hours = 0;
        if (checkInTime && checkOutTime) {
          hours = (new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()) / (1000 * 60 * 60);
          hours = Math.round(hours * 10) / 10;
        }

        employee.dailyAttendance[dayIndex] = {
          date: record.work_date,
          day: weekDays[dayIndex].day,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          hours: hours,
          status: record.status || 'present',
          lateArrival: lateArrival,
          earlyCheckout: earlyCheckout,
          earlyCheckin: earlyCheckin,
          lateCheckout: lateCheckout
        };

        if (record.status === 'present') {
          employee.presentDays++;
          employee.totalHours += hours;
          if (lateArrival) employee.lateArrivals++;
          if (earlyCheckout) employee.earlyCheckouts++;
        } else if (record.status === 'absent') {
          employee.absentDays++;
        }
      }
    });

    return Array.from(employeeMap.values());
  };

  const transformToDateBasedView = (attendanceData: any[]): WeeklyEmployeeData[] => {
    const employeeMap = new Map();

    attendanceData.forEach(record => {
      if (!employeeMap.has(record.user_id)) {
        employeeMap.set(record.user_id, {
          employeeId: record.employee_code || `EMP${record.user_id}`,
          employeeName: record.user_name,
          department: record.department || 'Not Assigned',
          dailyAttendance: [{
            date: selectedDate,
            day: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }),
            checkIn: record.check_in_at,
            checkOut: record.check_out_at,
            hours: 0,
            status: record.status || 'absent',
            lateArrival: isLateArrival(record.check_in_at),
            earlyCheckout: isEarlyCheckout(record.check_in_at, record.check_out_at),
            earlyCheckin: isEarlyCheckin(record.check_in_at),
            lateCheckout: isLateCheckout(record.check_out_at)
          }],
          totalHours: 0,
          presentDays: 0,
          absentDays: 0,
          lateArrivals: 0,
          earlyCheckouts: 0
        });
      }

      const employee = employeeMap.get(record.user_id);
      const checkInTime = record.check_in_at;
      const checkOutTime = record.check_out_at;
      const lateArrival = isLateArrival(checkInTime);
      const earlyCheckout = isEarlyCheckout(checkInTime, checkOutTime);
      const earlyCheckin = isEarlyCheckin(checkInTime);
      const lateCheckout = isLateCheckout(checkOutTime);
      
      let hours = 0;
      if (checkInTime && checkOutTime) {
        hours = (new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()) / (1000 * 60 * 60);
        hours = Math.round(hours * 10) / 10;
      }

      employee.dailyAttendance[0] = {
        date: selectedDate,
        day: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' }),
        checkIn: checkInTime,
        checkOut: checkOutTime,
        hours: hours,
        status: record.status || 'present',
        lateArrival: lateArrival,
        earlyCheckout: earlyCheckout,
        earlyCheckin: earlyCheckin,
        lateCheckout: lateCheckout
      };

      if (record.status === 'present') {
        employee.presentDays++;
        employee.totalHours += hours;
        if (lateArrival) employee.lateArrivals++;
        if (earlyCheckout) employee.earlyCheckouts++;
      } else if (record.status === 'absent') {
        employee.absentDays++;
      }
    });

    return Array.from(employeeMap.values());
  };

  const handlePreviousWeek = () => {
    const prevWeek = getPreviousWeek(startDate);
    setStartDate(prevWeek.startDate);
    setEndDate(prevWeek.endDate);
  };

  const handleNextWeek = () => {
    const nextWeek = getNextWeek(startDate);
    setStartDate(nextWeek.startDate);
    setEndDate(nextWeek.endDate);
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

  const handleRoleSelect = (value: string) => {
    if (value === 'all') {
      setRoleFilter(['all']);
    } else {
      setRoleFilter(prev => {
        const filtered = prev.filter(r => r !== 'all');
        if (filtered.includes(value)) {
          return filtered.filter(r => r !== value);
        } else {
          return [...filtered, value];
        }
      });
    }
  };

  const handleExport = () => {
    try {
      if (filteredData.length === 0) {
        toast.error('No data to export');
        return;
      }

      exportToExcel(filteredData, startDate, endDate, activeTab);
      toast.success('Report exported successfully as Excel file');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const filteredData = reportData.filter(row => {
    const roleMatch = roleFilter.includes('all') || roleFilter.includes(row.role);
    const departmentMatch = departmentFilter === 'all' || row.department === departmentFilter;
    return roleMatch && departmentMatch;
  });

  const filteredWeeklyData = weeklyData.filter(row => {
    const departmentMatch = departmentFilter === 'all' || row.department === departmentFilter;
    return departmentMatch;
  });

  const filteredDateBasedData = dateBasedData.filter(row => {
    const departmentMatch = departmentFilter === 'all' || row.department === departmentFilter;
    return departmentMatch;
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
// Update the getWeeklyDataByDate function to use the correct date format
const getWeeklyDataByDate = () => {
  const dateMap = new Map();
  
  filteredWeeklyData.forEach(employee => {
    employee.dailyAttendance.forEach(day => {
      if (!dateMap.has(day.date)) {
        const dateObj = new Date(day.date);
        // Format as "13:11:2025" (date:month:year)
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        dateMap.set(day.date, {
          date: day.date,
          fullDate: formattedDate, // This will show as "13:11:2025"
          day: day.day,
          employees: []
        });
      }
      
      const dateData = dateMap.get(day.date);
      dateData.employees.push({
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        department: employee.department,
        ...day
      });
    });
  });
  
  return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Also update the getWeekDays function to use the same format for monthly view
const getWeekDays = (startDate: string) => {
  const start = new Date(startDate);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    // Format as "13:11:2025" (date:month:year)
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: formattedDate // This will show as "13:11:2025"
    });
  }
  
  return days;
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
              No attendance records found
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
        <h1 className="text-2xl font-bold">Attendance Report</h1>
        <p className="text-gray-500">Generate and export detailed attendance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range and filters for the report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm mb-2 block">Roles</label>
              <Select 
                value={roleFilter.includes('all') ? 'all' : roleFilter[0]}
                onValueChange={handleRoleSelect}
              >
                <SelectTrigger>
                  <SelectValue>
                    {roleFilter.includes('all') 
                      ? 'All Roles' 
                      : `${roleFilter.length} role(s) selected`
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center">
                        <span className={`mr-2 ${roleFilter.includes(role) ? 'text-blue-600' : 'text-gray-400'}`}>
                          {roleFilter.includes(role) ? '✓' : '○'}
                        </span>
                        {capitalizeFirstLetter(role)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roleFilter.length > 0 && !roleFilter.includes('all') && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {roleFilter.map(role => (
                    <span 
                      key={role}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {capitalizeFirstLetter(role)}
                      <button
                        onClick={() => setRoleFilter(prev => prev.filter(r => r !== role))}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm mb-2 block">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleExport} 
                className="w-full gap-2" 
                disabled={isLoading || filteredData.length === 0}
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="dateBased">Date Based Report</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Report</CardTitle>
              <CardDescription>
                Detailed daily attendance for the selected week
                {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
              <CardTitle>Monthly Attendance Report</CardTitle>
              <CardDescription>
                Monthly attendance summary with weekly breakdown
                {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          <span>Present: {week.presentDays}</span>
                          <span>Absent: {week.absentDays}</span>
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
              <CardTitle>Date Based Attendance Report</CardTitle>
              <CardDescription>
                Attendance report for selected date
                {isLoading && <span className="ml-2 text-blue-500">Loading...</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div>
                  <label className="text-sm mb-2 block">Select Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
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