import { useQuery } from '@tanstack/react-query';
import { STALE_TIME } from '@shared';
import { terminalService } from './services';
import { terminalKeys } from './queryKeys';

export function useTerminals() {
  return useQuery({
    queryKey: terminalKeys.lists(),
    queryFn: () => terminalService.getAll({ page: 1, limit: 200 }).then((r) => r.data.data),
    staleTime: STALE_TIME.STATIC,
  });
}
