import { useState, useEffect } from 'react';

// Matches Ant Design 5 breakpoints
export const BREAKPOINTS = {
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1600px)',
} as const;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches); // resync เมื่อ query เปลี่ยน กันค่าค้างจาก query เดิม
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery(BREAKPOINTS.xs);
}

export function useIsDesktop() {
  return useMediaQuery(BREAKPOINTS.lg);
}
