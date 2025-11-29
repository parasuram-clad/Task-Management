import { api, getCurrentCompanyId } from './api-client'; // Add getCurrentCompanyId import

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  date_of_birth: string;
  blood_group: string;
  avatar?: string;
  department: string;
  designation: string;
  employee_id: string;
  date_of_joining: string;
  work_location: string;
  employment_type: string;
  manager_id?: string;
  manager_name?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  date_of_birth?: string;
  blood_group?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ProfileStats {
  projects_completed: number;
  tasks_completed: number;
  attendance_rate: number;
  avg_performance: number;
  leaves_taken: number;
  upcoming_leaves: number;
}

export interface EmploymentHistory {
  id: string;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  grade?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  years_of_experience: number;
  last_used?: string;
}

// services/profile.service.ts - Update getMyProfile
export const getMyProfile = async (): Promise<ProfileData> => {
  try {
    console.log('Fetching profile without company_id parameter');
    
    // Remove company_id parameter - backend will use authenticated user's company
    const response = await api.get<ProfileData>('/employees/me/profile');
    return response;
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    
    // Enhanced fallback with better error handling
    if (error.status === 400) {
      console.warn('Bad request - likely company ID issue. Using fallback data.');
    }
    
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        address: user.address || 'N/A',
        bio: user.bio || 'N/A',
        emergency_contact_name: user.emergencyContactName || 'N/A',
        emergency_contact_phone: user.emergencyContactPhone || 'N/A',
        date_of_birth: user.dateOfBirth || '',
        blood_group: user.bloodGroup || 'N/A',
        department: user.department || 'N/A',
        designation: user.designation || 'N/A',
        employee_id: user.employeeId || 'N/A',
        date_of_joining: user.hireDate || new Date().toISOString().split('T')[0],
        work_location: user.workLocation || 'N/A',
        employment_type: user.employmentType || 'N/A',
        avatar: user.avatar,
      };
    }
    
    throw error;
  }
};
export const getProfileStats = async (): Promise<ProfileStats | null> => {
  try {
    const response = await api.get<ProfileStats>('/employees/me/stats');
    return response;
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return null;
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<ProfileData> => {
  try {
    const response = await api.put<ProfileData>('/employees/me/profile', data);
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>('/employees/me/change-password', data);
    return response;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};



/**
 * Upload profile picture
 */
export const uploadAvatar = async (file: File): Promise<{ avatar_url: string }> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const currentCompanyId = getCurrentCompanyId();
    const response = await api.post<{ avatar_url: string }>('/employees/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        company_id: currentCompanyId
      }
    });
    return response;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Get employment history
 */
export const getEmploymentHistory = async (): Promise<EmploymentHistory[]> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.get<EmploymentHistory[]>('/employees/me/employment-history', {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error fetching employment history:', error);
    return [];
  }
};

/**
 * Get education history
 */
export const getEducation = async (): Promise<Education[]> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.get<Education[]>('/employees/me/education', {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error fetching education:', error);
    return [];
  }
};

/**
 * Get skills
 */
export const getSkills = async (): Promise<Skill[]> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.get<Skill[]>('/employees/me/skills', {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

/**
 * Add or update skill
 */
export const updateSkill = async (skill: Omit<Skill, 'id'> & { id?: string }): Promise<Skill> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    if (skill.id) {
      const response = await api.put<Skill>(`/employees/me/skills/${skill.id}`, skill, {
        company_id: currentCompanyId
      });
      return response;
    } else {
      const response = await api.post<Skill>('/employees/me/skills', skill, {
        company_id: currentCompanyId
      });
      return response;
    }
  } catch (error) {
    console.error('Error updating skill:', error);
    throw error;
  }
};

/**
 * Delete skill
 */
export const deleteSkill = async (skillId: string): Promise<{ message: string }> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.delete<{ message: string }>(`/employees/me/skills/${skillId}`, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error deleting skill:', error);
    throw error;
  }
};

/**
 * Add employment history
 */
export const addEmploymentHistory = async (history: Omit<EmploymentHistory, 'id'>): Promise<EmploymentHistory> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.post<EmploymentHistory>('/employees/me/employment-history', history, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error adding employment history:', error);
    throw error;
  }
};

/**
 * Update employment history
 */
export const updateEmploymentHistory = async (id: string, history: Partial<EmploymentHistory>): Promise<EmploymentHistory> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.put<EmploymentHistory>(`/employees/me/employment-history/${id}`, history, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error updating employment history:', error);
    throw error;
  }
};

/**
 * Delete employment history
 */
export const deleteEmploymentHistory = async (id: string): Promise<{ message: string }> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.delete<{ message: string }>(`/employees/me/employment-history/${id}`, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error deleting employment history:', error);
    throw error;
  }
};

/**
 * Add education
 */
export const addEducation = async (education: Omit<Education, 'id'>): Promise<Education> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.post<Education>('/employees/me/education', education, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error adding education:', error);
    throw error;
  }
};

/**
 * Update education
 */
export const updateEducation = async (id: string, education: Partial<Education>): Promise<Education> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.put<Education>(`/employees/me/education/${id}`, education, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error updating education:', error);
    throw error;
  }
};

/**
 * Delete education
 */
export const deleteEducation = async (id: string): Promise<{ message: string }> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.delete<{ message: string }>(`/employees/me/education/${id}`, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error deleting education:', error);
    throw error;
  }
};

/**
 * Get emergency contacts
 */
export const getEmergencyContacts = async (): Promise<Array<{
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
}>> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.get<Array<{
      id: string;
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      address?: string;
      is_primary: boolean;
    }>>('/employees/me/emergency-contacts', {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return [];
  }
};

/**
 * Add emergency contact
 */
export const addEmergencyContact = async (contact: {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary?: boolean;
}): Promise<any> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.post('/employees/me/emergency-contacts', contact, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
};

/**
 * Update emergency contact
 */
export const updateEmergencyContact = async (id: string, contact: {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_primary?: boolean;
}): Promise<any> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.put(`/employees/me/emergency-contacts/${id}`, contact, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
};

/**
 * Delete emergency contact
 */
export const deleteEmergencyContact = async (id: string): Promise<{ message: string }> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.delete<{ message: string }>(`/employees/me/emergency-contacts/${id}`, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    throw error;
  }
};

/**
 * Get bank details
 */
export const getBankDetails = async (): Promise<{
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  branch_name?: string;
  account_type?: string;
} | null> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.get<{
      bank_name: string;
      account_number: string;
      ifsc_code: string;
      account_holder_name: string;
      branch_name?: string;
      account_type?: string;
    }>('/employees/me/bank-details', {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error fetching bank details:', error);
    return null;
  }
};

/**
 * Update bank details
 */
export const updateBankDetails = async (details: {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  branch_name?: string;
  account_type?: string;
}): Promise<any> => {
  try {
    const currentCompanyId = getCurrentCompanyId();
    const response = await api.put('/employees/me/bank-details', details, {
      company_id: currentCompanyId
    });
    return response;
  } catch (error) {
    console.error('Error updating bank details:', error);
    throw error;
  }
};