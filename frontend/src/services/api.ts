// API Service - All API endpoints
import { apiClient } from './api-client';
export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
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
// Type Definitions
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
}

export interface AttendanceDay {
  id?: number;
  user_id: number;
  work_date: string;
  status: string;
  check_in_at?: string;
  check_out_at?: string;
}

// In api.ts - Update the TimesheetEntry interface
export interface TimesheetEntry {
  id?: number;
  project_id: number;
  projectId?: number;
  task_id?: number;
  taskId?: number;
  work_date: string;
  workDate?: string;
  hours: number;
  note?: string;
  project_name?: string;
  task_title?: string; // Ensure this is included
}

// Update the Timesheet interface in api.ts
// In api.ts - Update the Timesheet interface
export interface Timesheet {
  id?: number;
  user_id: number;
  week_start_date: string;
  status: string;
  submitted_at?: string;
  approved_at?: string;
  approved_by?: number;
  rejected_at?: string;
  rejected_by?: number;
  rejection_reason?: string; // Add this for rejection comments
  entries: TimesheetEntry[];
  total_hours?: number;
  // Add these for display purposes
  approver_name?: string;
  rejector_name?: string;
  user_name?: string; // Add employee name
  email?: string; // Add employee email
}
// In api.ts - Update the Project interface
// In api.ts - Update the Project interface
export interface Project {
  id: number;
  name: string;
  client?: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  manager_id?: number;
  manager_name?: string;
  members?: Array<{
    id: number;
    user_id: number;
    user_name: string;
    role_label?: string;
    total_hours?: number;
  }>;
  tasks?: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    assignee_id?: number;
  }>;
}
export interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  phone?: string;
  location?: string;
  employee_id?: string;
  hire_date?: string;
  is_active?: boolean;
}
export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  role: string;
  department?: string;
  position?: string;
  manager?: string;
  dateOfBirth?: string;
  dateOfJoin: string;
  employmentType?: string;
  location?: string;
  shift?: string;
  status: 'active' | 'inactive';
}

export interface CreateEmployeeResponse {
  message: string;
  employee: Employee;
  emailSent: boolean;
}
export interface AttendanceSummary {
  daysPresent: number;
  totalHours: number;
  averageHours: number;
  lateArrivals: number;
}

export interface RecentAttendance {
  date: string;
  day: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: string;
}

export interface TeamAttendanceRecord {
  id: string;
  user_id: string;
  employee_code: string;
  user_name: string;
  email: string;
  department?: string; // Add department
  work_date: string;
  status: string;
  check_in_at?: string;
  check_out_at?: string;
  attendance_id?: string; // Add attendance_id to distinguish between actual records and user entries
}
export interface RegularizationRequest {
  id: string;
  user_id: string;
  user_name: string;
  email: string;
  work_date: string;
  type: string;
  proposed_time: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
// In api.ts - Update the Task interface

export interface Task {
  id: number;
  project_id: number;
  projectId?: number; // Add this for backend compatibility
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: number;    // Keep this for frontend compatibility
  assignee_id?: number;    // Add this to match backend field
  due_date?: string;
  project_name?: string;
  assignee_name?: string;
}

export interface WeeklyTimesheet {
  week_start_date: string;
  total_hours: number;
  users: Array<{
    user_id: number;
    user_name: string;
    email: string;
    total_hours: number;
    entries: TimesheetEntry[];
  }>;
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  getMe: () => apiClient.get<LoginResponse['user']>('/auth/me'),

  refresh: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),

  logout: () => apiClient.post('/auth/logout'),
};

