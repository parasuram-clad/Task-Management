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

export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  department: string;
  designation: string;
  avatar?: string;
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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
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