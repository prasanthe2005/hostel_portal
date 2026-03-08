import { useEffect, useRef, useState } from 'react';
import tabSession from '../utils/tabSession';

/**
 * Custom hook for auto-refresh functionality with cross-tab synchronization
 * Now includes tab isolation - only refreshes tabs of the same user role
 * 
 * @param {Function} fetchFunction - The function to call for refreshing data
 * @param {number} interval - Refresh interval in milliseconds (default: 30000 - 30 seconds)
 * @param {string} channelName - BroadcastChannel name for cross-tab communication
 * @returns {Object} - { refresh, isRefreshing, lastRefreshed, broadcastUpdate }
 */
export function useAutoRefresh(fetchFunction, interval = 30000, channelName = 'hostel-updates') {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const intervalRef = useRef(null);
  const channelRef = useRef(null);
  const isMountedRef = useRef(true);
  
  // Get current tab's user context
  const currentUserRole = tabSession.getUserRole();
  const currentTabId = tabSession.getTabId();

  // Manual refresh function
  const refresh = async (source = 'manual') => {
    if (!isMountedRef.current || isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await fetchFunction();
      const now = new Date();
      setLastRefreshed(now);
      
      // Broadcast refresh event to other tabs (same role only)
      if (channelRef.current && source === 'manual') {
        channelRef.current.postMessage({
          type: 'refresh',
          timestamp: now.toISOString(),
          source: 'user-action',
          userRole: currentUserRole,
          tabId: currentTabId
        });
      }
    } catch (error) {
      console.error('Auto-refresh error:', error);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Create BroadcastChannel for cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel(channelName);
      
      // Listen for messages from other tabs
      channelRef.current.onmessage = (event) => {
        // Only refresh if the message is from the same user role (prevent cross-contamination)
        const messageRole = event.data.userRole;
        const messageTabId = event.data.tabId;
        const messageSource = event.data.source || 'unknown';
        
        console.log(`📩 Tab ${currentTabId} (${currentUserRole}): Received message`, {
          messageRole,
          messageTabId,
          messageSource,
          myRole: currentUserRole,
          myTabId: currentTabId,
          willProcess: messageRole === currentUserRole && messageTabId !== currentTabId
        });
        
        // Skip messages from different user roles or same tab
        if (messageRole !== currentUserRole || messageTabId === currentTabId) {
          console.log(`⏭️ Tab ${currentTabId}: Skipping message (role mismatch or same tab)`);
          return;
        }
        
        if (event.data.type === 'refresh' && isMountedRef.current) {
          console.log(`🔄 Tab ${currentTabId}: Received refresh signal from tab ${messageTabId} (same role: ${currentUserRole})`);
          refresh('cross-tab');
        }
        if (event.data.type === 'data-update' && isMountedRef.current) {
          console.log(`📡 Tab ${currentTabId}: Data updated from ${messageSource}, refreshing...`);
          refresh('cross-tab');
        }
      };
    }

    // Set up auto-refresh interval
    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          console.log(`⏰ Tab ${currentTabId} (${currentUserRole}): Auto-refresh triggered`);
          refresh('auto');
        }
      }, interval);
    }

    // Listen for storage events (cross-tab detection for localStorage changes)
    const handleStorageChange = (e) => {
      if (e.key === 'data-updated' && isMountedRef.current) {
        // Check if the update is from the same user role
        const updatedRole = localStorage.getItem('data-updated-role');
        const updatedTab = localStorage.getItem('data-updated-tab');
        
        if (updatedRole === currentUserRole && updatedTab !== currentTabId) {
          console.log(`💾 Tab ${currentTabId}: Storage event from tab ${updatedTab}, refreshing...`);
          refresh('storage-event');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (channelRef.current) {
        channelRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [interval, channelName]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    refresh,
    isRefreshing,
    lastRefreshed,
    broadcastUpdate: () => {
      // Utility function to notify other tabs of data changes (same role only)
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'data-update',
          timestamp: new Date().toISOString(),
          userRole: currentUserRole,
          tabId: currentTabId
        });
      }
      // Also use localStorage as fallback for older browsers
      localStorage.setItem('data-updated', Date.now().toString());
      localStorage.setItem('data-updated-role', currentUserRole);
      localStorage.setItem('data-updated-tab', currentTabId);
    }
  };
}

export default useAutoRefresh;
