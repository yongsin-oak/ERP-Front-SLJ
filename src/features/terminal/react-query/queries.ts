import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { terminalService } from './services';
import { terminalKeys } from './queryKeys';

/** แบ่งหน้าฝั่ง server — ใช้กับหน้าตาราง (อย่าดึงทั้งหมดมาไว้ในหน่วยความจำ) */
export function useTerminalList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: terminalKeys.list(params),
    queryFn: () => terminalService.getAll(params).then((r) => r.data),
    staleTime: STALE_TIME.STATIC,
    placeholderData: (prev) => prev,
  });
}
