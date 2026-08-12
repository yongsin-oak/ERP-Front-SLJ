export const terminalKeys = {
  all: ['terminals'] as const,
  lists: () => [...terminalKeys.all, 'list'] as const,
  list: (params: { page: number; limit: number }) =>
    [...terminalKeys.all, 'list', params] as const,
  detail: (id: string) => [...terminalKeys.all, 'detail', id] as const,
};
