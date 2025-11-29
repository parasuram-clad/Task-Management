import { api } from './api-client';

export interface Permission {
  id: string;
  module: string;
  action: string;
  description?: string;
  code?: string;
}

/**
 * Get all permissions (paginated)
 * GET /permissions
 */
export async function fetchPermissions(params: { page?: number; limit?: number; search?: string } = {}) {
  return api.get('/permissions', params);
}

/**
 * Get permissions grouped by module (convenience)
 * GET /permissions/by-module?module=...
 */
export async function fetchPermissionsByModule(module?: string) {
  if (module) {
    return api.get('/permissions/by-module', { module });
  }
  // Fallback: fetch all and group on client
  const res = await fetchPermissions({ limit: 1000 });
  return res;
}

/**
 * Seed default permissions (super-admin)
 * POST /permissions/seed
 */
export async function seedDefaultPermissions() {
  return api.post('/permissions/seed');
}