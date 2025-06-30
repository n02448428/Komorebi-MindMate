/**
 * Storage utilities for localStorage operations
 */

// Storage keys
export const STORAGE_KEYS = {
  INSIGHT_CARDS: 'insight-cards',
  CHAT_SESSIONS: 'komorebi-chat-sessions',
  SESSION_LIMITS: 'session-limits',
  SESSION_START_TIME: 'session-start-time',
  CURRENT_SESSION_MESSAGES: 'current-session-messages',
  CURRENT_SCENE: 'current-scene',
  VIDEO_ENABLED: 'video-background-enabled',
  USER_DATA: 'komorebi-user'
};

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all app-related data from localStorage
 */
export function clearAllStorageData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
}

/**
 * Get all app data for export
 */
export function exportAllData() {
  const data: Record<string, any> = {};
  
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        data[name] = JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Error exporting data for key "${key}":`, error);
    }
  });
  
  return data;
}

/**
 * Import data from export
 */
export function importData(data: Record<string, any>): void {
  Object.entries(data).forEach(([name, value]) => {
    const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
    if (key) {
      setStorageItem(key, value);
    }
  });
}