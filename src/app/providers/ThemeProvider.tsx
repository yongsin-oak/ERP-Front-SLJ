import type { ReactNode } from 'react';

/**
 * Theme is driven entirely by Tailwind tokens (src/index.css tier 1→3).
 * Toasts use Sonner (`<Toaster/>` mounted in App.tsx). No runtime provider needed —
 * kept as a pass-through so callers don't change.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
