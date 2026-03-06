// Complaint Management APIs

export const complaintService = {
  // Submit a new complaint
  submitComplaint: async (complaintData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/complaints/submit', {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/complaints/my-complaints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/complaints', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${complaintId}/status`, {
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/complaints/${complaintId}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm resolution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error confirming resolution:', error);
      throw error;
    }
  }
};