// Add these to the attendanceApi object
// Update the attendanceApi object
export const attendanceApi = {
  getToday: () =>
    apiClient.get<AttendanceDay>('/attendance/me/today'),

  clockIn: () =>
    apiClient.post<AttendanceDay>('/attendance/me/clock-in'),

  clockOut: () =>
    apiClient.post<AttendanceDay>('/attendance/me/clock-out'),
 updateTeamAttendance: (data: any) =>
    apiClient.put<any>('/attendance/team/update', data),
  getCalendar: (year?: number, month?: number) =>
    apiClient.get<AttendanceDay[]>('/attendance/me/calendar', {
      year,
      month,
    }),
  requestRegularization: (data: {
    workDate: string;
    type: 'check_in' | 'check_out';
    proposedTime: string;
    reason: string;
  }) => apiClient.post<any>('/attendance/me/regularization', data),
  getWeeklySummary: () =>
    apiClient.get<AttendanceSummary>('/attendance/me/weekly-summary'),

  getRecentAttendance: (days: number = 7) =>
    apiClient.get<RecentAttendance[]>(`/attendance/me/recent?days=${days}`),

  // Team attendance endpoints
  getTeamAttendance: (date?: string) =>
    apiClient.get<TeamAttendanceRecord[]>('/attendance/team', { date }),

  getRegularizationRequests: () =>
    apiClient.get<RegularizationRequest[]>('/attendance/regularizations'),

  approveRegularization: (id: string, action: 'approve' | 'reject', comment?: string) =>
    apiClient.post<any>(`/attendance/regularizations/${id}/decision`, { 
      action, 
      comment 
    }),

     getEmployeeAttendance: (employeeId: number, startDate?: string, endDate?: string) =>
    apiClient.get<TeamAttendanceRecord[]>(`/attendance/employee/${employeeId}`, {
      startDate,
      endDate
    }),
};
// Timesheet API

// In api.ts - Add to timesheetApi object
export const timesheetApi = {
  getWeekly: (weekStartDate: string) =>
    apiClient.get<Timesheet>('/timesheets/me', { weekStartDate }),

  getTimeLogsByTask: (taskId: number) =>
    apiClient.get<TimesheetEntry[]>(`/timesheets/task/${taskId}/logs`),

  deleteEntry: (entryId: string) =>
    apiClient.delete(`/timesheets/entry/${entryId}`),

  save: (data: { 
    weekStartDate: string; 
    week_start_date?: string;
    entries: TimesheetEntry[] 
  }) => {
    const requestData = {
      weekStartDate: data.weekStartDate,
      entries: data.entries.map(entry => ({
        projectId: entry.project_id || entry.projectId,
        taskId: entry.task_id || entry.taskId,
        workDate: formatDateForBackend(entry.work_date || entry.workDate),
        hours: entry.hours,
        note: entry.note
      }))
    };
    
    console.log('Saving timesheet data:', requestData);
    
    return apiClient.post<Timesheet>('/timesheets/me/save', requestData);
  },

  submit: (data: { weekStartDate: string }) =>
    apiClient.post<Timesheet>('/timesheets/me/submit', data),

  getEmployeeTimesheets: (employeeId: number) =>
    apiClient.get<Timesheet[]>(`/timesheets/employee/${employeeId}`),

  // NEW METHODS FOR PROJECT AND TASK FILTERING
  getMyProjects: () =>
    apiClient.get<Project[]>('/timesheets/me/projects'),

  getMyTasksForProject: (projectId: number) =>
    apiClient.get<Task[]>(`/timesheets/me/projects/${projectId}/tasks`),

  getMyEntriesForDate: (date: string) =>
    apiClient.get<TimesheetEntry[]>(`/timesheets/me/entries/date/${date}`),


   getTimesheetsForApproval: () =>
    apiClient.get<Timesheet[]>('/timesheets/approvals'),

// In api.ts - Update the reviewTimesheet function
reviewTimesheet: (timesheetId: number, action: 'approve' | 'reject', comment?: string) => {
  const requestData: any = { action };
  if (comment && action === 'reject') {
    requestData.comment = comment;
  }
  
  return apiClient.post<Timesheet>(`/timesheets/${timesheetId}/decision`, requestData);
},
};

