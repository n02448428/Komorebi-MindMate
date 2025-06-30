/**
 * Performance utilities and monitoring
 */

// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();
  
  static startMeasurement(name: string): void {
    this.measurements.set(name, performance.now());
  }
  
  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No start measurement found for: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    if (import.meta.env.DEV) {
      console.log(`🎯 Performance: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name);
    return fn().finally(() => {
      this.endMeasurement(name);
    });
  }
  
  static measure<T>(name: string, fn: () => T): T {
    this.startMeasurement(name);
    try {
      return fn();
    } finally {
      this.endMeasurement(name);
    }
  }
}

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle utility for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring (development only)
export const memoryMonitor = {
  logUsage: () => {
    if (import.meta.env.DEV && 'memory' in performance) {
      const memory = (performance as any).memory;
      console.log('📊 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  },
  
  startMonitoring: (intervalMs: number = 10000) => {
    if (import.meta.env.DEV) {
      const interval = setInterval(() => memoryMonitor.logUsage(), intervalMs);
      return () => clearInterval(interval);
    }
    return () => {};
  }
};