import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/Sidebar';
import { CompanyProvider, useCompany } from './contexts/CompanyContext';
import { SuperAdminProvider } from './contexts/SuperAdminContext';
import { ManagerDashboard } from './components/dashboard/ManagerDashboard';
import { EmployeeDashboard } from './components/dashboard/EmployeeDashboard';
import { EmployeeProfile } from './components/employees/EmployeeProfile';
import { MyAttendance } from './components/attendance/MyAttendance';
import { AttendanceCalendar } from './components/attendance/AttendanceCalendar';
import { TeamAttendance } from './components/attendance/TeamAttendance';
import { MyTimesheet } from './components/timesheet/MyTimesheet';
import { TimesheetApproval } from './components/timesheet/TimesheetApproval';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { SprintDetail } from './components/sprints/SprintDetail';
import { BurndownChart } from './components/sprints/BurndownChart';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { MyTasks } from './components/tasks/MyTasks';
import { ProjectTasks } from './components/tasks/ProjectTasks';
import { LeadsList } from './components/leads/LeadsList';
import { LeadDetail } from './components/leads/LeadDetail';
import { LeadForm } from './components/leads/LeadForm';
import { EmployeeDirectory } from './components/employees/EmployeeDirectory';
import { AttendanceReport } from './components/reports/AttendanceReport';
import { TimesheetReport } from './components/reports/TimesheetReport';
import { ProjectReport } from './components/reports/ProjectReport';
import { LeadReport } from './components/reports/LeadReport';
import { CompanySettings } from './components/settings/CompanySettings';
import { PersonalSettings } from './components/settings/PersonalSettings';
import { CompanyManagement } from './components/companies/CompanyManagement';
import { CreateCompanyModal } from './components/companies/CreateCompanyModal';
import { DocumentsList } from './components/documents/DocumentsList';
import { DocumentManagement } from './components/documents/DocumentManagement';
import { MyAppraisals } from './components/performance/MyAppraisals';
import { AppraisalForm } from './components/performance/AppraisalForm';
import { AppraisalManagement } from './components/performance/AppraisalManagement';
import { ReviewAppraisal } from './components/performance/ReviewAppraisal';
import { MyLeaves } from './components/leave/MyLeaves';
import { LeaveForm } from './components/leave/LeaveForm';
import { LeaveApproval } from './components/leave/LeaveApproval';
import { LeaveManagement } from './components/leave/LeaveManagement';
import { MyPayroll } from './components/payroll/MyPayroll';
import { PayrollProcessing } from './components/payroll/PayrollProcessing';
import { PayrollApproval } from './components/payroll/PayrollApproval';
import { InvoiceList } from './components/invoices/InvoiceList';
import { CreateInvoice } from './components/invoices/CreateInvoice';
import { AccountingDashboard } from './components/accounting/AccountingDashboard';
import { GeneralLedger } from './components/accounting/GeneralLedger';
import { FinanceDashboard } from './components/finance/FinanceDashboard';
import { AccountsDashboard } from './components/accounts/AccountsDashboard';
import { MyProfile } from './components/profile/MyProfile';
import { PermissionsManagement } from './components/permissions/PermissionsManagement';
import { SkillCatalog } from './components/skills/SkillCatalog';
import { SkillMatrix } from './components/skills/SkillMatrix';
import { TeamStructure } from './components/skills/TeamStructure';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { SuperAdminCompanies } from './components/superadmin/SuperAdminCompanies';
import { SuperAdminUsers } from './components/superadmin/SuperAdminUsers';
import { SuperAdminAnalytics } from './components/superadmin/SuperAdminAnalytics';
import { SuperAdminSettings } from './components/superadmin/SuperAdminSettings';
import { SuperAdminSidebar } from './components/superadmin/SuperAdminSidebar';
import { CompanyForm } from './components/superadmin/CompanyForm';
import { CompanyConfiguration } from './components/superadmin/CompanyConfiguration';
import { AccessDenied } from './components/AccessDenied';
import { Toaster } from './components/ui/sonner';
import { setCurrentCompany } from './services/api-client';
import { canAccessLeads, canAccessProjects } from './utils/rbac';
// Import API test helper for development
import './services/api-test-helper';
// MAX Suite Components
import { RequisitionManagement } from './components/recruit/RequisitionManagement';
import { CandidatePortal } from './components/recruit/CandidatePortal';
import { InterviewManagement } from './components/recruit/InterviewManagement';
import { OnboardingDashboard } from './components/onboarding/OnboardingDashboard';
import { ClaimsReimbursement } from './components/workforce/ClaimsReimbursement';
import { ShiftScheduling } from './components/workforce/ShiftScheduling';
import { LMSDashboard } from './components/lms/LMSDashboard';
import { EngagementSurveys } from './components/engage/EngagementSurveys';
import { ProjectGrid } from './components/tasks/ProjectGrid';

