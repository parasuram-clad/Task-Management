import { api, setAccessToken } from './api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  companyName?: string;
  companyId?: string;
  role?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    requiresMfa: boolean;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      companyId?: string | null;
      employeeId?: string | null;
      isSuperAdmin: boolean;
      emailVerified: boolean;
      mfaEnabled: boolean;
    };
    company?: any;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
  timestamp: string;
}

export interface ForgotPasswordResponse {
  message: string;
  expiresIn: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    console.log('Login response:', response); // Debug log
    
    if (response.data.tokens?.accessToken) {
      setAccessToken(response.data.tokens.accessToken);
      localStorage.setItem('refresh_token', response.data.tokens.refreshToken);
      
      // Store user data with proper UUID
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Stored user data:', response.data.user); // Debug log
      }
      
      // Store company data if available
      if (response.data.company) {
        localStorage.setItem('current_company', JSON.stringify(response.data.company));
        console.log('Stored company data:', response.data.company); // Debug log
      }
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.tokens?.accessToken) {
      setAccessToken(response.data.tokens.accessToken);
      localStorage.setItem('refresh_token', response.data.tokens.refreshToken);
    }
    return response.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await api.post<{ message: string; expiresIn: string }>('/auth/forgot-password', data);
    return response;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', data);
    return response;
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-email', data);
    return response;
  },

  async sendVerificationEmail(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/send-verification-email');
    return response;
  },

  async refreshToken(): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await api.post<{ tokens: { accessToken: string; refreshToken: string } }>('/auth/refresh', {
      refreshToken,
    });
    if (response.tokens.accessToken) {
      setAccessToken(response.tokens.accessToken);
      localStorage.setItem('refresh_token', response.tokens.refreshToken);
    }
    return response;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    setAccessToken(null);
    localStorage.removeItem('refresh_token');
    return response;
  },

  async getProfile(): Promise<any> {
    const response = await api.get<any>('/auth/me');
    return response.data || response;
  },

  
};

// // Add to your existing api-client.ts
// // API Service - All API endpoints
// import { api as apiClient } from './api-client';

// // Type Definitions
// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface LoginResponse {
//   user: {
//     id: number;
//     name: string;
//     email: string;
//     role: string;
//   };
//   accessToken: string;
// }

// export interface AttendanceDay {
//   id?: number;
//   user_id: number;
//   work_date: string;
//   status: string;
//   check_in_at?: string;
//   check_out_at?: string;
// }

// export interface TimesheetEntry {
//   id?: number;
//   project_id: number;
//   task_id?: number;
//   work_date: string;
//   hours: number;
//   note?: string;
//   project_name?: string;
//   task_title?: string;
// }

// export interface Timesheet {
//   id?: number;
//   user_id: number;
//   week_start_date: string;
//   status: string;
//   submitted_at?: string;
//   approved_at?: string;
//   approved_by?: number;
//   entries: TimesheetEntry[];
// }

// export interface Project {
//   id: number;
//   name: string;
//   client?: string;
//   description?: string;
//   start_date: string;
//   end_date: string;
//   status: string;
//   manager_id?: number;
//   manager_name?: string;
//   members?: any[];
// }

// export interface Task {
//   id: number;
//   project_id: number;
//   title: string;
//   description?: string;
//   status: string;
//   priority: string;
//   assigned_to?: number;
//   due_date?: string;
//   project_name?: string;
//   assignee_name?: string;
// }

// export interface Employee {
//   id: number;
//   name: string;
//   email: string;
//   role: string;
//   department?: string;
//   designation?: string;
//   phone?: string;
//   location?: string;
//   employee_id?: string;
//   hire_date?: string;
//   is_active?: boolean;
// }

// // Auth API
// export const authApi = {
//   login: (data: LoginRequest) =>
//     apiClient.post<LoginResponse>('/auth/login', data),

//   getMe: () => apiClient.get<LoginResponse['user']>('/auth/me'),

//   refresh: () =>
//     apiClient.post<{ accessToken: string }>('/auth/refresh'),

//   logout: () => apiClient.post('/auth/logout'),
// };

// // Attendance API
// export const attendanceApi = {
//   getToday: () =>
//     apiClient.get<AttendanceDay>('/attendance/me/today'),

//   clockIn: () =>
//     apiClient.post<AttendanceDay>('/attendance/me/clock-in'),

//   clockOut: () =>
//     apiClient.post<AttendanceDay>('/attendance/me/clock-out'),

//   // getCalendar: (year?: number, month?: number) =>
//   //   apiClient.get<AttendanceDay[]>('/attendance/me/calendar', {
//   //     year,
//   //     month,
//   //   }),
//     getWeeklyStats: (startDate: string, endDate: string) =>
//     apiClient.get<any>('/attendance/me/stats', { startDate, endDate }),

//   getRecent: (days: number) =>
//     apiClient.get<any[]>('/attendance/me/recent', { days }),

//   getCalendar: (year: number, month: number) =>
//     apiClient.get<any[]>('/attendance/me/calendar', { year, month }),

