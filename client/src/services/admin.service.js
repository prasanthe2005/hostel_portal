import api from './api.js';
import tabSession from '../utils/tabSession.js';
import { 
  initializeSession, 
  storeSessionData, 
  getSessionData, 
  hasSessionData,
  clearSession 
} from '../utils/sessionManager.js';

const FALLBACK_STATS = {
  totalHostels: 0,
  totalStudents: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  pendingRequests: 0
};

export const adminService = {
  // Login against backend. Stores token and user data in tab session on success.
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      // expected: { token, role, user }
      if (res && res.token) {
        const role = res.user?.role || 'admin';
        tabSession.setAuth(res.token, role, res.user?.name || 'Admin', res.user || {});
        // Initialize new session on login
        initializeSession();
        console.log('✅ Admin session initialized in tab', tabSession.getTabId(), ':', { role, user: res.user });
      }
      return res;
    } catch (err) {
      console.error('Admin login failed:', err);
      throw err;
    }
  },

  getHostels: async () => {
    const HOSTELS_KEY = 'admin_hostels';
    
    // Check if data already exists in current session
    if (hasSessionData(HOSTELS_KEY)) {
      console.log('📦 Returning cached hostels from session');
      return getSessionData(HOSTELS_KEY);
    }
    
    // First time in this session - fetch from API
    try {
      console.log('🔄 Fetching hostels from API (first load in session)');
      const res = await api.get('/admin/hostels');
      const hostels = res || [];
      
      // Store in session cache
      storeSessionData(HOSTELS_KEY, hostels);
      
      return hostels;
    } catch (err) {
      console.error('Error fetching hostels:', err);
      throw new Error('Failed to load hostels data. Please re-login to refresh your data.');
    }
  },

  getRooms: async () => {
    const ROOMS_KEY = 'admin_rooms';
    
    // Check if data already exists in current session
    if (hasSessionData(ROOMS_KEY)) {
      console.log('📦 Returning cached rooms from session');
      return getSessionData(ROOMS_KEY);
    }
    
    // First time in this session - fetch from API
    try {
      console.log('🔄 Fetching rooms from API (first load in session)');
      const res = await api.get('/admin/rooms');
      const rooms = res || [];
      
      // Store in session cache
      storeSessionData(ROOMS_KEY, rooms);
      
      return rooms;
    } catch (err) {
      console.error('Error fetching rooms:', err);
      throw new Error('Failed to load rooms data. Please re-login to refresh your data.');
    }
  },
  
  getPublicRooms: async () => {
    try {
      const res = await api.get('/rooms');
      return res || [];
    } catch (err) {
      console.error('Error fetching public rooms:', err);
      return [];
    }
  },

  getAllStudents: async () => {
    const STUDENTS_KEY = 'admin_students';
    
    // Check if data already exists in current session
    if (hasSessionData(STUDENTS_KEY)) {
      console.log('📦 Returning cached students from session');
      return getSessionData(STUDENTS_KEY);
    }
    
    // First time in this session - fetch from API
    try {
      console.log('🔄 Fetching students from API (first load in session)');
      const res = await api.get('/admin/students');
      const students = res || [];
      
      // Store in session cache
      storeSessionData(STUDENTS_KEY, students);
      
      return students;
    } catch (err) {
      console.error('Error fetching students from server:', err);
      throw new Error('Failed to load students data. Please re-login to refresh your data.');
    }
  },

  getRoomRequests: async () => {
    const REQUESTS_KEY = 'admin_requests';
    
    // Check if data already exists in current session
    if (hasSessionData(REQUESTS_KEY)) {
      console.log('📦 Returning cached room requests from session');
      return getSessionData(REQUESTS_KEY);
    }
    
    // First time in this session - fetch from API
    try {
      console.log('🔄 Fetching room requests from API (first load in session)');
      const res = await api.get('/admin/requests');
      const requests = res || [];
      
      // Store in session cache
      storeSessionData(REQUESTS_KEY, requests);
      
      return requests;
    } catch (err) {
      console.error('Error fetching room requests:', err);
      throw new Error('Failed to load room requests data. Please re-login to refresh your data.');
    }
  },

  createHostel: async (payload) => {
    try {
      const res = await api.post('/admin/hostels', payload);
      return res;
    } catch (err) {
      console.error('Error creating hostel:', err);
      throw err;
    }
  },

  updateHostel: async (hostelId, payload) => {
    try {
      const res = await api.put(`/admin/hostels/${hostelId}`, payload);
      return res;
    } catch (err) {
      console.error('Error updating hostel:', err);
      throw err;
    }
  },

  deleteHostel: async (hostelId) => {
    try {
      const res = await api.delete(`/admin/hostels/${hostelId}`);
      return res;
    } catch (err) {
      console.error('Error deleting hostel:', err);
      throw err;
    }
  },

  createRoom: async (payload) => {
    try {
      const res = await api.post('/admin/rooms', payload);
      return res;
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  },

  updateRoom: async (roomId, payload) => {
    try {
      const res = await api.put(`/admin/rooms/${roomId}`, payload);
      return res;
    } catch (err) {
      console.error('Error updating room:', err);
      throw err;
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const res = await api.delete(`/admin/rooms/${roomId}`);
      return res;
    } catch (err) {
      console.error('Error deleting room:', err);
      throw err;
    }
  },

  allocateRooms: async () => {
    try {
      const res = await api.post('/admin/allocate');
      return res;
    } catch (err) {
      console.error('Error allocating rooms:', err);
      throw err;
    }
  },

  allocateRoomToStudent: async (studentId, roomId) => {
    try {
      const res = await api.post('/admin/allocate-student', { studentId, roomId });
      return res;
    } catch (err) {
      console.error('Error allocating room to student:', err);
      throw err;
    }
  },

  deallocateRoom: async (studentId) => {
    try {
      const res = await api.post('/admin/deallocate', { studentId });
      return res;
    } catch (err) {
      console.error('Error deallocating room:', err);
      throw err;
    }
  },

  approveRoomRequest: async (requestId, adminComment, roomId) => {
    try {
      const res = await api.post(`/admin/requests/${requestId}`, { 
        action: 'approve', 
        admin_comment: adminComment,
        approved_room_id: roomId 
      });
      return res;
    } catch (err) {
      console.error('Error approving request:', err);
      throw err;
    }
  },

  rejectRoomRequest: async (requestId, adminComment) => {
    try {
      const res = await api.post(`/admin/requests/${requestId}`, { 
        action: 'reject', 
        admin_comment: adminComment 
      });
      return res;
    } catch (err) {
      console.error('Error rejecting request:', err);
      throw err;
    }
  },

  // Logout locally
  logout: async () => {
    try {
      // Clear session data on logout
      clearSession();
      tabSession.clearAuth();
      
      // Inform server to invalidate session
      try { await api.post('/auth/logout'); } catch (e) { /* ignore */ }
      console.log('✅ Admin logged out from tab', tabSession.getTabId());
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Caretaker management
  getCaretakers: async () => {
    try {
      const res = await api.get('/admin/caretakers');
      return res || [];
    } catch (err) {
      console.error('Error fetching caretakers:', err);
      throw err;
    }
  },

  createCaretaker: async (data) => {
    try {
      const res = await api.post('/admin/caretakers', data);
      return res;
    } catch (err) {
      console.error('Error creating caretaker:', err);
      throw err;
    }
  },

  updateCaretaker: async (id, data) => {
    try {
      const res = await api.put(`/admin/caretakers/${id}`, data);
      return res;
    } catch (err) {
      console.error('Error updating caretaker:', err);
      throw err;
    }
  },

  deleteCaretaker: async (id) => {
    try {
      const res = await api.delete(`/admin/caretakers/${id}`);
      return res;
    } catch (err) {
      console.error('Error deleting caretaker:', err);
      throw err;
    }
  },

  // Complaint management for admin
  getComplaintsStats: async () => {
    try {
      const res = await api.get('/admin/complaints/stats');
      return res || { total: 0, pending: 0, in_progress: 0, resolved: 0 };
    } catch (err) {
      console.error('Error fetching complaints stats:', err);
      return { total: 0, pending: 0, in_progress: 0, resolved: 0 };
    }
  }
};

export default adminService;