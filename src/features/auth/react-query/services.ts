import { req, API } from '@shared';
import type { AuthUser, ActorToken, LoginTerminal } from '../types';
import type { ApiData } from '@shared/types';

export const authService = {
  login: (username: string, password: string) =>
    req.post<{ message: string; user: AuthUser }>('/auth/login', { username, password }),

  loginTerminal: (terminalCode: string, password: string) =>
    req.post<{ message: string; terminal: LoginTerminal }>('/auth/login', { terminalCode, password }),

  /** public — รายชื่อ terminal ที่ isActive สำหรับ dropdown หน้า login */
  getTerminals: () => req.get<ApiData<LoginTerminal[]>>(API.auth.terminals),

  logout: () => req.post('/auth/logout'),

  getMe: () => req.get<ApiData<AuthUser>>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    req.patch<ApiData<{ message: string }>>('/auth/update-password', { currentPassword, newPassword }),

  verifyPin: (employeeId: string, pin: string) =>
    req.post<ApiData<ActorToken>>('/auth/pin/verify', { employeeId, pin }),
};
