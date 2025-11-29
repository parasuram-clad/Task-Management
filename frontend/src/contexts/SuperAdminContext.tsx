import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, UserCompanyRole } from './CompanyContext';

export interface PlatformUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
  is_super_admin: boolean;
}

export interface CompanyWithStats extends Company {
  user_count: number;
  is_active: boolean;
  subscription_end_date?: string;
}

interface SuperAdminContextType {
  allCompanies: CompanyWithStats[];
  allUsers: PlatformUser[];
  userCompanyAssignments: UserCompanyRole[];
  createCompany: (company: Partial<Company>) => Promise<void>;
  updateCompany: (id: number, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  toggleCompanyStatus: (id: number) => Promise<void>;
  createUser: (user: Partial<PlatformUser>) => Promise<void>;
  updateUser: (id: number, updates: Partial<PlatformUser>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  assignUserToCompany: (userId: number, companyId: number, role: string) => Promise<void>;
  removeUserFromCompany: (userId: number, companyId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  }
  return context;
}

interface SuperAdminProviderProps {
  children: ReactNode;
}

// Mock data for demonstration
const mockPlatformCompanies: CompanyWithStats[] = [
  {
    id: 1,
    name: 'Acme Corporation',
    slug: 'acme-corp',
    plan: 'professional',
    created_at: '2024-01-15T10:00:00Z',
    user_count: 45,
    is_active: true,
    subscription_end_date: '2025-01-15T00:00:00Z',
    domain: 'acme-corp',
    custom_domain: 'app.acmecorp.com',
    settings: {
      timezone: 'America/New_York',
      date_format: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primary_color: '#0077be',
      secondary_color: '#6c757d',
      accent_color: '#00a8e8',
      theme_mode: 'light',
    },
  },
  {
    id: 2,
    name: 'TechStart Inc',
    slug: 'techstart',
    plan: 'enterprise',
    created_at: '2024-03-20T14:00:00Z',
    user_count: 120,
    is_active: true,
    subscription_end_date: '2025-03-20T00:00:00Z',
    domain: 'techstart',
    settings: {
      timezone: 'America/Los_Angeles',
      date_format: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primary_color: '#8b5cf6',
      secondary_color: '#6c757d',
      accent_color: '#a78bfa',
      theme_mode: 'light',
    },
  },
  {
    id: 3,
    name: 'Global Industries',
    slug: 'global-industries',
    plan: 'basic',
    created_at: '2024-06-10T09:00:00Z',
    user_count: 15,
    is_active: true,
    subscription_end_date: '2024-12-10T00:00:00Z',
    domain: 'global-industries',
    settings: {
      timezone: 'Europe/London',
      date_format: 'DD/MM/YYYY',
      currency: 'GBP',
    },
    branding: {
      primary_color: '#28a745',
      secondary_color: '#6c757d',
      accent_color: '#5cb85c',
      theme_mode: 'light',
    },
  },
  {
    id: 4,
    name: 'StartupHub',
    slug: 'startuphub',
    plan: 'free',
    created_at: '2024-08-05T11:00:00Z',
    user_count: 5,
    is_active: false,
    domain: 'startuphub',
    settings: {
      timezone: 'America/New_York',
      date_format: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primary_color: '#007bff',
      secondary_color: '#6c757d',
      accent_color: '#28a745',
      theme_mode: 'light',
    },
  },
];

const mockPlatformUsers: PlatformUser[] = [
  {
    id: 1,
    name: 'Super Admin User',
    email: 'admin@platform.com',
    created_at: '2024-01-01T00:00:00Z',
    is_super_admin: true,
  },
  {
    id: 2,
    name: 'John Smith',
    email: 'john@acme-corp.com',
    created_at: '2024-01-15T10:00:00Z',
    is_super_admin: false,
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    email: 'sarah@techstart.com',
    created_at: '2024-03-20T14:00:00Z',
    is_super_admin: false,
  },
  {
    id: 4,
    name: 'Mike Davis',
    email: 'mike@global.com',
    created_at: '2024-06-10T09:00:00Z',
    is_super_admin: false,
  },
];

const mockUserCompanyAssignments: UserCompanyRole[] = [
  { company_id: 1, user_id: 2, role: 'admin', joined_at: '2024-01-15T10:00:00Z' },
  { company_id: 2, user_id: 3, role: 'admin', joined_at: '2024-03-20T14:00:00Z' },
  { company_id: 3, user_id: 4, role: 'admin', joined_at: '2024-06-10T09:00:00Z' },
  { company_id: 1, user_id: 3, role: 'manager', joined_at: '2024-03-25T11:00:00Z' },
  { company_id: 2, user_id: 2, role: 'employee', joined_at: '2024-04-01T08:00:00Z' },
];

export function SuperAdminProvider({ children }: SuperAdminProviderProps) {
  const [allCompanies, setAllCompanies] = useState<CompanyWithStats[]>([]);
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);
  const [userCompanyAssignments, setUserCompanyAssignments] = useState<UserCompanyRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setAllCompanies(mockPlatformCompanies);
      setAllUsers(mockPlatformUsers);
      setUserCompanyAssignments(mockUserCompanyAssignments);
      setIsLoading(false);
    }, 500);
  };

  const createCompany = async (company: Partial<Company>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCompany: CompanyWithStats = {
      id: Math.max(...allCompanies.map(c => c.id)) + 1,
      name: company.name || '',
      slug: company.slug || '',
      plan: company.plan || 'free',
      created_at: new Date().toISOString(),
      user_count: 0,
      is_active: true,
      domain: company.domain,
      custom_domain: company.custom_domain,
      settings: company.settings || {
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        currency: 'USD',
      },
      branding: company.branding || {
        primary_color: '#007bff',
        secondary_color: '#6c757d',
        accent_color: '#28a745',
        theme_mode: 'light',
      },
    };
    
    setAllCompanies([...allCompanies, newCompany]);
  };

  const updateCompany = async (id: number, updates: Partial<Company>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAllCompanies(allCompanies.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const deleteCompany = async (id: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAllCompanies(allCompanies.filter(c => c.id !== id));
    setUserCompanyAssignments(userCompanyAssignments.filter(a => a.company_id !== id));
  };

  const toggleCompanyStatus = async (id: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAllCompanies(allCompanies.map(c => 
      c.id === id ? { ...c, is_active: !c.is_active } : c
    ));
  };

  const createUser = async (user: Partial<PlatformUser>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: PlatformUser = {
      id: Math.max(...allUsers.map(u => u.id)) + 1,
      name: user.name || '',
      email: user.email || '',
      created_at: new Date().toISOString(),
      is_super_admin: user.is_super_admin || false,
    };
    
    setAllUsers([...allUsers, newUser]);
  };

  const updateUser = async (id: number, updates: Partial<PlatformUser>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAllUsers(allUsers.map(u => 
      u.id === id ? { ...u, ...updates } : u
    ));
  };

  const deleteUser = async (id: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAllUsers(allUsers.filter(u => u.id !== id));
    setUserCompanyAssignments(userCompanyAssignments.filter(a => a.user_id !== id));
  };

  const assignUserToCompany = async (userId: number, companyId: number, role: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const assignment: UserCompanyRole = {
      company_id: companyId,
      user_id: userId,
      role: role as 'employee' | 'manager' | 'hr' | 'admin',
      joined_at: new Date().toISOString(),
    };
    
    setUserCompanyAssignments([...userCompanyAssignments, assignment]);
    
    // Update company user count
    setAllCompanies(allCompanies.map(c => 
      c.id === companyId 
        ? { ...c, user_count: c.user_count + 1 } 
        : c
    ));
  };

  const removeUserFromCompany = async (userId: number, companyId: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUserCompanyAssignments(
      userCompanyAssignments.filter(
        a => !(a.user_id === userId && a.company_id === companyId)
      )
    );
    
    // Update company user count
    setAllCompanies(allCompanies.map(c => 
      c.id === companyId 
        ? { ...c, user_count: Math.max(0, c.user_count - 1) } 
        : c
    ));
  };

  const refreshData = async () => {
    await loadPlatformData();
  };

  return (
    <SuperAdminContext.Provider
      value={{
        allCompanies,
        allUsers,
        userCompanyAssignments,
        createCompany,
        updateCompany,
        deleteCompany,
        toggleCompanyStatus,
        createUser,
        updateUser,
        deleteUser,
        assignUserToCompany,
        removeUserFromCompany,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
}