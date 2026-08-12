import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { authService } from './services';
import { authKeys } from './queryKeys';

/**
 * รายชื่อ terminal ที่ isActive สำหรับ dropdown หน้า login (public endpoint).
 * เปลี่ยนน้อยมาก → STATIC stale time. reference นี้ปลอดภัยเพราะไม่มีรหัสผ่าน.
 */
export function useLoginTerminals() {
  return useQuery({
    queryKey: authKeys.terminals(),
    queryFn: () => authService.getTerminals().then((r) => r.data.data),
    staleTime: STALE_TIME.STATIC,
  });
}
