import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { userService } from './services';
import { userKeys } from './queryKeys';

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => userService.getAll({ page: 1, limit: 200 }).then((r) => r.data.data),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: userKeys.roles(),
    queryFn: () => userService.getRoles().then((r) => r.data.data),
    staleTime: STALE_TIME.STATIC,
  });
}
