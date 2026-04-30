import { create } from 'zustand';
import { authService } from '../services';
import type { AuthState, AuthUser } from '../types';

const IS_DEV = import.meta.env.VITE_ENV_MODE === 'development';

export const DEV_USER: AuthUser = {
  sub: 'dev-bypass',
  username: 'dev',
  role: 'SuperAdmin',
};

interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
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
    if (IS_DEV) {
      set({ user: DEV_USER, isAuth: true });
      return;
    }
    const res = await authService.login(username, password);
    set({ user: res.data.user, isAuth: true });
  },

  logout: async () => {
    if (IS_DEV) {
      set({ user: null, isAuth: false });
      return;
    }
    await authService.logout();
    set({ user: null, isAuth: false });
  },

  getMe: async () => {
    if (IS_DEV) {
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
