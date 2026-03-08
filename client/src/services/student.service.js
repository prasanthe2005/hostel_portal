import api from './api.js';
import tabSession from '../utils/tabSession.js';
import { 
  initializeSession, 
  clearSession 
} from '../utils/sessionManager.js';

export const studentService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res && res.token) {
      tabSession.setAuth(res.token, res.user?.role || 'student', res.user?.name || 'Student', res.user || {});
      // Initialize new session on login
      initializeSession();
      console.log('✅ Student session initialized in tab', tabSession.getTabId());
    }
    return res;
  },

  getProfile: async () => {
    // Don't cache profile - students need to see their own updates
    try {
      console.log('🔄 Fetching student profile from API');
      const res = await api.get('/student/dashboard');
      return res;
    } catch (error) {
      console.error('❌ Failed to load student profile:', error);
      throw error;
    }
  },

  submitRoomRequest: async (data) => {
    const res = await api.post('/student/request', data);
    return res;
  },

  logout: async () => {
    // Clear session data on logout
    clearSession();
    tabSession.clearAuth();
    console.log('✅ Student logged out from tab', tabSession.getTabId());
    return { success: true };
  }
};

export default studentService;