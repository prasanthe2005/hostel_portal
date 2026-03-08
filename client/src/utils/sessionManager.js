/**
 * Session Manager - Ensures data is only loaded once per login session
 * 
 * Data synchronization logic:
 * - Data is fetched only once during login/session start
 * - Subsequent attempts to fetch data return cached data or show error
 * - Updated data is only loaded after logout and re-login
 * - Works for all user roles: Admin, Student, Caretaker
 */

const SESSION_KEY = 'app_session_id';
const SESSION_DATA_PREFIX = 'session_data_';
const SESSION_TIMESTAMP_PREFIX = 'session_timestamp_';

// Generate unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get current session ID
export const getCurrentSessionId = () => {
  return sessionStorage.getItem(SESSION_KEY);
};

// Initialize new session (called on login)
export const initializeSession = () => {
  const sessionId = generateSessionId();
  sessionStorage.setItem(SESSION_KEY, sessionId);
  console.log('✅ New session initialized:', sessionId);
  return sessionId;
};

// Check if session exists
export const hasActiveSession = () => {
  return !!sessionStorage.getItem(SESSION_KEY);
};

// Store data for current session
export const storeSessionData = (key, data) => {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    console.warn('⚠️ No active session found');
    return false;
  }
  
  const storageKey = `${SESSION_DATA_PREFIX}${key}`;
  const timestampKey = `${SESSION_TIMESTAMP_PREFIX}${key}`;
  
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(data));
    sessionStorage.setItem(timestampKey, new Date().toISOString());
    console.log(`✅ Session data stored for key: ${key}`);
    return true;
  } catch (error) {
    console.error('Error storing session data:', error);
    return false;
  }
};

// Get data from current session
export const getSessionData = (key) => {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return null;
  }
  
  const storageKey = `${SESSION_DATA_PREFIX}${key}`;
  const data = sessionStorage.getItem(storageKey);
  
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }
  
  return null;
};

// Check if data exists for a key in current session
export const hasSessionData = (key) => {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return false;
  }
  
  const storageKey = `${SESSION_DATA_PREFIX}${key}`;
  return sessionStorage.getItem(storageKey) !== null;
};

// Get timestamp of when data was stored
export const getSessionDataTimestamp = (key) => {
  const timestampKey = `${SESSION_TIMESTAMP_PREFIX}${key}`;
  return sessionStorage.getItem(timestampKey);
};

// Clear current session (called on logout)
export const clearSession = () => {
  const sessionId = getCurrentSessionId();
  console.log('🔄 Clearing session:', sessionId);
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log('✅ Session cleared');
};

// Clear specific session data key
export const clearSessionData = (key) => {
  const storageKey = `${SESSION_DATA_PREFIX}${key}`;
  const timestampKey = `${SESSION_TIMESTAMP_PREFIX}${key}`;
  
  sessionStorage.removeItem(storageKey);
  sessionStorage.removeItem(timestampKey);
  
  console.log(`✅ Session data cleared for key: ${key}`);
};

export default {
  initializeSession,
  getCurrentSessionId,
  hasActiveSession,
  storeSessionData,
  getSessionData,
  hasSessionData,
  getSessionDataTimestamp,
  clearSession,
  clearSessionData
};