//   requestRegularization: (data: any) =>
//     apiClient.post<any>('/attendance/me/regularize', data),

//   getTeamAttendance: (date: string) =>
//     apiClient.get<any[]>('/attendance/team', { date }),
// };

// // Timesheet API
// export const timesheetApi = {
//   getWeekly: (weekStartDate: string) =>
//     apiClient.get<Timesheet>('/timesheets/me', { weekStartDate }),

//   save: (data: Partial<Timesheet>) =>
//     apiClient.post<Timesheet>('/timesheets/me/save', data),

//   submit: (data: Partial<Timesheet>) =>
//     apiClient.post<Timesheet>('/timesheets/me/submit', data),
// };

// // Project API
// export const projectApi = {
//   list: () => apiClient.get<Project[]>('/projects'),

//   get: (id: number) => apiClient.get<Project>(`/projects/${id}`),

//   create: (data: Partial<Project>) =>
//     apiClient.post<Project>('/projects', data),

//   update: (id: number, data: Partial<Project>) =>
//     apiClient.put<Project>(`/projects/${id}`, data),

//   delete: (id: number) => apiClient.delete(`/projects/${id}`),
// };

// // Task API
// export const taskApi = {
//   getMyTasks: () => apiClient.get<Task[]>('/tasks/me'),

//   getProjectTasks: (projectId: number) =>
//     apiClient.get<Task[]>(`/tasks/project/${projectId}`),

//   create: (data: Partial<Task>) =>
//     apiClient.post<Task>('/tasks', data),

//   update: (id: number, data: Partial<Task>) =>
//     apiClient.put<Task>(`/tasks/${id}`, data),

//   delete: (id: number) => apiClient.delete(`/tasks/${id}`),
// };

// // Employee API
// export const employeeApi = {
//   list: (params?: { role?: string; active?: boolean }) =>
//     apiClient.get<Employee[]>('/employees', params),

//   get: (id: number) => apiClient.get<Employee>(`/employees/${id}`),

//   create: (data: Partial<Employee>) =>
//     apiClient.post<Employee>('/employees', data),

//   update: (id: number, data: Partial<Employee>) =>
//     apiClient.put<Employee>(`/employees/${id}`, data),

//   delete: (id: number) => apiClient.delete(`/employees/${id}`),
// };

// // Reports API
// export const reportsApi = {
//   attendance: (params?: {
//     userId?: number;
//     startDate?: string;
//     endDate?: string;
//   }) => apiClient.get<any[]>('/reports/attendance', params),

//   timesheets: (params?: {
//     userId?: number;
//     startDate?: string;
//     endDate?: string;
//   }) => apiClient.get<any[]>('/reports/timesheets', params),
// };

// // ===== RBAC API =====

// // Permission Types
// export interface Permission {
//   id: string;
//   module: string;
//   action: string;
//   code: string;
//   description?: string;
//   createdAt: string;
// }

// export interface Role {
//   id: string;
//   companyId: string;
//   name: string;
//   displayName: string;
//   description?: string;
//   permissions: any;
//   isSystem: boolean;
//   createdAt: string;
//   updatedAt: string;
//   rolePermissions?: Array<{
//     permission: Permission;
//   }>;
//   userRoles?: Array<{
//     user: {
//       id: string;
//       email: string;
//       firstName: string;
//       lastName: string;
//     };
//   }>;
//   _count?: {
//     rolePermissions: number;
//     userRoles: number;
//   };
// }

// // Permission API
// export const permissionApi = {
//   // List all permissions
//   list: (params?: {
//     page?: number;
//     limit?: number;
//     module?: string;
//     action?: string;
//     search?: string;
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
//   }) => apiClient.get<{
//     permissions: Permission[];
//     total: number;
//     page: number;
//     limit: number;
//   }>('/permissions', params),

//   // Get permission by ID
//   getById: (id: string) => apiClient.get<Permission>(`/permissions/${id}`),

//   // Get permissions by module
//   getByModule: (module: string) =>
//     apiClient.get<Permission[]>('/permissions/by-module', { module }),

//   // Get all modules
//   getModules: () => apiClient.get<{ modules: string[] }>('/permissions/modules'),

//   // Get all actions
//   getActions: () => apiClient.get<{ actions: string[] }>('/permissions/actions'),

//   // Create permission (Super Admin only)
//   create: (data: {
//     module: string;
//     action: string;
//     code: string;
//     description?: string;
//   }) => apiClient.post<Permission>('/permissions', data),

//   // Bulk create permissions (Super Admin only)
//   bulkCreate: (permissions: Array<{
//     module: string;
//     action: string;
//     code: string;
//     description?: string;
//   }>) => apiClient.post<{
//     created: number;
//     failed: number;
//     permissions: Permission[];
//     errors: any[];
//   }>('/permissions/bulk', { permissions }),

//   // Seed default permissions (Super Admin only)
//   seed: () => apiClient.post<{
//     created: number;
//     failed: number;
//     permissions: Permission[];
//     errors: any[];
//   }>('/permissions/seed', {}),

