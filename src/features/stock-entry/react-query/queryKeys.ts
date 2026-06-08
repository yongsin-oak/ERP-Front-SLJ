import type { StockEntryParams } from './services';

export const stockEntryKeys = {
  all: ['stock-entries'] as const,
  lists: () => [...stockEntryKeys.all, 'list'] as const,
  list: (params: StockEntryParams) => [...stockEntryKeys.lists(), params] as const,
};

export type { StockEntryParams };
