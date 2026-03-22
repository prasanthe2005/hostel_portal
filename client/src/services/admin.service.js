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
  getValidCachedArray: (key) => {
    if (!hasSessionData(key)) return null;
    const cached = getSessionData(key);
    return Array.isArray(cached) ? cached : null;
  },

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

  getHostels: async (forceRefresh = false) => {
    const HOSTELS_KEY = 'admin_hostels';
    
    // If force refresh, clear the cache first
    if (forceRefresh) {
      console.log('🔄 Force refreshing hostels...');
      storeSessionData(HOSTELS_KEY, null);
    }
    
    // Check if data already exists in current session
    if (!forceRefresh) {
      const cachedHostels = adminService.getValidCachedArray(HOSTELS_KEY);
      if (cachedHostels) {
        console.log('📦 Returning cached hostels from session');
        return cachedHostels;
      }
    }
    
    // Fetch from API
    try {
      console.log('🔄 Fetching hostels from API');
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
    const cachedRooms = adminService.getValidCachedArray(ROOMS_KEY);
    if (cachedRooms) {
      console.log('📦 Returning cached rooms from session');
      return cachedRooms;
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
    const cachedStudents = adminService.getValidCachedArray(STUDENTS_KEY);
    if (cachedStudents) {
      console.log('📦 Returning cached students from session');
      return cachedStudents;
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

  getRoomRequests: async (forceRefresh = false) => {
    const REQUESTS_KEY = 'admin_requests';
    
    // If force refresh, clear the cache first
    if (forceRefresh) {
      console.log('🔄 Force refreshing room requests...');
      storeSessionData(REQUESTS_KEY, null);
    }
    
    // Check if data already exists in current session
    if (!forceRefresh) {
      const cachedRequests = adminService.getValidCachedArray(REQUESTS_KEY);
      if (cachedRequests) {
        console.log('📦 Returning cached room requests from session');
        return cachedRequests;
      }
    }
    
    // Fetch from API
    try {
      console.log('🔄 Fetching room requests from API');
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
      // Clear hostels cache so next fetch gets fresh data
      storeSessionData('admin_hostels', null);
      // Also clear rooms cache since new rooms were created
      storeSessionData('admin_rooms', null);
      console.log('🗑️ Cleared hostels and rooms cache after creation');
      return res;
    } catch (err) {
      console.error('Error creating hostel:', err);
      throw err;
    }
  },

  updateHostel: async (hostelId, payload) => {
    try {
      const res = await api.put(`/admin/hostels/${hostelId}`, payload);
      // Clear hostels cache so next fetch gets fresh data
      storeSessionData('admin_hostels', null);
      console.log('🗑️ Cleared hostels cache after update');
      return res;
    } catch (err) {
      console.error('Error updating hostel:', err);
      throw err;
    }
  },

  deleteHostel: async (hostelId) => {
    try {
      const res = await api.delete(`/admin/hostels/${hostelId}`);
      // Clear hostels cache so next fetch gets fresh data
      storeSessionData('admin_hostels', null);
      // Also clear rooms cache since rooms were deleted
      storeSessionData('admin_rooms', null);
      console.log('🗑️ Cleared hostels and rooms cache after deletion');
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
      // Clear room requests cache so next fetch gets fresh data
      storeSessionData('admin_requests', null);
      console.log('🗑️ Cleared room requests cache after approval');
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
      // Clear room requests cache so next fetch gets fresh data
      storeSessionData('admin_requests', null);
      console.log('🗑️ Cleared room requests cache after rejection');
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

  // Warden management
  getWardens: async () => {
    try {
      const res = await api.get('/admin/wardens');
      return res || [];
    } catch (err) {
      console.error('Error fetching wardens:', err);
      throw err;
    }
  },

  createWarden: async (data) => {
    try {
      return await api.post('/admin/wardens', data);
    } catch (err) {
      console.error('Error creating warden:', err);
      throw err;
    }
  },

  updateWarden: async (id, data) => {
    try {
      return await api.put(`/admin/wardens/${id}`, data);
    } catch (err) {
      console.error('Error updating warden:', err);
      throw err;
    }
  },

  deleteWarden: async (id) => {
    try {
      return await api.delete(`/admin/wardens/${id}`);
    } catch (err) {
      console.error('Error deleting warden:', err);
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