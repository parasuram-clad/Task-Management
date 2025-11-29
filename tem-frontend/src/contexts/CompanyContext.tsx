import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Company {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  created_at: string;
  domain?: string;
  custom_domain?: string;
  settings?: {
    timezone: string;
    date_format: string;
    currency: string;
  };
  branding?: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    theme_mode: 'light' | 'dark' | 'auto';
    logo_url?: string;
    favicon_url?: string;
    company_name_display?: string;
  };
}

export interface UserCompanyRole {
  company_id: number;
  user_id: number;
  role: 'employee' | 'manager' | 'hr' | 'admin';
  joined_at: string;
}

interface CompanyContextType {
  currentCompany: Company | null;
  userCompanies: Company[];
  userRole: string | null;
  switchCompany: (companyId: number) => void;
  refreshCompanies: () => Promise<void>;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
}

interface CompanyProviderProps {
  children: ReactNode;
  userId: number;
}

// Mock companies for demonstration
const mockCompanies: Company[] = [
  {
    id: 1,
    name: 'Acme Corporation',
    slug: 'acme-corp',
    logo_url: undefined,
    plan: 'professional',
    created_at: '2024-01-15T10:00:00Z',
    domain: 'acme-corp',
    custom_domain: 'app.acmecorp.com',
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
      logo_url: 'https://example.com/acme-logo.png',
      favicon_url: 'https://example.com/acme-favicon.ico',
      company_name_display: 'Acme Corp',
    },
  },
  {
    id: 2,
    name: 'TechStart Inc',
    slug: 'techstart',
    logo_url: undefined,
    plan: 'enterprise',
    created_at: '2024-03-20T14:00:00Z',
    domain: 'techstart',
    settings: {
      timezone: 'America/Los_Angeles',
      date_format: 'MM/DD/YYYY',
      currency: 'USD',
    },
    branding: {
      primary_color: '#dc3545',
      secondary_color: '#6c757d',
      accent_color: '#ffc107',
      theme_mode: 'dark',
      logo_url: 'https://example.com/techstart-logo.png',
      favicon_url: 'https://example.com/techstart-favicon.ico',
      company_name_display: 'TechStart Inc',
    },
  },
  {
    id: 3,
    name: 'Global Industries',
    slug: 'global-industries',
    logo_url: undefined,
    plan: 'basic',
    created_at: '2024-06-10T09:00:00Z',
    domain: 'global-industries',
    settings: {
      timezone: 'Europe/London',
      date_format: 'DD/MM/YYYY',
      currency: 'GBP',
    },
    branding: {
      primary_color: '#007bff',
      secondary_color: '#6c757d',
      accent_color: '#28a745',
      theme_mode: 'auto',
      logo_url: 'https://example.com/global-logo.png',
      favicon_url: 'https://example.com/global-favicon.ico',
      company_name_display: 'Global Industries',
    },
  },
];

const mockUserRoles: Record<number, UserCompanyRole> = {
  1: { company_id: 1, user_id: 1, role: 'admin', joined_at: '2024-01-15T10:00:00Z' },
  2: { company_id: 2, user_id: 1, role: 'manager', joined_at: '2024-03-25T11:00:00Z' },
  3: { company_id: 3, user_id: 1, role: 'employee', joined_at: '2024-07-01T08:00:00Z' },
};

export function CompanyProvider({ children, userId }: CompanyProviderProps) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserCompanies();
  }, [userId]);

  const loadUserCompanies = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // In real implementation, fetch companies where user is a member
      setUserCompanies(mockCompanies);
      
      // Load last selected company from localStorage or default to first
      const lastCompanyId = localStorage.getItem('lastCompanyId');
      const companyToSelect = lastCompanyId
        ? mockCompanies.find(c => c.id === parseInt(lastCompanyId))
        : mockCompanies[0];
      
      if (companyToSelect) {
        setCurrentCompany(companyToSelect);
        setUserRole(mockUserRoles[companyToSelect.id]?.role || 'employee');
      }
      
      setIsLoading(false);
    }, 500);
  };

  const switchCompany = (companyId: number) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      setUserRole(mockUserRoles[companyId]?.role || 'employee');
      localStorage.setItem('lastCompanyId', companyId.toString());
      
      // In real implementation, this would trigger a full data refresh
      // for the new company context
      window.location.reload();
    }
  };

  const refreshCompanies = async () => {
    await loadUserCompanies();
  };

  return (
    <CompanyContext.Provider
      value={{
        currentCompany,
        userCompanies,
        userRole,
        switchCompany,
        refreshCompanies,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}