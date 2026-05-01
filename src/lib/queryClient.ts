import { QueryClient, QueryCache } from '@tanstack/react-query';
import { getErrorStatus, showError } from './error';

/**
 * Global query error handler
 * - 401 ไม่ต้อง toast (axios interceptor จัดการ refresh / redirect)
 * - 403 แสดงเตือนสิทธิ์
 * - error อื่นๆ แสดง toast พร้อมข้อความที่ parse แล้ว
 */
const queryCache = new QueryCache({
  onError: (err) => {
    const status = getErrorStatus(err);
    if (status === 401) return; // handled by axios refresh
    showError(err, 'โหลดข้อมูล');
  },
});

export const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: (failureCount, err) => {
        const status = getErrorStatus(err);
        // ไม่ retry สำหรับ 4xx (network เท่านั้นที่ retry)
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
