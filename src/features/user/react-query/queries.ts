import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { userService } from './services';
import { userKeys } from './queryKeys';

/** แบ่งหน้าฝั่ง server — ใช้กับหน้าตาราง (อย่าดึงทั้งหมดมาไว้ในหน่วยความจำ) */
export function useUserList(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAll(params).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => userService.getRoles().then((r) => r.data.data),
    staleTime: STALE_TIME.STATIC,
  });
}
