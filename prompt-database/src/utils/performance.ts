import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

declare global {
  function gtag(...args: any[]): void;
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  timestamp: number;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isProduction = import.meta.env.PROD;

  constructor() {
    if (this.isProduction) {
      this.initializeMetrics();
    }
  }

  private initializeMetrics() {
    // Core Web Vitals
    onCLS((metric) => this.recordMetric('CLS', metric.value, this.getCLSRating(metric.value)));
    onINP((metric) => this.recordMetric('INP', metric.value, this.getINPRating(metric.value)));
    onFCP((metric) => this.recordMetric('FCP', metric.value, this.getFCPRating(metric.value)));
    onLCP((metric) => this.recordMetric('LCP', metric.value, this.getLCPRating(metric.value)));
    onTTFB((metric) => this.recordMetric('TTFB', metric.value, this.getTTFBRating(metric.value)));
  }

  private recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const metric: PerformanceMetric = {
      name,
      value,
      rating,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);
    
    // Log in development
    if (!this.isProduction) {
      console.log(`📊 ${name}: ${value.toFixed(2)} (${rating})`);
    }

    // Send to analytics in production (would integrate with your analytics service)
    if (this.isProduction) {
      this.sendToAnalytics(metric);
    }
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getINPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 200) return 'good';
    if (value <= 500) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // In a real application, you would send this to your analytics service
    // Examples: Google Analytics, DataDog, New Relic, custom endpoint
    console.log('📈 Sending to analytics:', metric);
    
    // Example implementation for Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        metric_rating: metric.rating,
        custom_parameter: metric.timestamp,
      });
    }
  }

  // Manual performance timing
  public startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordCustomMetric(label, duration);
    };
  }

  private recordCustomMetric(name: string, duration: number) {
    const rating = this.getCustomMetricRating(name, duration);
    this.recordMetric(name, duration, rating);
  }

  private getCustomMetricRating(name: string, duration: number): 'good' | 'needs-improvement' | 'poor' {
    // Define custom thresholds based on the operation type
    const thresholds = {
      'search': { good: 200, poor: 500 },
      'sort': { good: 100, poor: 300 },
      'pagination': { good: 100, poor: 250 },
      'save': { good: 500, poor: 1000 },
      'load': { good: 1000, poor: 3000 },
      'default': { good: 300, poor: 1000 }
    };

    const threshold = thresholds[name as keyof typeof thresholds] || thresholds.default;
    
    if (duration <= threshold.good) return 'good';
    if (duration <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Get current metrics
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Generate performance report
  public generateReport(): PerformanceReport {
    return {
      metrics: this.getMetrics(),
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  // Clear metrics (useful for testing)
  public clearMetrics(): void {
    this.metrics = [];
  }

  // Memory usage monitoring
  public getMemoryUsage(): any {
    if ('memory' in performance) {
      return {
        used: Math.round((performance as any).memory.usedJSHeapSize / 1048576),
        total: Math.round((performance as any).memory.totalJSHeapSize / 1048576),
        limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1048576),
      };
    }
    return null;
  }

  // Bundle size analysis
  public analyzeBundleSize(): Promise<any> {
    return new Promise((resolve) => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        resolve({
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      } else {
        resolve(null);
      }
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for React components
export const usePerformanceTiming = (label: string) => {
  return performanceMonitor.startTiming(label);
};

// Hook for monitoring component render performance
export const useRenderTiming = (componentName: string) => {
  const timing = performanceMonitor.startTiming(`render-${componentName}`);
  
  // Return a function to call when rendering is complete
  return timing;
};

// Performance budget checker
export const checkPerformanceBudget = () => {
  const report = performanceMonitor.generateReport();
  const budget = {
    FCP: 1800, // First Contentful Paint
    LCP: 2500, // Largest Contentful Paint
    FID: 100,  // First Input Delay
    CLS: 0.1,  // Cumulative Layout Shift
    TTFB: 800, // Time to First Byte
  };

  const violations = report.metrics.filter(metric => {
    const limit = budget[metric.name as keyof typeof budget];
    return limit && metric.value > limit;
  });

  if (violations.length > 0) {
    console.warn('⚠️ Performance budget violations:', violations);
  }

  return {
    passed: violations.length === 0,
    violations,
    score: ((report.metrics.length - violations.length) / report.metrics.length) * 100,
  };
};