export type UserRole = 'employee' | 'manager' | 'hr' | 'admin' | 'finance' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId: string;
  department: string;
  designation: string;
  avatar?: string;
  is_super_admin?: boolean;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        ) : currentUser?.is_super_admin ? (
          <Route
            path="/*"
            element={
              <SuperAdminProvider>
                <SuperAdminApp user={currentUser} onLogout={handleLogout} />
              </SuperAdminProvider>
            }
          />
        ) : (
          <Route
            path="/*"
            element={
              <CompanyProvider userId={parseInt(currentUser!.id)}>
                <AppContent user={currentUser!} onLogout={handleLogout} />
              </CompanyProvider>
            }
          />
        )}
      </Routes>
    </Router>
  );
}

function AppContent({ user, onLogout }: { user: User; onLogout: () => void }) {
  const { currentCompany, isLoading } = useCompany();
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Update API client with current company
  useEffect(() => {
    if (currentCompany) {
      setCurrentCompany(currentCompany.id);
    }
  }, [currentCompany]);

  const handleNavigate = (page: string, params?: any) => {
    if (page === 'create-company') {
      setShowCreateCompanyModal(true);
      return;
    }
    
    // Handle routes with parameters
    if (params?.projectId) {
      navigate(`/project-detail/${params.projectId}`);
    } else if (params?.employeeId) {
      navigate(`/employee-profile/${params.employeeId}`);
    } else if (params?.leadId) {
      navigate(`/lead-detail/${params.leadId}`);
    } else if (params?.sprintId) {
      navigate(`/sprint-detail/${params.sprintId}`);
    } else {
      navigate(`/${page}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No company selected</p>
          <button onClick={() => setShowCreateCompanyModal(true)} className="text-primary">
            Create a company
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        <Sidebar 
          user={user} 
          currentPage={location.pathname.split('/')[1] || 'dashboard'}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Dashboard Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              user?.role === 'finance' ? (
                <FinanceDashboard user={user} navigateTo={handleNavigate} />
              ) : user?.role === 'accounts' ? (
                <AccountsDashboard user={user} navigateTo={handleNavigate} />
              ) : user?.role === 'manager' || user?.role === 'admin' ? (
                <ManagerDashboard user={user} navigateTo={handleNavigate} />
              ) : (
                <EmployeeDashboard user={user} navigateTo={handleNavigate} />
              )
            } />
            
            {/* Leads Routes */}
            <Route path="/leads" element={
              !canAccessLeads(user) ? (
                <AccessDenied onNavigateBack={() => handleNavigate('dashboard')} message="HR role cannot access leads. Please contact your administrator." />
              ) : (
                <LeadsList user={user} navigateTo={handleNavigate} />
              )
            } />
            <Route path="/lead-detail/:leadId" element={<LeadDetail user={user} navigateTo={handleNavigate} />} />
            <Route path="/lead-form" element={<LeadForm user={user} navigateTo={handleNavigate} />} />
            
            {/* Attendance Routes */}
            <Route path="/my-attendance" element={<MyAttendance user={user} />} />
            <Route path="/attendance-calendar" element={<AttendanceCalendar user={user} />} />
            <Route path="/team-attendance" element={<TeamAttendance user={user} />} />
            
            {/* Timesheet Routes */}
            <Route path="/my-timesheet" element={<MyTimesheet user={user} />} />
            <Route path="/timesheet-approval" element={<TimesheetApproval user={user} />} />
            
            {/* Project Routes */}
            <Route path="/projects" element={
              !canAccessProjects(user) ? (
                <AccessDenied onNavigateBack={() => handleNavigate('dashboard')} message="HR role cannot access projects. Please contact your administrator." />
              ) : (
                <ProjectList user={user} navigateTo={handleNavigate} />
              )
            } />
            <Route path="/project-detail/:projectId" element={
              !canAccessProjects(user) ? (
                <AccessDenied onNavigateBack={() => handleNavigate('dashboard')} message="HR role cannot access projects." />
              ) : (
                <ProjectDetail user={user} navigateTo={handleNavigate} />
              )
            } />
            <Route path="/sprint-detail/:sprintId" element={
              !canAccessProjects(user) ? (
                <AccessDenied onNavigateBack={() => handleNavigate('dashboard')} message="HR role cannot access projects." />
              ) : (
                <SprintDetail user={user} navigateTo={handleNavigate} />
              )
            } />
            <Route path="/sprint-burndown/:sprintId" element={
              !canAccessProjects(user) ? (
                <AccessDenied onNavigateBack={() => handleNavigate('dashboard')} message="HR role cannot access projects." />
              ) : (
                <BurndownChart user={user} navigateTo={handleNavigate} />
              )
            } />
            
            {/* Task Routes */}
            <Route path="/my-tasks" element={<MyTasks user={user} navigateTo={handleNavigate} />} />
            {/* <Route path="/project-grid" element={<ProjectTasks user={user} navigateTo={handleNavigate} />} /> */}
            <Route path="/project-grid" element={<ProjectGrid />} />
            <Route path="/project-tasks/:id" element={<ProjectTasks user={user} navigateTo={handleNavigate} />} />
            
            {/* Employee Routes */}
            <Route path="/employees" element={<EmployeeDirectory user={user} navigateTo={handleNavigate} />} />
            <Route path="/employee-profile/:employeeId" element={<EmployeeProfile user={user} />} />
            
            {/* Document Routes */}
            <Route path="/my-documents" element={<DocumentsList user={user} />} />
            <Route path="/document-management" element={<DocumentManagement user={user} />} />
            
            {/* Performance Routes */}
            <Route path="/my-appraisals" element={<MyAppraisals user={user} navigateTo={handleNavigate} />} />
            <Route path="/appraisal-form" element={<AppraisalForm user={user} navigateTo={handleNavigate} />} />
            <Route path="/appraisal-management" element={<AppraisalManagement user={user} navigateTo={handleNavigate} />} />
            <Route path="/review-appraisal" element={<ReviewAppraisal user={user} navigateTo={handleNavigate} />} />
            
            {/* Leave Routes */}
            <Route path="/my-leaves" element={<MyLeaves user={user} navigateTo={handleNavigate} />} />
            <Route path="/leave-form" element={<LeaveForm user={user} navigateTo={handleNavigate} />} />
            <Route path="/leave-approval" element={<LeaveApproval user={user} />} />
            <Route path="/leave-management" element={<LeaveManagement user={user} />} />
            
            {/* Payroll Routes */}
            <Route path="/my-payroll" element={<MyPayroll user={user} navigateTo={handleNavigate} />} />
            <Route path="/payroll-processing" element={<PayrollProcessing user={user} navigateTo={handleNavigate} />} />
            <Route path="/payroll-approval" element={<PayrollApproval user={user} navigateTo={handleNavigate} />} />
            
            {/* Invoice Routes */}
            <Route path="/invoices" element={<InvoiceList user={user} navigateTo={handleNavigate} />} />
            <Route path="/create-invoice" element={<CreateInvoice user={user} navigateTo={handleNavigate} />} />
            
            {/* Accounting Routes */}
            <Route path="/accounting-dashboard" element={<AccountingDashboard user={user} navigateTo={handleNavigate} />} />
            <Route path="/ledger" element={<GeneralLedger user={user} navigateTo={handleNavigate} />} />
            
            {/* Profile & Settings */}
            <Route path="/my-profile" element={<MyProfile user={user} />} />
            <Route path="/permissions-management" element={<PermissionsManagement user={user} />} />
            
            {/* Skills Routes */}
            <Route path="/skill-catalog" element={<SkillCatalog user={user} />} />
            <Route path="/skill-matrix" element={<SkillMatrix user={user} navigateTo={handleNavigate} />} />
            <Route path="/team-structure" element={<TeamStructure user={user} navigateTo={handleNavigate} />} />
            
            {/* Report Routes */}
            <Route path="/attendance-report" element={<AttendanceReport user={user} />} />
            <Route path="/timesheet-report" element={<TimesheetReport user={user} />} />
            <Route path="/project-report" element={<ProjectReport user={user} />} />
            <Route path="/lead-report" element={<LeadReport user={user} />} />
            
            {/* Settings Routes */}
            <Route path="/company-settings" element={<CompanySettings user={user} />} />
            <Route path="/personal-settings" element={<PersonalSettings user={user} />} />
            <Route path="/company-management" element={<CompanyManagement user={user} />} />
            
            {/* MAX Recruit Routes */}
            <Route path="/requisitions" element={<RequisitionManagement />} />
            <Route path="/candidate-portal" element={<CandidatePortal />} />
            <Route path="/interviews" element={<InterviewManagement />} />
            
            {/* MAX Foundation Routes */}
            <Route path="/onboarding" element={<OnboardingDashboard />} />
            <Route path="/separation" element={<div className="p-6"><h1 className="text-3xl mb-2">Separation Management</h1><p className="text-muted-foreground">Coming soon - Exit interviews, clearance, and offboarding workflows</p></div>} />
            
            {/* MAX Workforce Routes */}
            <Route path="/claims" element={<ClaimsReimbursement />} />
            <Route path="/shift-scheduling" element={<ShiftScheduling />} />
            <Route path="/travel" element={<div className="p-6"><h1 className="text-3xl mb-2">Travel Management</h1><p className="text-muted-foreground">Coming soon - Travel requests, bookings, and expense management</p></div>} />
            
            {/* MAX LMS Routes */}
            <Route path="/lms-dashboard" element={<LMSDashboard />} />
            <Route path="/course-catalog" element={<LMSDashboard />} />
            <Route path="/training-schedule" element={<LMSDashboard />} />
            
            {/* MAX Engage Routes */}
            <Route path="/surveys" element={<EngagementSurveys />} />
            <Route path="/feedback" element={<div className="p-6"><h1 className="text-3xl mb-2">Feedback & Recognition</h1><p className="text-muted-foreground">Coming soon - 360 feedback, peer recognition, and kudos</p></div>} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster />
      </div>
      
      <CreateCompanyModal
        open={showCreateCompanyModal}
        onClose={() => setShowCreateCompanyModal(false)}
        onSuccess={() => {
          setShowCreateCompanyModal(false);
          window.location.reload();
        }}
      />
    </>
  );
}

function SuperAdminApp({ user, onLogout }: { user: User; onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (page: string, params?: any) => {
    if (params?.companyId) {
      navigate(`/superadmin-edit-company/${params.companyId}`);
    } else if (params?.userId) {
      navigate(`/superadmin-users/${params.userId}`);
    } else {
      navigate(`/${page}`);
    }
  };

  return (
    <>
      <div className="flex h-screen bg-background">
        <SuperAdminSidebar 
          user={user} 
          currentPage={location.pathname.split('/')[1] || 'superadmin-dashboard'}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/superadmin-dashboard" replace />} />
            <Route path="/superadmin-dashboard" element={<SuperAdminDashboard user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-companies" element={<SuperAdminCompanies user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-create-company" element={<CompanyForm user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-edit-company/:companyId" element={<CompanyForm user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-company-config/:companyId" element={<CompanyConfiguration user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-users" element={<SuperAdminUsers user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-analytics" element={<SuperAdminAnalytics user={user} navigateTo={handleNavigate} />} />
            <Route path="/superadmin-settings" element={<SuperAdminSettings user={user} />} />
            <Route path="*" element={<Navigate to="/superadmin-dashboard" replace />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </>
  );
}