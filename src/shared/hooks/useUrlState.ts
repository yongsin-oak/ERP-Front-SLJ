import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

type ParamValue = string | number | boolean;

/**
 * Sync component state with URL search params.
 * - Primitives are auto-parsed: number/boolean inferred from default type.
 * - Params equal to their default are omitted from URL (clean URLs).
 * - Always use `{ replace: true }` to avoid polluting browser history.
 *
 * Usage:
 *   const DEFAULTS = { search: '', page: 1, limit: 20 };
 *   const [params, setParams, resetParams] = useUrlState(DEFAULTS);
 *   setParams({ search: 'foo', page: 1 });
 */
export function useUrlState<T extends Record<string, ParamValue>>(defaults: T) {
  const defaultsRef = useRef(defaults);
  const [searchParams, setSearchParams] = useSearchParams();

  const state = useMemo(() => {
    const d = defaultsRef.current;
    const result: Record<string, ParamValue> = { ...d };
    for (const key of Object.keys(d)) {
      const raw = searchParams.get(key);
      if (raw === null) continue;
      const def = d[key];
      if (typeof def === 'number') {
        const n = Number(raw);
        if (!isNaN(n)) result[key] = n;
      } else if (typeof def === 'boolean') {
        result[key] = raw === 'true';
      } else {
        result[key] = raw;
      }
    }
    return result as T;
  }, [searchParams]);

  const set = useCallback((patch: Partial<T>) => {
    const d = defaultsRef.current;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of Object.keys(patch)) {
          const value = patch[key as keyof T];
          if (value === undefined || value === null || value === '' || value === d[key]) {
            next.delete(key);
          } else {
            next.set(key, String(value));
          }
        }
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const reset = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return [state, set, reset] as const;
}
