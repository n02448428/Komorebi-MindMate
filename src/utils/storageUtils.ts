/**
 * Storage utilities for localStorage operations
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
 * Clear all app-related data from localStorage
 */
export const clearAllStorageData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
};

/**
 * Import data from export
 */
export const importData = (data: Record<string, any>): void => {
  // Only import keys that we recognize
  Object.keys(STORAGE_KEYS).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      setStorageItem(key, value);
    }
  });
};