// services/attendance-api.ts
import { api } from './api-client';

export interface AttendanceDay {
  id: string;
  companyId: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'on_leave' | 'holiday';
  workHours?: number;
  locationLat?: number;
  locationLng?: number;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  holiday: number;
  totalHours: number;
  averageHours: number;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  date: string;
  type: 'check-in' | 'check-out' | 'both';
  proposedCheckIn?: string;
  proposedCheckOut?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TeamAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  status: 'present' | 'absent' | 'on_leave';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
}

class AttendanceApiService {
  // ===== INDIVIDUAL ATTENDANCE ENDPOINTS =====
  
  /**
   * Get today's attendance for current user
   */
  async getToday(): Promise<AttendanceDay | null> {
    try {
      return await api.get<AttendanceDay>('/attendance/me/today');
    } catch (error: any) {
      if (error.status === 404) {
        return null; // No attendance record for today
      }
      throw error;
    }
  }

  /**
   * Clock in for current user
   */
  async clockIn(data?: {
    location?: string;
    latitude?: number;
    longitude?: number;
    deviceInfo?: string;
    remarks?: string;
  }): Promise<AttendanceDay> {
    return await api.post<AttendanceDay>('/attendance/me/clock-in', data);
  }

  /**
   * Clock out for current user
   */
  async clockOut(data?: {
    location?: string;
    latitude?: number;
    longitude?: number;
    remarks?: string;
  }): Promise<AttendanceDay> {
    return await api.post<AttendanceDay>('/attendance/me/clock-out', data);
  }

  /**
   * Get weekly statistics for current user
   */
  async getWeeklyStats(startDate: string, endDate: string): Promise<AttendanceStats> {
    return await api.get<AttendanceStats>('/attendance/me/stats', {
      startDate,
      endDate
    });
  }

  /**
   * Get recent attendance for current user
   */
  async getRecent(days: number = 7): Promise<AttendanceDay[]> {
    return await api.get<AttendanceDay[]>('/attendance/me/recent', { days });
  }

  /**
   * Get calendar data for current user
   */
  async getCalendar(year: number, month: number): Promise<AttendanceDay[]> {
    return await api.get<AttendanceDay[]>('/attendance/me/calendar', {
      year,
      month: month.toString().padStart(2, '0')
    });
  }

  /**
   * Request attendance regularization
   */
  async requestRegularization(data: {
    date: string;
    type: 'check-in' | 'check-out' | 'both';
    proposedCheckIn?: string;
    proposedCheckOut?: string;
    reason: string;
  }): Promise<RegularizationRequest> {
    return await api.post<RegularizationRequest>('/attendance/me/regularize', data);
  }

  // ===== TEAM/MANAGEMENT ENDPOINTS =====

  /**
   * Get team attendance (for managers)
   */
  async getTeamAttendance(date: string): Promise<TeamAttendanceRecord[]> {
    return await api.get<TeamAttendanceRecord[]>('/attendance/team', { date });
  }

  /**
   * Get regularization requests (for managers)
   */
  async getRegularizationRequests(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }): Promise<{
    requests: RegularizationRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await api.get('/attendance/regularization-requests', params);
  }

  /**
   * Approve/reject regularization request (for managers)
   */
  async approveRegularization(
    requestId: string, 
    data: {
      status: 'approved' | 'rejected';
      remarks?: string;
    }
  ): Promise<RegularizationRequest> {
    return await api.patch<RegularizationRequest>(
      `/attendance/regularization/${requestId}`,
      data
    );
  }

  /**
   * Get attendance records with filters (for managers)
   */
  async getAttendanceRecords(params?: {
    employeeId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    records: AttendanceDay[];
    total: number;
    page: number;
    limit: number;
  }> {
    return await api.get('/attendance', params);
  }

  /**
   * Create manual attendance entry (for managers)
   */
  async createManualAttendance(data: {
    employeeId: string;
    date: string;
    clockInTime: string;
    clockOutTime?: string;
    status: string;
    workHours?: number;
    remarks?: string;
  }): Promise<AttendanceDay> {
    return await api.post<AttendanceDay>('/attendance', data);
  }

  /**
   * Update attendance record (for managers)
   */
  async updateAttendance(
    attendanceId: string,
    data: Partial<AttendanceDay>
  ): Promise<AttendanceDay> {
    return await api.put<AttendanceDay>(`/attendance/${attendanceId}`, data);
  }

  /**
   * Get attendance statistics (for managers)
   */
  async getStatistics(params?: {
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    return await api.get('/attendance/statistics', params);
  }
}

export const attendanceApi = new AttendanceApiService();