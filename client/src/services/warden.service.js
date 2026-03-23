import tabSession from '../utils/tabSession.js';
import { initializeSession, clearSession } from '../utils/sessionManager.js';
import { API_BASE_URL } from '../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/warden`;

export const wardenService = {
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Warden login failed');
    }

    const data = await response.json();
    tabSession.setAuth(data.token, 'warden', data.user.name, data.user);
    initializeSession();
    return data;
  },

  getDashboard: async () => {
    const token = tabSession.getToken();
    const response = await fetch(`${BASE_URL}/dashboard?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Failed to load dashboard (${response.status})`);
    }

    return response.json();
  },

  logout: async () => {
    clearSession();
    tabSession.clearAuth();
    return { success: true };
  }
};

export default wardenService;
