import { req } from '@shared';
import type { ApiData } from '@shared/types';
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
