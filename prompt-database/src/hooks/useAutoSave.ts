import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from '@/lib/validation';
import { useToast } from './useToast';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
  skipFirstSave?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 500,
  enabled = true,
  skipFirstSave = true
}: UseAutoSaveOptions<T>) {
  const { showToast } = useToast();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveCountRef = useRef(0);
  const initialDataRef = useRef<T>(data);

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const debouncedSave = useCallback(
    debounce(async (data: T) => {
      if (!enabled) return;
      
      // Skip first save if requested and this is the initial data
      if (skipFirstSave && saveCountRef.current === 0 && 
          JSON.stringify(data) === JSON.stringify(initialDataRef.current)) {
        saveCountRef.current++;
        return;
      }

      setIsAutoSaving(true);
      
      try {
        await onSaveRef.current(data);
        saveCountRef.current++;
        setLastSaved(new Date());
        
        // Show subtle feedback for auto-saves (not for first save)
        if (saveCountRef.current > 1) {
          showToast('Auto-saved', 'success', { duration: 1500 });
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        showToast('Auto-save failed', 'error');
      } finally {
        setIsAutoSaving(false);
      }
    }, delay),
    [delay, enabled, skipFirstSave, showToast]
  );

  useEffect(() => {
    if (enabled) {
      console.log('Auto-save effect triggered, data changed:', data);
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);

  const forceSave = useCallback(async () => {
    if (!enabled) return;
    
    setIsAutoSaving(true);
    try {
      await onSaveRef.current(data);
      saveCountRef.current++;
      setLastSaved(new Date());
      showToast('Saved successfully', 'success');
    } catch (error) {
      console.error('Manual save failed:', error);
      showToast('Save failed', 'error');
    } finally {
      setIsAutoSaving(false);
    }
  }, [data, enabled, showToast]);

  return { 
    isAutoSaving, 
    lastSaved, 
    saveCount: saveCountRef.current,
    forceSave 
  };
}