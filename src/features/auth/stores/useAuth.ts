import { create } from 'zustand';
import { authService } from '../react-query/services';
import type { AuthState, AuthUser } from '../types';
import { ENV } from '@config/env';

export const IS_BYPASS =
  ENV.MODE === 'development' && ENV.BYPASS_AUTH;

export const DEV_USER: AuthUser = {
  sub: 'dev-bypass',
  username: 'dev',
  role: 'SuperAdmin',
};

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  loginTerminal: (terminalCode: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isAuth: false,
  isLoadingUser: true,

  setUser: (user) => set({ user, isAuth: !!user }),

  login: async (username, password) => {
    if (IS_BYPASS) {
      set({ user: DEV_USER, isAuth: true });
      return;
    }
    const res = await authService.login(username, password);
    set({ user: res.data.user, isAuth: true });
  },

  loginTerminal: async (terminalCode, password) => {
    if (IS_BYPASS) {
      set({ user: { ...DEV_USER, terminalCode, type: 'terminal', isTerminal: true }, isAuth: true });
      return;
    }
    const res = await authService.loginTerminal(terminalCode, password);
    const t = res.data.terminal;
    set({
      user: { terminalCode: t.terminalCode, name: t.name, role: t.role, type: 'terminal', isTerminal: true },
      isAuth: true,
    });
  },

  logout: async () => {
    if (IS_BYPASS) {
      set({ user: null, isAuth: false });
      return;
    }
    await authService.logout();
    set({ user: null, isAuth: false });
  },

  getMe: async () => {
    if (IS_BYPASS) {
      set({ user: DEV_USER, isAuth: true, isLoadingUser: false });
      return;
    }
    try {
      set({ isLoadingUser: true });
      const res = await authService.getMe();
      set({ user: res.data.data, isAuth: true });
    } catch {
      set({ user: null, isAuth: false });
    } finally {
      set({ isLoadingUser: false });
    }
  },
}));
