import { req } from '@lib';
import type { AuthUser, ActorToken } from '../types';
import type { ApiData } from '@lib/apiTypes';

export const authService = {
  login: (username: string, password: string) =>
    req.post<{ message: string; user: AuthUser }>('/auth/login', { username, password }),

  loginTerminal: (terminalCode: string) =>
    req.post<{ message: string; user: AuthUser }>('/auth/login-terminal', { terminalCode }),

  logout: () => req.post('/auth/logout'),

  getMe: () => req.get<ApiData<AuthUser>>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    req.patch<ApiData<{ message: string }>>('/auth/update-password', { currentPassword, newPassword }),

  requestActorToken: (employeeId: string, pin: string) =>
    req.post<ApiData<ActorToken>>('/auth/actor-token', { employeeId, pin }),
};
