import { api } from './api-client';

export interface RolePayload {
  name: string;
  display_name: string;
  description?: string;
  permissions?: string[]; // permission ids/codes
  is_system?: boolean;
}

/**
 * Get roles list
 * GET /roles
 */
export async function fetchRoles(params: { page?: number; limit?: number; search?: string } = {}) {
  return api.get('/roles', params);
}

/**
 * Get role by id
 * GET /roles/:id
 */
export async function getRoleById(roleId: string) {
  return api.get(`/roles/${roleId}`);
}

/**
 * Create role
 * POST /roles
 */
export async function createRole(payload: RolePayload) {
  return api.post('/roles', payload);
}

/**
 * Update role
 * PUT /roles/:id
 */
export async function updateRole(roleId: string, payload: Partial<RolePayload>) {
  return api.put(`/roles/${roleId}`, payload);
}

/**
 * Delete role
 * DELETE /roles/:id
 */
export async function deleteRole(roleId: string) {
  return api.delete(`/roles/${roleId}`);
}

/**
 * Assign permissions to role
 * POST /roles/:id/permissions { permissionIds: [] }
 */
export async function assignPermissionsToRole(roleId: string, permissionIds: string[]) {
  return api.post(`/roles/${roleId}/permissions`, { permissionIds });
}

/**
 * Remove permission from role
 * DELETE /roles/:id/permissions/:permissionId
 */
export async function removePermissionFromRole(roleId: string, permissionId: string) {
  return api.delete(`/roles/${roleId}/permissions/${permissionId}`);
}