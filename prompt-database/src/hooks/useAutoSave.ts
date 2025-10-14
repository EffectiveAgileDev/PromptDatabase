import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from '@/lib/validation';
import { useToast } from './useToast';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void> | void;
  delay?: number;
  enabled?: boolean;
  skipFirstSave?: boolean;
  entityId?: string | null; // ID to track when switching between entities (e.g., prompt IDs)
}

export function useAutoSave<T>({
  data,
  onSave,
  delay = 500,
  enabled = true,
  skipFirstSave = true,
  entityId
}: UseAutoSaveOptions<T>) {
  const { showToast } = useToast();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveCountRef = useRef(0);
  const initialDataRef = useRef<T>(data);
  const lastSavedDataRef = useRef<T>(data);
  const lastEntityIdRef = useRef(entityId);

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Update initial data when switching between entities (e.g., prompts)
  useEffect(() => {
    if (enabled && entityId !== lastEntityIdRef.current) {
      console.log('Resetting auto-save tracking - entity switched from', lastEntityIdRef.current, 'to', entityId);
      lastEntityIdRef.current = entityId;
      initialDataRef.current = data;
      lastSavedDataRef.current = data;
      saveCountRef.current = 0;
      setLastSaved(null);
    }
  }, [enabled, entityId, data]);

  const debouncedSave = useCallback(
    debounce(async (data: T) => {
      if (!enabled) return;

      // Check if data has actually changed from the last saved version
      const dataChanged = JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);

      if (!dataChanged) {
        console.log('Auto-save skipped: no changes detected');
        return;
      }

      // Skip first save if requested and this is the initial data
      if (skipFirstSave && saveCountRef.current === 0 &&
          JSON.stringify(data) === JSON.stringify(initialDataRef.current)) {
        saveCountRef.current++;
        return;
      }

      console.log('Auto-saving: changes detected');
      setIsAutoSaving(true);

      try {
        await onSaveRef.current(data);
        lastSavedDataRef.current = data; // Update last saved data
        saveCountRef.current++;
        setLastSaved(new Date());

        // Show subtle feedback for auto-saves (not for first save)
        if (saveCountRef.current > 1) {
          showToast('Auto-saved', 'success');
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