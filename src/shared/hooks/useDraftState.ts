import { useState, useCallback } from 'react';

// Draft survives 24h; after that it's stale and discarded on next read
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const DRAFT_PREFIX = 'draft:';

interface DraftEntry<T> {
  data: T;
  savedAt: number;
}

/**
 * Persist form draft to localStorage with a 24h TTL.
 * Auto-clears on expiry — user never sees stale data from yesterday.
 *
 * Usage:
 *   const [draft, saveDraft, clearDraft] = useDraftState('order-entry', initialValues);
 *
 * Pass `key={userId}` or `key={pageRoute}` to scope drafts per user/page.
 */
export function useDraftState<T>(key: string, initialValue: T) {
  const storageKey = `${DRAFT_PREFIX}${key}`;

  const [draft, setDraft] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return initialValue;
      const entry = JSON.parse(raw) as DraftEntry<T>;
      if (Date.now() - entry.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(storageKey);
        return initialValue;
      }
      return entry.data;
    } catch {
      return initialValue;
    }
  });

  const save = useCallback(
    (value: T | ((prev: T) => T)) => {
      setDraft(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        const entry: DraftEntry<T> = { data: next, savedAt: Date.now() };
        try { localStorage.setItem(storageKey, JSON.stringify(entry)); } catch {}
        return next;
      });
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setDraft(initialValue);
  }, [storageKey, initialValue]);

  const hasDraft = localStorage.getItem(storageKey) !== null;

  return { draft, save, clear, hasDraft } as const;
}
