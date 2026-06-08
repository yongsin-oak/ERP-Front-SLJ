import { req } from '@shared';
import type { Paginated, ApiData } from '@shared/types';
import type { Terminal, CreateTerminalDto, UpdateTerminalDto } from '../types';

export interface TerminalListParams {
  page: number;
  limit: number;
}

const BASE = '/terminal';

export const terminalService = {
  getAll: (params: TerminalListParams) =>
    req.get<Paginated<Terminal>>(BASE, { params }),
  getById: (id: string) => req.get<ApiData<Terminal>>(`${BASE}/${id}`),
  create: (data: CreateTerminalDto) => req.post<ApiData<Terminal>>(BASE, data),
  update: (id: string, data: UpdateTerminalDto) =>
    req.patch<ApiData<Terminal>>(`${BASE}/${id}`, data),
  delete: (id: string) => req.delete<ApiData<Terminal>>(`${BASE}/${id}`),
};
