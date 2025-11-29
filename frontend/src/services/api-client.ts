/**
 * API Client with Multi-tenant Support
 * 
 * This module provides a centralized API client that automatically includes
 * the current company context in all API requests.
 */

let currentCompanyId: string | null = null;
let apiBaseUrl: string = 'http://localhost:4000/api/v1';
let accessToken: string | null = null;
// api-client.ts - Add this function to debug the current company
export function debugCompanyInfo() {
  const currentCompanyId = getCurrentCompanyId();
  const user = localStorage.getItem('user');
  const companies = localStorage.getItem('user_companies');
  
  console.log('=== Company Debug Info ===');
  console.log('Current Company ID:', currentCompanyId);
  console.log('User:', user ? JSON.parse(user) : 'No user');
  console.log('Companies:', companies ? JSON.parse(companies) : 'No companies');
  console.log('==========================');
}
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Company management
export function setCurrentCompany(companyId: string | null) {
  currentCompanyId = companyId;
}

export function getCurrentCompanyId(): string | null {
  return currentCompanyId;
}

// API URL management
export function setApiBaseUrl(url: string) {
  apiBaseUrl = url;
  localStorage.setItem('api_base_url', url);
}

export function getApiBaseUrl(): string {
  if (!apiBaseUrl) {
    apiBaseUrl = localStorage.getItem('api_base_url') || 'http://localhost:4000/api/v1';
  }
  return apiBaseUrl;
}

// Token management
export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getAccessToken(): string | null {
  if (!accessToken) {
    accessToken = localStorage.getItem('access_token');
  }
  return accessToken;
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

/**
 * Makes an API request with automatic company context injection
 */
// api-client.ts - Remove auto-injection for profile endpoints
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = `${getApiBaseUrl()}${endpoint}`;
  
  // Add query params if provided
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
  }

  // REMOVED: Auto-inject company_id - backend should use authenticated user's company
  // For profile endpoints, we don't need to send company_id

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header
  const token = getAccessToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.message || `HTTP error! status: ${response.status}`, response.status, errorData);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}
// api-client.ts - Update the getCompanyUuid function
async function getCompanyUuid(companyIdentifier: string): Promise<string | null> {
  try {
    // If it's already a UUID, return it
    if (isValidUuid(companyIdentifier)) {
      return companyIdentifier;
    }
    
    // If it's a numeric ID, look up the actual UUID from user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      
      // Check if user has companyId (UUID)
      if (user.companyId && isValidUuid(user.companyId)) {
        console.log('Using user.companyId UUID:', user.companyId);
        return user.companyId;
      }
      
      // Check if user has company object with UUID
      if (user.company && user.company.id && isValidUuid(user.company.id)) {
        console.log('Using user.company.id UUID:', user.company.id);
        return user.company.id;
      }
    }
    
    // Check user_companies array
    const companies = JSON.parse(localStorage.getItem('user_companies') || '[]');
    const company = companies.find((c: any) => 
      c.id === companyIdentifier || 
      c.numericId === companyIdentifier ||
      c.companyId === companyIdentifier
    );
    
    if (company) {
      const uuid = company.id || company.uuid || company.companyId;
      if (uuid && isValidUuid(uuid)) {
        console.log('Found company UUID from user_companies:', uuid);
        return uuid;
      }
    }
    
    console.warn('Could not find valid UUID for company identifier:', companyIdentifier);
    return null;
  } catch (error) {
    console.error('Error getting company UUID:', error);
    return null;
  }
}

function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
// Convenience methods
export const api = {
  get<T>(endpoint: string, params?: Record<string, any>) {
    return apiRequest<T>(endpoint, { method: 'GET', params });
  },

  post<T>(endpoint: string, data?: any, params?: Record<string, any>) {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  },

  put<T>(endpoint: string, data?: any, params?: Record<string, any>) {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  },

  patch<T>(endpoint: string, data?: any, params?: Record<string, any>) {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      params,
    });
  },

  delete<T>(endpoint: string, params?: Record<string, any>) {
    return apiRequest<T>(endpoint, { method: 'DELETE', params });
  },
};

/**
 * Initialize API client from localStorage
 */
export function initializeApiClient() {
  const token = localStorage.getItem('access_token');
  const baseUrl = localStorage.getItem('api_base_url');
  
  if (token) {
    setAccessToken(token);
  }
  if (baseUrl) {
    setApiBaseUrl(baseUrl);
  }
}

/**
 * Hook-style API client (for use with company context)
 */
export function createScopedApi(companyId: string) {
  return {
    get<T>(endpoint: string, params?: Record<string, any>) {
      return apiRequest<T>(endpoint, { 
        method: 'GET', 
        params: { ...params, company_id: companyId } 
      });
    },

    post<T>(endpoint: string, data?: any, params?: Record<string, any>) {
      return apiRequest<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        params: { ...params, company_id: companyId },
      });
    },

    put<T>(endpoint: string, data?: any, params?: Record<string, any>) {
      return apiRequest<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        params: { ...params, company_id: companyId },
      });
    },

    patch<T>(endpoint: string, data?: any, params?: Record<string, any>) {
      return apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        params: { ...params, company_id: companyId },
      });
    },

    delete<T>(endpoint: string, params?: Record<string, any>) {
      return apiRequest<T>(endpoint, { 
        method: 'DELETE', 
        params: { ...params, company_id: companyId } 
      });
    },
  };
}

