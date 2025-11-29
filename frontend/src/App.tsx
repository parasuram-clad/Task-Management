// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { MyAttendance } from './components/attendance/MyAttendance';
import { AttendanceCalendar } from './components/attendance/AttendanceCalendar';
import { TeamAttendance } from './components/attendance/TeamAttendance';
import { MyTimesheet } from './components/timesheet/MyTimesheet';
import { TimesheetApproval } from './components/timesheet/TimesheetApproval';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { MyTasks } from './components/tasks/MyTasks';
import { ProjectTasks } from './components/tasks/ProjectTasks';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { EmployeeProfile } from './components/employees/EmployeeProfile';
import { AttendanceReport } from './components/reports/AttendanceReport';
import { TimesheetReport } from './components/reports/TimesheetReport';
import { CompanySettings } from './components/settings/CompanySettings';
import { PersonalSettings } from './components/settings/PersonalSettings';
import { Toaster } from './components/ui/sonner';
import './services/api-test-helper';
import { AddEmployee } from './components/employees/AddEmployee';
import { EditEmployee } from './components/employees/EditEmployee';
import { ProjectGrid } from './components/tasks/ProjectGrid';
// import { Profile } from './components/Profile/Profile';
import { authApi } from './services/api';
export type UserRole = 'employee' | 'manager' | 'hr' | 'admin' | 'finance';


// In App.tsx - Update the User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  department: string;
  designation: string;
  avatar?: string;
  // Add all the missing fields from the API
  phone?: string;
  location?: string;
  employee_code?: string;
  employee_id?: string;
  hire_date?: string;
  is_active?: boolean;
  position?: string;
  manager?: string;
  date_of_birth?: string;
  date_of_join?: string;
  employment_type?: string;
  shift?: string;
  created_at?: string;
  last_login_at?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

// In App.tsx - Update the handleLogin function or wherever you set the user
// In App.tsx - Update the handleLogin function
const handleLogin = async (userData: any) => {
  try {
    // After login, fetch complete user data using authApi.getMe()
    const completeUserData = await authApi.getMe();
    
    // Create a complete user object with all available data
    const user: User = {
      id: completeUserData.id?.toString() || userData.id?.toString() || '',
      name: completeUserData.name || userData.name || '',
      email: completeUserData.email || userData.email || '',
      role: (completeUserData.role as UserRole) || userData.role || 'employee',
      employeeId: completeUserData.employee_code || completeUserData.employee_id || userData.employeeId || '',
      department: completeUserData.department || userData.department || '',
      designation: completeUserData.position || completeUserData.designation || userData.designation || '',
      avatar: completeUserData.avatar || userData.avatar,
      // Add all the additional fields with proper fallbacks
      phone: completeUserData.phone || userData.phone,
      location: completeUserData.location || userData.location,
      employee_code: completeUserData.employee_code || userData.employee_code,
      employee_id: completeUserData.employee_id || userData.employee_id,
      hire_date: completeUserData.hire_date || userData.hire_date,
      is_active: completeUserData.is_active !== undefined ? completeUserData.is_active : userData.is_active,
      position: completeUserData.position || userData.position,
      manager: completeUserData.manager || userData.manager,
      date_of_birth: completeUserData.date_of_birth || userData.date_of_birth,
      date_of_join: completeUserData.date_of_join || userData.date_of_join,
      employment_type: completeUserData.employment_type || userData.employment_type,
      shift: completeUserData.shift || userData.shift,
      created_at: completeUserData.created_at || userData.created_at,
      last_login_at: completeUserData.last_login_at || userData.last_login_at
    };
    
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error fetching complete user data:', error);
    // Fallback to basic user data
    const fallbackUser: User = {
      id: userData.id?.toString() || '',
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'employee',
      employeeId: userData.employeeId || '',
      department: userData.department || '',
      designation: userData.designation || '',
      avatar: userData.avatar,
      // Include any additional fields that might be in userData
      ...userData
    };
    
    setCurrentUser(fallbackUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
  }
};

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 overflow-hidden"> {/* Added overflow-hidden */}
        <Sidebar user={currentUser!} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto"> {/* Only main content scrolls */}
          <Routes>
            {/* Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                currentUser?.role === 'manager' || currentUser?.role === 'admin' 
                  ? <ManagerDashboard user={currentUser} />
                  : <EmployeeDashboard user={currentUser} />
              } 
            />
            {/* <Route path="/profile" element={<Profile user={currentUser} />} /> */}

            {/* Attendance Routes */}
            <Route path="/attendance/my-attendance" element={<MyAttendance user={currentUser!} />} />
            <Route path="/attendance/calendar" element={<AttendanceCalendar user={currentUser!} />} />
            <Route path="/attendance/team" element={<TeamAttendance user={currentUser!} />} />
            
            {/* Timesheet Routes */}
            <Route path="/timesheet/my-timesheet" element={<MyTimesheet user={currentUser!} />} />
            <Route path="/timesheet/approval" element={<TimesheetApproval user={currentUser!} />} />
            
            {/* Project Routes */}
            <Route path="/projects" element={<ProjectList user={currentUser!} />} />
            <Route path="/projects/:projectId" element={<ProjectDetail user={currentUser!} />} />
            
            {/* Task Routes */}
            <Route path="/tasks/my-tasks" element={<MyTasks user={currentUser!} />} />
            <Route path="/tasks/project-grid" element={<ProjectGrid user={currentUser!} />} />
            
<Route path="/tasks/project-grid/:id" element={<ProjectTasks user={currentUser} />} />
            {/* Employee Routes */}
            <Route path="/employees" element={<EmployeeDirectory user={currentUser!} />} />
            <Route path="/employees/new" element={<AddEmployee />} />
            <Route path="/employees/:employeeId" element={<EmployeeProfile user={currentUser!} />} />
            {/* <Route path="/employees/:employeeId" element={<EmployeeProfile user={user} />} /> */}
              <Route path="/employees/:employeeId/edit" element={<EditEmployee />} />
            {/* Report Routes */}
            <Route path="/reports/attendance" element={<AttendanceReport user={currentUser!} />} />
            <Route path="/reports/timesheet" element={<TimesheetReport user={currentUser!} />} />
            
            {/* Settings Routes */}
            <Route path="/settings/personal" element={<PersonalSettings user={currentUser!} />} />
            <Route path="/settings/company" element={<CompanySettings user={currentUser!} />} />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}
