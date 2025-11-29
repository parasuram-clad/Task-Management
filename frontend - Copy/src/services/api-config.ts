// API Configuration Service
const API_BASE_URL_KEY = 'api_base_url';
const ACCESS_TOKEN_KEY = 'access_token';

export const apiConfig = {
  getBaseUrl(): string {
    return localStorage.getItem(API_BASE_URL_KEY) || '';
  },

  setBaseUrl(url: string): void {
    // Remove trailing slash if present
    const cleanUrl = url.replace(/\/$/, '');
    localStorage.setItem(API_BASE_URL_KEY, cleanUrl);
  },

  hasBaseUrl(): boolean {
    return !!this.getBaseUrl();
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clearAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  clearAll(): void {
    localStorage.removeItem(API_BASE_URL_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};
