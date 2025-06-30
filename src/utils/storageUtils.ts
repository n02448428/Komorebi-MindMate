/**
 * Storage utilities for localStorage and sessionStorage operations
 */

// Storage keys
const STORAGE_KEYS = {
  INSIGHT_CARDS: 'insight-cards',
  CHAT_SESSIONS: 'komorebi-chat-sessions',
  SESSION_LIMITS: 'session-limits',
  SESSION_START_TIME: 'session-start-time',
  CURRENT_SESSION_MESSAGES: 'current-session-messages',
  CURRENT_SCENE: 'current-scene',
  VIDEO_ENABLED: 'video-background-enabled'
};

/**
 * Safely get item from localStorage
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
    }
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }
};

/**
 * Safely get item from sessionStorage
 */
export const getSessionStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`Error reading from sessionStorage key "${key}":`, error);
    }
    return defaultValue;
  }
};

/**
 * Safely set item in sessionStorage
 */
export const setSessionStorageItem = <T>(key: string, value: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error writing to sessionStorage key "${key}":`, error);
    }
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }
};

/**
 * Remove item from sessionStorage
 */
export const removeSessionStorageItem = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  }
};

/**
 * Clear all app-related data from localStorage
 */
export const clearAllStorageData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
};

/**
 * Clear all app-related data from sessionStorage
 */
export const clearAllSessionStorageData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeSessionStorageItem(key);
  });
};

/**
 * Migrate data from sessionStorage to localStorage
 * Used when a guest user creates an account
 */
export const migrateGuestData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      const sessionData = sessionStorage.getItem(key);
      if (sessionData !== null) {
        // For certain data types, we need to merge with existing localStorage data
        if (key === STORAGE_KEYS.INSIGHT_CARDS || key === STORAGE_KEYS.CHAT_SESSIONS) {
          const existingData = localStorage.getItem(key);
          if (existingData) {
            const sessionItems = JSON.parse(sessionData);
            const existingItems = JSON.parse(existingData);
            // Merge arrays, ensuring no duplicates for items with IDs
            if (Array.isArray(sessionItems) && Array.isArray(existingItems)) {
              // Extract IDs from existing items to check for duplicates
              const existingIds = new Set(existingItems.map((item: any) => item.id));
              // Filter session items to only include those not in existing items
              const newItems = sessionItems.filter((item: any) => !existingIds.has(item.id));
              // Combine existing and new items
              const mergedItems = [...existingItems, ...newItems];
              localStorage.setItem(key, JSON.stringify(mergedItems));
            } else {
              localStorage.setItem(key, sessionData);
            }
          } else {
            localStorage.setItem(key, sessionData);
          }
        } else {
          localStorage.setItem(key, sessionData);
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Error migrating data for key "${key}":`, error);
      }
    }
  });
};