import { useState, useEffect } from 'react';
import { performanceMonitor, checkPerformanceBudget } from '@/utils/performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceMonitor({ 
  enabled = import.meta.env.DEV, 
  position = 'bottom-right' 
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [budget, setBudget] = useState<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const currentMetrics = performanceMonitor.getMetrics();
      const memory = performanceMonitor.getMemoryUsage();
      const budgetCheck = checkPerformanceBudget();
      
      setMetrics(currentMetrics.slice(-10)); // Keep last 10 metrics
      setMemoryUsage(memory);
      setBudget(budgetCheck);
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') return value.toFixed(3);
    if (name.includes('paint') || name.includes('blocking') || name === 'FID') {
      return `${Math.round(value)}ms`;
    }
    return Math.round(value);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <div className="bg-black bg-opacity-80 text-white text-xs rounded-lg p-2 max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">🚀 Performance</span>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-gray-300 hover:text-white"
          >
            {isVisible ? '−' : '+'}
          </button>
        </div>

        {isVisible && (
          <div className="space-y-2">
            {/* Core Web Vitals */}
            {metrics.length > 0 && (
              <div>
                <div className="font-medium mb-1">Core Web Vitals</div>
                {metrics.slice(-5).map((metric, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{metric.name}:</span>
                    <span className={getMetricColor(metric.rating)}>
                      {formatValue(metric.name, metric.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Memory Usage */}
            {memoryUsage && (
              <div>
                <div className="font-medium mb-1">Memory (MB)</div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{memoryUsage.used}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{memoryUsage.total}</span>
                </div>
              </div>
            )}

            {/* Performance Budget */}
            {budget && (
              <div>
                <div className="font-medium mb-1">Budget</div>
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className={budget.passed ? 'text-green-600' : 'text-red-600'}>
                    {Math.round(budget.score)}%
                  </span>
                </div>
                {budget.violations.length > 0 && (
                  <div className="text-red-400 text-xs">
                    {budget.violations.length} violations
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-2 border-t border-gray-600">
              <button
                onClick={() => {
                  performanceMonitor.clearMetrics();
                  setMetrics([]);
                }}
                className="text-xs text-gray-300 hover:text-white"
              >
                Clear Metrics
              </button>
              <span className="mx-2">|</span>
              <button
                onClick={() => {
                  const report = performanceMonitor.generateReport();
                  console.log('📊 Performance Report:', report);
                }}
                className="text-xs text-gray-300 hover:text-white"
              >
                Log Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}