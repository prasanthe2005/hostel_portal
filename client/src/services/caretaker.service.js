// Caretaker Management APIs

export const caretakerService = {
  // Caretaker login
  login: async (email, password) => {
    try {
      console.log('\n=== CARETAKER LOGIN (CLIENT) ===');
      console.log('Email:', email);
      console.log('Password length:', password?.length);
      console.log('Sending POST to: http://localhost:5000/api/caretaker/login');
      
      const response = await fetch('http://localhost:5000/api/caretaker/login', {
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
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', 'caretaker');
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      console.log('✅ Data saved to localStorage');
      return data;
    } catch (error) {
      console.error('❌ Error during caretaker login:', error.message);
      throw error;
    }
  },

  // Get caretaker dashboard
  getDashboard: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Getting dashboard with token:', token?.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:5000/api/caretaker/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Dashboard response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dashboard error response:', errorData);
        throw new Error(errorData.error || `Failed to fetch dashboard (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching caretaker dashboard:', error);
      throw error;
    }
  },

  // Get hostel complaints
  getComplaints: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/caretaker/complaints', {
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
      console.error('Error fetching hostel complaints:', error);
      throw error;
    }
  },

  // Update complaint status
  updateComplaintStatus: async (complaintId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/caretaker/complaints/${complaintId}/status`, {
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
  }
};
