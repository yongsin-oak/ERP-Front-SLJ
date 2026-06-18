import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${encodeURIComponent(name)}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Read / write a browser cookie.
 * Returns [value, set(value, days?), remove].
 */
export function useCookie(name: string, defaultValue?: string) {
  const [value, setValue] = useState<string | null>(() => readCookie(name) ?? defaultValue ?? null);

  const set = useCallback(
    (val: string, days = 7) => {
      const expires = dayjs().add(days, 'day').toDate().toUTCString();
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax`;
      setValue(val);
    },
    [name],
  );

  const remove = useCallback(() => {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    setValue(null);
  }, [name]);

  return [value, set, remove] as const;
}
