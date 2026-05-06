import type { Role } from '@features/auth/types';

export interface Terminal {
  id: string;
  terminalCode: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTerminalDto {
  terminalCode: string;
  name: string;
  role: Role;
  password: string;
}

export interface UpdateTerminalDto {
  terminalCode?: string;
  name?: string;
  role?: Role;
  password?: string;
  isActive?: boolean;
}
