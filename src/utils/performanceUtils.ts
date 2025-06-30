/**
 * Performance utilities and monitoring
 */

// Performance monitoring utilities
const measurements = new Map<string, number>();

export const PerformanceMonitor = {
  startMeasurement(name: string): void {
    measurements.set(name, performance.now());
  },
  
  endMeasurement(name: string): number {
    const startTime = measurements.get(name);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    measurements.delete(name);
    
    if (import.meta.env.DEV && duration > 100) { // Only log slow operations in dev
      console.log(`🎯 Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },
  
  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    PerformanceMonitor.startMeasurement(name);
    return fn().finally(() => {
      PerformanceMonitor.endMeasurement(name);
    });
  },
  
  measure<T>(name: string, fn: () => T): T {
    PerformanceMonitor.startMeasurement(name);
    try {
      return fn();
    } finally {
      PerformanceMonitor.endMeasurement(name);
    }
  }
};

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Optimized throttle utility for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}