/**
 * Optimized localStorage utilities with caching and error handling
 * Performance: Reduces localStorage access, implements caching layer
 */

// In-memory cache to reduce localStorage reads
const storageCache = new Map<string, any>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Optimized localStorage getter with caching
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  // Check cache first
  if (storageCache.has(key)) {
    const timestamp = cacheTimestamps.get(key) || 0;
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return storageCache.get(key);
    }
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    
    const parsed = JSON.parse(item);
    
    // Update cache
    storageCache.set(key, parsed);
    cacheTimestamps.set(key, Date.now());
    
    return parsed;
  } catch (error) {
    console.warn(`Failed to parse localStorage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Optimized localStorage setter with caching
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    
    // Update cache
    storageCache.set(key, value);
    cacheTimestamps.set(key, Date.now());
  } catch (error) {
    console.warn(`Failed to set localStorage item ${key}:`, error);
  }
};

/**
 * Remove item from storage and cache
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
    storageCache.delete(key);
    cacheTimestamps.delete(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage item ${key}:`, error);
  }
};

/**
 * Clear specific cache entries
 */
export const clearStorageCache = (keys?: string[]): void => {
  if (keys) {
    keys.forEach(key => {
      storageCache.delete(key);
      cacheTimestamps.delete(key);
    });
  } else {
    storageCache.clear();
    cacheTimestamps.clear();
  }
};

/**
 * Batch storage operations for better performance
 */
export const batchStorageOperations = (operations: Array<{ key: string; value: any }>) => {
  try {
    operations.forEach(({ key, value }) => {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      storageCache.set(key, value);
      cacheTimestamps.set(key, Date.now());
    });
  } catch (error) {
    console.warn('Batch storage operation failed:', error);
  }
};

// Storage keys constants to prevent typos
export const STORAGE_KEYS = {
  USER: 'komorebi-user',
  INSIGHTS: 'insight-cards',
  CHAT_SESSIONS: 'komorebi-chat-sessions',
  SESSION_LIMITS: 'session-limits',
  SESSION_START_TIME: 'session-start-time',
  VIDEO_ENABLED: 'video-background-enabled',
  CURRENT_SCENE: 'current-scene'
} as const;