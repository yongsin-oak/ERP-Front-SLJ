import { req } from '@lib';
import type { AuthUser } from '../types';
import type { ApiData } from '@lib/apiTypes';

export const authService = {
  login: (username: string, password: string) =>
    req.post<{ message: string; user: AuthUser }>('/auth/login', { username, password }),

  logout: () => req.post('/auth/logout'),

  getMe: () => req.get<ApiData<AuthUser>>('/auth/me'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    req.patch<ApiData<{ message: string }>>('/auth/update-password', { currentPassword, newPassword }),
};
