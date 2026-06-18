import { useState, useCallback, useEffect } from 'react';

/**
 * Sync React state with sessionStorage. JSON-serialized.
 * Cleared when the tab closes — good for temporary UI state (filters, steps).
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // re-read เมื่อ key เปลี่ยน กันค่าค้างจาก key เดิม
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key);
      setStored(raw !== null ? (JSON.parse(raw) as T) : initialValue);
    } catch {
      setStored(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        // eslint-disable-next-line no-empty
        try { sessionStorage.setItem(key, JSON.stringify(next)); } catch {}
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    sessionStorage.removeItem(key);
    setStored(initialValue);
  }, [key, initialValue]);

  return [stored, set, remove] as const;
}
