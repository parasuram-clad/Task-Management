import { api } from './api-client';

export interface CompanyProfile {
  id?: string;
  name: string;
  country?: string;
  timezone?: string;
  workWeek?: string;
  standardDailyHours?: number;
}

/**
 * Get company by id
 * GET /companies/:id
 */
export async function getCompany(companyId: string) {
  return api.get(`/companies/${companyId}`);
}

/**
 * Update company profile
 * PUT /companies/:id
 */
export async function updateCompany(companyId: string, payload: Partial<CompanyProfile>) {
  return api.put(`/companies/${companyId}`, payload);
}

/**
 * Get company configuration
 * GET /companies/:id/configuration
 */
export async function getCompanyConfiguration(companyId: string) {
  return api.get(`/companies/${companyId}/configuration`);
}

/**
 * Update company configuration (used by CompanySettings)
 * PUT /companies/:id/configuration
 */
export async function updateCompanyConfiguration(companyId: string, payload: any) {
  return api.put(`/companies/${companyId}/configuration`, payload);
}

/**
 * Update branding (if separate endpoint exists)
 * PUT /companies/:id/configuration or /companies/:id/branding
 */
export async function updateBranding(companyId: string, brandingPayload: any) {
  // Many backends use /companies/:id/configuration to update branding
  return api.put(`/companies/${companyId}/configuration`, { branding: brandingPayload });
}