// Add to projectApi
// In api.ts - Update projectApi
export const projectApi = {
  list: () => apiClient.get<Project[]>('/projects'),
  get: (id: number) => apiClient.get<Project>(`/projects/${id}`),
  create: (projectData: any) => apiClient.post('/projects', projectData),
   update: (id: number, projectData: any) => {
    // Transform the data to ensure proper format
    const requestData = {
      name: projectData.name,
      description: projectData.description || undefined,
      clientName: projectData.clientName || projectData.client || undefined,
      managerId: projectData.managerId,
      startDate: projectData.startDate.includes('T') 
        ? projectData.startDate.split('T')[0] 
        : projectData.startDate,
      endDate: projectData.endDate.includes('T') 
        ? projectData.endDate.split('T')[0] 
        : projectData.endDate,
      status: projectData.status,
    };
    
    console.log('Updating project with data:', requestData);
    return apiClient.put<Project>(`/projects/${id}`, requestData);
  },
  delete: (id: number) => apiClient.delete(`/projects/${id}`),
  addMemberToProject: (projectId: number, data: { userId: number; roleLabel: string }) =>
    apiClient.post(`/projects/${projectId}/members`, data),
  removeMemberFromProject: (projectId: number, memberId: string) =>
    apiClient.delete(`/projects/${projectId}/members/${memberId}`),
  // Add method to get project with detailed task information
  getWithTasks: (id: number) => apiClient.get<Project>(`/projects/${id}?include=tasks`),

  getEmployeeProjects: (employeeId: number) => 
    apiClient.get<Project[]>(`/projects/employee/${employeeId}`),

    removeMemberFromProject: (projectId: number, memberId: string) =>
    apiClient.delete(`/projects/${projectId}/members/${memberId}`),
  getProjectTimesheets: (projectId: number) => {
    console.log(`API: Fetching timesheets for project ${projectId}`);
    return apiClient.get<WeeklyTimesheet[]>(`/projects/${projectId}/timesheets`)
      .then(data => {
        console.log(`API: Received ${data.length} weeks of timesheet data`);
        return data;
      })
      .catch(error => {
        console.error('API: Error fetching project timesheets:', error);
        throw error;
      });
  },
};

// Helper function to format date to YYYY-MM-DD
const formatDateForBackend = (dateString: string | undefined): string | undefined => {
  if (!dateString) return undefined;
  
  try {
    const date = new Date(dateString);
    // Format to YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return undefined;
  }
};

// Add to taskApi
// Add to taskApi
export const taskApi = {
  getMyTasks: () => apiClient.get<Task[]>('/tasks/me'),
  getProjectTasks: (projectId: number) =>
    apiClient.get<Task[]>(`/tasks/project/${projectId}`),
  
  create: (data: Partial<Task> & { project_id?: number; projectId?: number; assigned_to?: number; assignee_id?: number; due_date?: string }) => {
    // Transform the data to match backend expectations
    const requestData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      projectId: data.projectId || data.project_id,
      assigneeId: data.assigned_to || data.assignee_id, // Handle both field names
      dueDate: formatDateForBackend(data.due_date) // Format date to YYYY-MM-DD
    };
    
    console.log('Transformed task data:', requestData); // For debugging
    
    return apiClient.post<Task>('/tasks', requestData);
  },
  
  update: (id: number, data: Partial<Task>) => {
    // Transform update data as well
    const requestData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      assigneeId: data.assigned_to || data.assignee_id, // Handle both field names
      dueDate: formatDateForBackend(data.due_date) // Format date to YYYY-MM-DD
    };
    return apiClient.put<Task>(`/tasks/${id}`, requestData);
  },
  
  delete: (id: number) => apiClient.delete(`/tasks/${id}`),
  assignToUser: (taskId: number, userId: number) =>
    apiClient.patch(`/tasks/${taskId}/assign`, { assigneeId: userId }),
};
// Employee API
export const employeeApi = {
  list: (params?: { role?: string; active?: boolean }) =>
    apiClient.get<Employee[]>('/employees', params),

  get: (id: number) => apiClient.get<Employee>(`/employees/${id}`),

  create: (data: CreateEmployeeRequest) =>
    apiClient.post<CreateEmployeeResponse>('/employees', data),

  update: (id: number, data: Partial<Employee>) =>
    apiClient.put<Employee>(`/employees/${id}`, data),

  delete: (id: number) => apiClient.delete(`/employees/${id}`),
};

// Reports API
// Add to reportsApi object
// Update the reportsApi object
// Add to reportsApi object
export const reportsApi = {
  attendanceReport: (params?: {
    startDate?: string;
    endDate?: string;
    roles?: string | string[];
    department?: string;
  }) => apiClient.get<any[]>('/reports/attendance', params),

  weeklyAttendanceReport: (params?: {
    startDate?: string;
    endDate?: string;
    roles?: string | string[];
  }) => apiClient.get<any[]>('/reports/weekly-attendance', params),

  timesheetReport: (params?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
  }) => apiClient.get<{
    byEmployee: any[];
    byProject: any[];
  }>('/reports/timesheets', params),
};