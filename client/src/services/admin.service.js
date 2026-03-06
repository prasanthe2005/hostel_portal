import api from './api.js';

const FALLBACK_STATS = {
  totalHostels: 0,
  totalStudents: 0,
  availableRooms: 0,
  occupiedRooms: 0,
  pendingRequests: 0
};

export const adminService = {
  // Login against backend. Stores token and user data in localStorage on success.
  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      // expected: { token, role, user }
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        // Get role from user object
        const role = res.user?.role || 'admin';
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(res.user || {}));
        console.log('Login successful:', { role, user: res.user });
      }
      return res;
    } catch (err) {
      console.error('Admin login failed:', err);
      throw err;
    }
  },

  getHostels: async () => {
    try {
      const res = await api.get('/admin/hostels');
      return res || [];
    } catch (err) {
      console.error('Error fetching hostels:', err);
      return [];
    }
  },

  getRooms: async () => {
    try {
      const res = await api.get('/admin/rooms');
      return res || [];
    } catch (err) {
      console.error('Error fetching rooms:', err);
      return [];
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
    try {
      const res = await api.get('/admin/students');
      return res || [];
    } catch (err) {
      console.error('Error fetching students from server:', err);
      return [];
    }
  },

  getRoomRequests: async () => {
    try {
      const res = await api.get('/admin/requests');
      return res || [];
    } catch (err) {
      console.error('Error fetching room requests:', err);
      return [];
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
      // Inform server to invalidate session, then clear local data
      try { await api.post('/auth/logout'); } catch (e) { /* ignore */ }
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
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