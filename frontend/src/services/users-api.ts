import { api } from './api-client';

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

/**
 * Fetch users with optional filters
 * GET /users
 */
export async function fetchUsers(filters: UserFilters = {}) {
  const params: Record<string, any> = {};
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.search) params.search = filters.search;
  if (filters.role) params.role = filters.role;
  if (filters.isActive !== undefined) params.isActive = String(filters.isActive);
  return api.get('/users', params);
}

/**
 * Get a single user
 * GET /users/:id
 */
export async function getUserById(userId: string) {
  return api.get(`/users/${userId}`);
}

/**
 * Assign a role to a user (via roles or user-role endpoints)
 * POST /roles/:roleId/users  or POST /users/:id/roles depending on backend
 */
export async function assignRoleToUser(roleId: string, userId: string) {
  // Role routes in backend expect POST /roles/:id/users { userId }
  return api.post(`/roles/${roleId}/users`, { userId });
}

/**
 * Remove a role from a user
 * DELETE /roles/:roleId/users/:userId
 */
export async function removeRoleFromUser(roleId: string, userId: string) {
  return api.delete(`/roles/${roleId}/users/${userId}`);
}

/**
 * Create user helper (used by admin UI)
 * POST /users
 */
export async function createUser(payload: any) {
  return api.post('/users', payload);
}

/**
 * Update user
 * PUT /users/:id
 */
export async function updateUser(userId: string, payload: any) {
  return api.put(`/users/${userId}`, payload);
}

/**
 * Reset user password (admin)
 * POST /users/:id/reset-password
 */
export async function resetUserPassword(userId: string, newPassword: string, sendEmail = false) {
  return api.post(`/users/${userId}/reset-password`, { newPassword, sendEmail });
}