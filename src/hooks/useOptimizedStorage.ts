/**
 * Custom hook for optimized storage operations
 * Performance: Debounced writes, cached reads, reduced re-renders
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storageUtils';

/**
 * Optimized storage hook with debouncing and caching
 */
export const useOptimizedStorage = <T>(
  key: string,
  defaultValue: T,
  debounceMs: number = 300
) => {
  const [value, setValue] = useState<T>(() => getStorageItem(key, defaultValue));
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Debounced storage update
  const updateStorage = useCallback((newValue: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setStorageItem(key, newValue);
    }, debounceMs);
  }, [key, debounceMs]);
  
  // Optimized setter that batches updates
  const setOptimizedValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prevValue => {
      const resolvedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(prevValue)
        : newValue;
      
      updateStorage(resolvedValue);
      return resolvedValue;
    });
  }, [updateStorage]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [value, setOptimizedValue] as const;
};

/**
 * Hook for managing arrays in storage (insights, sessions)
 */
export const useStorageArray = <T extends { id: string }>(
  key: string,
  maxItems: number = 100
) => {
  const [items, setItems] = useOptimizedStorage<T[]>(key, []);
  
  const addItem = useCallback((item: T) => {
    setItems(prev => {
      const updated = [item, ...prev.filter(existing => existing.id !== item.id)];
      // Maintain maximum items to prevent localStorage bloat
      return updated.slice(0, maxItems);
    });
  }, [setItems, maxItems]);
  
  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, [setItems]);
  
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, [setItems]);
  
  const clearItems = useCallback(() => {
    setItems([]);
  }, [setItems]);
  
  return {
    items,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    count: items.length
  };
};