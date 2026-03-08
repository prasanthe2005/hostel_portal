/**
 * Tab Session Manager
 * Provides tab-isolated authentication storage to support multiple users in different tabs
 * 
 * Uses sessionStorage (tab-specific) for current tab's auth state
 * Uses localStorage (shared) only for cross-tab communication
 */

// Generate unique tab ID when the tab is first loaded
const TAB_ID = sessionStorage.getItem('tabId') || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
if (!sessionStorage.getItem('tabId')) {
  sessionStorage.setItem('tabId', TAB_ID);
}

export const tabSession = {
  // Get the unique tab ID
  getTabId: () => TAB_ID,

  // Set auth data for current tab (isolated from other tabs)
  setAuth: (token, userRole, userName, userData) => {
    // Store in sessionStorage (tab-specific)
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('userRole', userRole);
    sessionStorage.setItem('userName', userName);
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    // Also store tab-specific info in localStorage with tab ID for debugging
    const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
    tabs[TAB_ID] = {
      userRole,
      userName,
      lastActive: Date.now()
    };
    localStorage.setItem('activeTabs', JSON.stringify(tabs));
    
    console.log(`🔐 Tab ${TAB_ID}: Auth stored for ${userRole} - ${userName}`);
  },

  // Get auth data from current tab only
  getAuth: () => {
    return {
      token: sessionStorage.getItem('token'),
      userRole: sessionStorage.getItem('userRole'),
      userName: sessionStorage.getItem('userName'),
      userData: sessionStorage.getItem('userData') ? JSON.parse(sessionStorage.getItem('userData')) : null
    };
  },

  // Clear auth data for current tab
  clearAuth: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userData');
    
    // Remove from active tabs list
    const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
    delete tabs[TAB_ID];
    localStorage.setItem('activeTabs', JSON.stringify(tabs));
    
    console.log(`🔓 Tab ${TAB_ID}: Auth cleared`);
  },

  // Check if current tab is authenticated
  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  // Get token for current tab
  getToken: () => {
    return sessionStorage.getItem('token');
  },

  // Get user role for current tab
  getUserRole: () => {
    return sessionStorage.getItem('userRole');
  },

  // Get user name for current tab
  getUserName: () => {
    return sessionStorage.getItem('userName');
  },

  // Clean up inactive tabs from localStorage (optional maintenance)
  cleanupInactiveTabs: () => {
    const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
    const now = Date.now();
    const maxInactiveTime = 24 * 60 * 60 * 1000; // 24 hours
    
    let cleaned = false;
    Object.keys(tabs).forEach(tabId => {
      if (now - tabs[tabId].lastActive > maxInactiveTime) {
        delete tabs[tabId];
        cleaned = true;
      }
    });
    
    if (cleaned) {
      localStorage.setItem('activeTabs', JSON.stringify(tabs));
    }
  },

  // Get all active tabs info (for debugging)
  getActiveTabs: () => {
    return JSON.parse(localStorage.getItem('activeTabs') || '{}');
  }
};

// Clean up inactive tabs on load
tabSession.cleanupInactiveTabs();

// Update last active time periodically
setInterval(() => {
  const auth = tabSession.getAuth();
  if (auth.token) {
    const tabs = JSON.parse(localStorage.getItem('activeTabs') || '{}');
    if (tabs[TAB_ID]) {
      tabs[TAB_ID].lastActive = Date.now();
      localStorage.setItem('activeTabs', JSON.stringify(tabs));
    }
  }
}, 30000); // Update every 30 seconds

export default tabSession;
