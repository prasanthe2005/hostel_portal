// Complaint Management APIs
import tabSession from '../utils/tabSession';
import { API_BASE_URL } from '../config/apiConfig';

export const complaintService = {
  // Submit a new complaint
  submitComplaint: async (complaintData) => {
    try {
      const token = tabSession.getToken();
      const response = await fetch(`${API_BASE_URL}/complaints/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(complaintData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit complaint');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  },

  // Get student's complaints
  getMyComplaints: async () => {
    try {
      const token = tabSession.getToken();
      const response = await fetch(`${API_BASE_URL}/complaints/my-complaints?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },

  // Get all complaints (admin)
  getAllComplaints: async () => {
    try {
      const token = tabSession.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/complaints?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all complaints');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all complaints:', error);
      throw error;
    }
  },

  // Update complaint status (admin)
  updateComplaintStatus: async (complaintId, status) => {
    try {
      const token = tabSession.getToken();
      const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}/status`, {
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

  // Student confirms complaint resolution
  confirmResolution: async (complaintId) => {
    console.log('\n=== CLIENT: Confirm Resolution ===');
    console.log('Complaint ID:', complaintId);
    try {
      const token = tabSession.getToken();
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'null');
      
      const url = `${API_BASE_URL}/complaints/${complaintId}/confirm`;
      console.log('Request URL:', url);
      console.log('Request Method: PUT');
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Response Error:', error);
        throw new Error(error.error || 'Failed to confirm resolution');
      }

      const data = await response.json();
      console.log('✅ Response Data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error confirming resolution:', error);
      throw error;
    }
  },

  // Student rejects resolution and reopens complaint
  rejectResolution: async (complaintId) => {
    console.log('\n=== CLIENT: Reject Resolution ===');
    console.log('Complaint ID:', complaintId);
    try {
      const token = tabSession.getToken();
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'null');
      
      const url = `${API_BASE_URL}/complaints/${complaintId}/reject`;
      console.log('Request URL:', url);
      console.log('Request Method: PUT');
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response Status:', response.status, response.statusText);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Response Error:', error);
        throw new Error(error.error || 'Failed to reject resolution');
      }

      const data = await response.json();
      console.log('✅ Response Data:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error rejecting resolution:', error);
      throw error;
    }
  }
};
