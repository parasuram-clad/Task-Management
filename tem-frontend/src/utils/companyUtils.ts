// utils/companyUtils.ts
import { setCurrentCompany, getCurrentCompanyId } from '../services/api-client';

export function fixCompanyIdFromUserData() {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      console.warn('No user data found in localStorage');
      return false;
    }
    
    const user = JSON.parse(userData);
    console.log('User data from localStorage:', user);
    
    // Check if user has companyId (UUID)
    if (user.companyId && isValidUuid(user.companyId)) {
      console.log('Setting current company from user.companyId:', user.companyId);
      setCurrentCompany(user.companyId);
      return true;
    }
    
    // Check current_company storage
    const currentCompany = localStorage.getItem('current_company');
    if (currentCompany) {
      const company = JSON.parse(currentCompany);
      if (company.id && isValidUuid(company.id)) {
        console.log('Setting current company from current_company:', company.id);
        setCurrentCompany(company.id);
        return true;
      }
    }
    
    console.warn('No valid company UUID found in user data');
    return false;
  } catch (error) {
    console.error('Error fixing company ID:', error);
    return false;
  }
}

export function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function getCurrentCompanyUuid(): string | null {
  const currentCompanyId = getCurrentCompanyId();
  if (currentCompanyId && isValidUuid(currentCompanyId)) {
    return currentCompanyId;
  }
  
  // Try to get from user data
  return fixCompanyIdFromUserData() ? getCurrentCompanyId() : null;
}