// Quick syntax check for admin.service.js changes
const testCode = `
  getHostels: async (forceRefresh = false) => {
    const HOSTELS_KEY = 'admin_hostels';
    
    // If force refresh, clear the cache first
    if (forceRefresh) {
      console.log('Force refreshing hostels...');
      storeSessionData(HOSTELS_KEY, null);
    }
    
    // Check if data already exists in current session
    if (!forceRefresh && hasSessionData(HOSTELS_KEY)) {
      console.log('Returning cached hostels from session');
      return getSessionData(HOSTELS_KEY);
    }
    
    // Fetch from API
    try {
      console.log('Fetching hostels from API');
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
`;

try {
  // Try to parse it
  eval(`const obj = {${testCode}};`);
  console.log('✅ Syntax is valid');
} catch (error) {
  console.error('❌ Syntax error:', error.message);
}
