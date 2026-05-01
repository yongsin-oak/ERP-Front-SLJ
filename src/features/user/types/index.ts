import type { Role } from '@features/auth/types';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface CreateUserDto {
  username: string;
  password: string;
  role: Role;
}

export interface UpdateUserRoleDto {
  role: Role;
}
