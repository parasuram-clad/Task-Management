import { apiClient } from './api-client';

export interface Lead {
  id: number;
  company_id: number;
  name: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  source?: string | null;
  status: 'open' | 'qualified' | 'converted' | 'lost';
  value_amount?: number | null;
  owner_id?: number | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  activities?: LeadActivity[];
  linkedProjects?: LinkedProject[];
}

export interface LeadActivity {
  id: number;
  lead_id: number;
  user_id: number;
  type: 'note' | 'call' | 'email' | 'meeting';
  subject?: string;
  body?: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface LinkedProject {
  id: number;
  name: string;
  status: string;
}

export interface LeadCreateRequest {
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  source?: string;
  status?: 'open' | 'qualified' | 'converted' | 'lost';
  valueAmount?: number;
  ownerId?: number;
  notes?: string;
}

export interface LeadActivityCreateRequest {
  type: 'note' | 'call' | 'email' | 'meeting';
  subject?: string;
  body?: string;
}

export const leadsApi = {
  getLeads: () => apiClient.get<Lead[]>('/leads'),
  
  getLeadById: (id: number) => apiClient.get<Lead>(`/leads/${id}`),
  
  createLead: (data: LeadCreateRequest) => apiClient.post<Lead>('/leads', data),
  
  updateLead: (id: number, data: LeadCreateRequest) => 
    apiClient.put<Lead>(`/leads/${id}`, data),
  
  addActivity: (leadId: number, data: LeadActivityCreateRequest) =>
    apiClient.post(`/leads/${leadId}/activities`, data),
  
  linkProject: (leadId: number, projectId: number) =>
    apiClient.post(`/leads/${leadId}/link-project`, { projectId }),
};
