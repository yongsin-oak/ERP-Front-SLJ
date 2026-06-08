import { useCallback } from 'react';
import { useSessionStorage } from './useSessionStorage';

const SEARCH_PREFIX = 'search:';

/**
 * Persist table filter / search state to sessionStorage.
 * Cleared when the browser tab closes — user gets fresh state on next session.
 *
 * Usage:
 *   const [filters, setFilters, clearFilters] = useSearchState('order-list', defaultFilters);
 *
 * Tip: use with <FilterBar values={filters} onChange={setFilters} />.
 */
export function useSearchState<T extends Record<string, unknown>>(
  key: string,
  initialValue: T,
) {
  const [state, setState, remove] = useSessionStorage<T>(`${SEARCH_PREFIX}${key}`, initialValue);

  const set = useCallback(
    (values: T) => setState(values),
    [setState],
  );

  const clear = useCallback(() => remove(), [remove]);

  return [state, set, clear] as const;
}