//   // Update permission (Super Admin only)
//   update: (id: string, data: {
//     module?: string;
//     action?: string;
//     code?: string;
//     description?: string;
//   }) => apiClient.put<Permission>(`/permissions/${id}`, data),

//   // Delete permission (Super Admin only)
//   delete: (id: string) => apiClient.delete<{ message: string }>(`/permissions/${id}`),
// };

// // Role API
// export const roleApi = {
//   // List all roles
//   list: (params?: {
//     page?: number;
//     limit?: number;
//     companyId?: string;
//     search?: string;
//     isSystem?: string;
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
//   }) => apiClient.get<{
//     roles: Role[];
//     total: number;
//     page: number;
//     limit: number;
//   }>('/roles', params),

//   // Get role by ID
//   getById: (id: string) => apiClient.get<Role>(`/roles/${id}`),

//   // Create role (Admin)
//   create: (data: {
//     companyId: string;
//     name: string;
//     displayName: string;
//     description?: string;
//     permissions?: string[];
//     isSystem?: boolean;
//   }) => apiClient.post<Role>('/roles', data),

//   // Seed default roles (Super Admin only)
//   seed: (companyId: string) => apiClient.post<{
//     message: string;
//     created: number;
//     roles: Role[];
//   }>('/roles/seed', { companyId }),

//   // Update role (Admin)
//   update: (id: string, data: {
//     name?: string;
//     displayName?: string;
//     description?: string;
//     permissions?: string[];
//   }) => apiClient.put<Role>(`/roles/${id}`, data),

//   // Delete role (Admin)
//   delete: (id: string) => apiClient.delete<{ message: string }>(`/roles/${id}`),

//   // Clone role (Admin)
//   clone: (id: string, data: {
//     name: string;
//     displayName: string;
//     companyId?: string;
//   }) => apiClient.post<Role>(`/roles/${id}/clone`, data),

//   // ===== Role Permissions =====

//   // Get role permissions
//   getPermissions: (id: string) => apiClient.get<{
//     permissions: Permission[];
//   }>(`/roles/${id}/permissions`),

//   // Assign permissions to role (Admin)
//   assignPermissions: (id: string, permissionIds: string[]) =>
//     apiClient.post<{
//       message: string;
//       assignedCount: number;
//       alreadyExisted: number;
//     }>(`/roles/${id}/permissions`, { permissionIds }),

//   // Remove permission from role (Admin)
//   removePermission: (id: string, permissionId: string) =>
//     apiClient.delete<{ message: string }>(`/roles/${id}/permissions/${permissionId}`),

//   // ===== User Roles =====

//   // Get users by role
//   getUsers: (id: string, params?: {
//     page?: number;
//     limit?: number;
//   }) => apiClient.get<{
//     users: Array<{
//       id: string;
//       email: string;
//       firstName: string;
//       lastName: string;
//       role: string;
//       isActive: boolean;
//       createdAt: string;
//     }>;
//     total: number;
//     page: number;
//     limit: number;
//   }>(`/roles/${id}/users`, params),

//   // Assign role to user (Admin/HR)
//   assignToUser: (id: string, userId: string) =>
//     apiClient.post<{ message: string }>(`/roles/${id}/users`, { userId }),

//   // Remove role from user (Admin/HR)
//   removeFromUser: (id: string, userId: string) =>
//     apiClient.delete<{ message: string }>(`/roles/${id}/users/${userId}`),
// };
// // Add to your existing api-client.ts - UPDATE profileApi
// export const profileApi = {
//   async getProfile(): Promise<any> {
//     const response = await api.get('/profile');
//     return response.data;
//   },

//   async updateProfile(data: any): Promise<any> {
//     const response = await api.put('/profile', data);
//     return response.data;
//   },

//   async updateSkills(data: any): Promise<any> {
//     const response = await api.put('/profile/skills', data);
//     return response.data;
//   },

//   async addSkill(data: any): Promise<any> {
//     const response = await api.post('/profile/skills', data);
//     return response.data;
//   },

//   async deleteSkill(skillId: string): Promise<any> {
//     const response = await api.delete(`/profile/skills/${skillId}`);
//     return response.data;
//   },

//   async updateExperience(data: any): Promise<any> {
//     const response = await api.put('/profile/experience', data);
//     return response.data;
//   },

//   async addExperience(data: any): Promise<any> {
//     const response = await api.post('/profile/experience', data);
//     return response.data;
//   },

//   async deleteExperience(experienceId: string): Promise<any> {
//     const response = await api.delete(`/profile/experience/${experienceId}`);
//     return response.data;
//   },

//   async updateEducation(data: any): Promise<any> {
//     const response = await api.put('/profile/education', data);
//     return response.data;
//   },

//   async addEducation(data: any): Promise<any> {
//     const response = await api.post('/profile/education', data);
//     return response.data;
//   },

//   async deleteEducation(educationId: string): Promise<any> {
//     const response = await api.delete(`/profile/education/${educationId}`);
//     return response.data;
//   },

//   async getProfileStats(): Promise<any> {
//     const response = await api.get('/profile/stats');
//     return response.data;
//   },
// };