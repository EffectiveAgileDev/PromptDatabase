import { useEffect, useState, useCallback } from 'react';
import { debounce } from '@/lib/validation';

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => void,
  delay: number = 500,
  enabled: boolean = true
) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const debouncedSave = useCallback(
    debounce((data: T) => {
      if (!enabled) return;
      
      setIsAutoSaving(true);
      onSave(data);
      
      setTimeout(() => setIsAutoSaving(false), 1000);
    }, delay),
    [onSave, delay, enabled]
  );

  useEffect(() => {
    if (enabled) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);

  return { isAutoSaving };
}