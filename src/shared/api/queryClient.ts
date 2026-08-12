import { QueryClient, QueryCache } from '@tanstack/react-query';
import { getErrorStatus, showError } from './error';
import { STALE_TIME, GC_TIME } from '../constants';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: {
      /** true = ผู้เรียกแสดง error เองแล้ว (เช่น สแกน barcode ไม่เจอ) — global handler จะไม่เด้ง toast ซ้ำ */
      skipGlobalError?: boolean;
    };
  }
}

const queryCache = new QueryCache({
  onError: (err, query) => {
    const status = getErrorStatus(err);
    if (status === 401) return; // handled by axios refresh interceptor
    if (query.meta?.skipGlobalError) return;
    showError(err, 'โหลดข้อมูล');
  },
});

export const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME.MEDIUM,
      gcTime: GC_TIME.MEDIUM,
      retry: (failureCount, err) => {
        const status = getErrorStatus(err);
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
