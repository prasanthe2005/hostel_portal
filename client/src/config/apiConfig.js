const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const isProd = import.meta.env.PROD;

// Keep local development working without env vars.
// In production, do not silently fallback to localhost because Vercel cannot reach local-only backends.
export const API_BASE_URL = rawApiBaseUrl || (isProd ? '/api' : 'http://localhost:5000/api');
export const BACKEND_ORIGIN = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;
