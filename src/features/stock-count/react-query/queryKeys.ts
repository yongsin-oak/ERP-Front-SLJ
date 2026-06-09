export const stockCountKeys = {
  all: ['stock-count'] as const,
  lists: () => [...stockCountKeys.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...stockCountKeys.lists(), params] as const,
  details: () => [...stockCountKeys.all, 'detail'] as const,
  detail: (id: string) => [...stockCountKeys.details(), id] as const,
};
