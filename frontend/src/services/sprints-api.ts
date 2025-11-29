import { apiClient } from './api-client';

export interface Sprint {
  id: number;
  project_id: number;
  name: string;
  goal?: string | null;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface SprintCreateRequest {
  projectId: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status?: 'planned' | 'active' | 'completed' | 'canceled';
}

export interface BurndownPoint {
  day: string;
  remaining_tasks: number;
}

export const sprintsApi = {
  getSprints: (projectId?: number) => {
    const params = projectId ? { projectId } : {};
    return apiClient.get<Sprint[]>('/sprints', params);
  },
  
  createSprint: (data: SprintCreateRequest) => 
    apiClient.post<Sprint>('/sprints', data),
  
  addTasksToSprint: (sprintId: number, taskIds: number[]) =>
    apiClient.post(`/sprints/${sprintId}/tasks`, { taskIds }),
  
  getBurndown: (sprintId: number) =>
    apiClient.get<BurndownPoint[]>(`/sprints/${sprintId}/burndown`),
};
