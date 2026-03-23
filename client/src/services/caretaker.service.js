// Caretaker Management APIs
import tabSession from '../utils/tabSession.js';
import { API_BASE_URL } from '../config/apiConfig';
import { 
  initializeSession, 
  clearSession 
} from '../utils/sessionManager.js';

export const caretakerService = {
  // Caretaker login
  login: async (email, password) => {
    try {
      console.log('\n=== CARETAKER LOGIN (CLIENT) ===');
      console.log('Email:', email);
      console.log('Password length:', password?.length);
      console.log(`Sending POST to: ${API_BASE_URL}/caretaker/login`);
      
      const response = await fetch(`${API_BASE_URL}/caretaker/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Login failed with error:', error);
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Token received:', data.token ? 'YES (' + data.token.substring(0, 20) + '...)' : 'NO');
      console.log('User data:', data.user);
      
      // Store auth in tab session
      tabSession.setAuth(data.token, 'caretaker', data.user.name, data.user);
      
      // Initialize new session on login
      initializeSession();
      console.log('✅ Caretaker session initialized in tab', tabSession.getTabId());
      
      return data;
    } catch (error) {
      console.error('❌ Error during caretaker login:', error.message);
      throw error;
    }
  },

  // Get caretaker dashboard (no caching - complaints are dynamic)
  getDashboard: async () => {
    try {
      const token = tabSession.getToken();
      console.log('🔄 Fetching caretaker dashboard from API');
      
      const response = await fetch(`${API_BASE_URL}/caretaker/dashboard?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      console.log('Dashboard response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dashboard error response:', errorData);
        throw new Error(errorData.error || `Failed to fetch dashboard (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to load caretaker dashboard:', error);
      throw error;
    }
  },

  // Get hostel complaints (no caching - complaints are dynamic)
  getComplaints: async () => {
    try {
      const token = tabSession.getToken();
      console.log('🔄 Fetching complaints from API');
      
      const response = await fetch(`${API_BASE_URL}/caretaker/complaints?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to load complaints:', error);
      throw error;
    }
  },

  // Update complaint status
  updateComplaintStatus: async (complaintId, status) => {
    try {
      const token = tabSession.getToken();
      const response = await fetch(`${API_BASE_URL}/caretaker/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update complaint status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating complaint status:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    // Clear session data on logout
    clearSession();
    tabSession.clearAuth();
    console.log('✅ Caretaker logged out from tab', tabSession.getTabId());
    return { success: true };
  }
};
