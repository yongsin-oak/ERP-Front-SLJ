export interface OrderParams {
  page?: number;
  limit?: number;
  status?: string;
  shopId?: string;
  employeeId?: string;
  terminalId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Key factory — ทุก invalidate/query ใช้ตรงนี้
 * ห้าม hardcode string ใน useQuery/invalidateQueries โดยตรง
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
