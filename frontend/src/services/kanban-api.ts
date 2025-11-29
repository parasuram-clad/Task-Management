import { apiClient } from './api-client';

export interface KanbanColumn {
  id: number;
  project_id: number;
  name: string;
  position: number;
  wip_limit?: number | null;
  created_at: string;
}

export interface KanbanColumnCreateRequest {
  projectId: number;
  name: string;
  position?: number;
  wipLimit?: number;
}

export const kanbanApi = {
  getColumns: (projectId?: number) => {
    const params = projectId ? { projectId } : {};
    return apiClient.get<KanbanColumn[]>('/kanban/columns', params);
  },
  
  createColumn: (data: KanbanColumnCreateRequest) =>
    apiClient.post<KanbanColumn>('/kanban/columns', data),
  
  moveTask: (taskId: number, toColumnId: number) =>
    apiClient.post(`/kanban/tasks/${taskId}/move`, { toColumnId }),
};
