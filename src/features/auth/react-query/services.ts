import { req } from '@shared';
import type { AuthUser, ActorToken, Role } from '../types';
import type { ApiData } from '@shared/types';

interface TerminalInfo {
  terminalCode: string;
  name: string;
  role: Role;
}

export const authService = {
  login: (username: string, password: string) =>
    req.post<{ message: string; user: AuthUser }>('/auth/login', { username, password }),

  loginTerminal: (terminalCode: string, password: string) =>
    req.post<{ message: string; terminal: TerminalInfo }>('/auth/login', { terminalCode, password }),

  logout: () => req.post('/auth/logout'),

  getMe: () => req.get<ApiData<AuthUser>>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    req.patch<ApiData<{ message: string }>>('/auth/update-password', { currentPassword, newPassword }),

  verifyPin: (employeeId: string, pin: string) =>
    req.post<ApiData<ActorToken>>('/auth/pin/verify', { employeeId, pin }),
};
