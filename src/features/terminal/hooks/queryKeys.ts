export const terminalKeys = {
  all: ['terminals'] as const,
  lists: () => [...terminalKeys.all, 'list'] as const,
  detail: (id: string) => [...terminalKeys.all, 'detail', id] as const,
};
