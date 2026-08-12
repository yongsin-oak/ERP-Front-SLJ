export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: { page: number; limit: number }) =>
    [...userKeys.all, 'list', params] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
};
