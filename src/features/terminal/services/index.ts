import { req } from '@lib';
import type { ApiData } from '@lib/apiTypes';
import type { Terminal, CreateTerminalDto, UpdateTerminalDto } from '../types';

const BASE = '/terminal';

export const terminalService = {
  getAll: () => req.get<ApiData<Terminal[]>>(BASE),
  getById: (id: string) => req.get<ApiData<Terminal>>(`${BASE}/${id}`),
  create: (data: CreateTerminalDto) => req.post<ApiData<Terminal>>(BASE, data),
  update: (id: string, data: UpdateTerminalDto) =>
    req.patch<ApiData<Terminal>>(`${BASE}/${id}`, data),
  delete: (id: string) => req.delete<ApiData<null>>(`${BASE}/${id}`),
};
