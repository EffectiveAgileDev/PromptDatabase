import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  listSize: number;
  memoryUsage?: number;
  lastMeasured: Date;
}

export function usePerformanceMonitor(dependency: any[]) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    // Measure after React has finished rendering
    const timeoutId = setTimeout(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics({
        renderTime,
        listSize: Array.isArray(dependency[0]) ? dependency[0].length : 0,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined,
        lastMeasured: new Date()
      });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, dependency);

  return metrics;
}

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
}

export function VirtualList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  overscan = 5 
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(height / itemHeight) + overscan,
    items.length
  );
  
  const visibleItems = items.slice(
    Math.max(0, startIndex - overscan),
    endIndex
  );
  
  const totalHeight = items.length * itemHeight;
  const offsetY = Math.max(0, startIndex - overscan) * itemHeight;

  return (
    <div
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex - overscan + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex - overscan + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PerformanceHints({ metrics }: { metrics: PerformanceMetrics | null }) {
  if (!metrics) return null;

  const isSlowRender = metrics.renderTime > 16; // 60fps threshold
  const isLargeList = metrics.listSize > 100;

  if (!isSlowRender && !isLargeList) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 rounded p-2 text-xs max-w-xs">
      <div className="font-semibold text-yellow-800">Performance Tips:</div>
      {isSlowRender && (
        <div className="text-yellow-700">
          Render time: {metrics.renderTime.toFixed(1)}ms (slow)
        </div>
      )}
      {isLargeList && (
        <div className="text-yellow-700">
          Large list detected ({metrics.listSize} items). Consider virtual scrolling.
        </div>
      )}
    </div>
  );
}