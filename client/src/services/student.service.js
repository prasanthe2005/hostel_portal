import api from './api.js';

export const studentService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res && res.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  getProfile: async () => {
    const res = await api.get('/student/dashboard');
    return res;
  },

  submitRoomRequest: async (data) => {
    const res = await api.post('/student/request', data);
    return res;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userData');
    return { success: true };
  }
};

export default studentService;