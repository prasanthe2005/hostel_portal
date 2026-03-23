const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// Keep local development working if env vars are not provided.
export const API_BASE_URL = rawApiBaseUrl || 'http://localhost:5000/api';
export const BACKEND_ORIGIN = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;
