import { req } from '@lib';
import type { ApiData } from '@lib/apiTypes';
import type { Role } from '@features/auth/types';
import type { User, CreateUserDto, UpdateUserRoleDto } from '../types';

const BASE = '/user';

export const userService = {
  getRoles: () => req.get<ApiData<Role[]>>(`${BASE}/roles`),

  getAll: () => req.get<ApiData<User[]>>(BASE),

  getById: (id: string) => req.get<ApiData<User>>(`${BASE}/${id}`),

  create: (data: CreateUserDto) => req.post<ApiData<User>>(BASE, data),

  updateRole: (id: string, data: UpdateUserRoleDto) =>
    req.patch<ApiData<User>>(`${BASE}/${id}/role`, data),

  delete: (id: string) => req.delete<ApiData<User>>(`${BASE}/${id}`),
};
