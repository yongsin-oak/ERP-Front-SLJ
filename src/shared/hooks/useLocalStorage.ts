import { useState, useCallback, useEffect } from 'react';

/**
 * Sync React state with localStorage. JSON-serialized.
 * Returns [value, set, remove].
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // re-read เมื่อ key เปลี่ยน กันค่าค้างจาก key เดิม
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
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
        try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* quota exceeded */ }
        return next;
      });
    },
    [key],
  );

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    setStored(initialValue);
  }, [key, initialValue]);

  return [stored, set, remove] as const;
}
