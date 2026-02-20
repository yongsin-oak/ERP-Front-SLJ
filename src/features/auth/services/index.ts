import req from "@lib/config/req";
import { create } from "zustand";

type StateAuth = {
  user: {
    username: string;
    role: Role;
    userId?: string;
  } | null;
  isLoadingUser: boolean;
  isAuth: boolean;
};

type ActionAuth = {
  logout: () => void;
  login: (username: string, password: string) => void;
  getMe: () => void;
};

type MeUserResponse = {
  username: string;
  role: Role;
  sub?: string;
  id?: string;
  userId?: string;
};

export const useAuth = create<StateAuth & ActionAuth>((set, get) => ({
  user: null,
  isAuth: false,
  isLoadingUser: true,
  login: async (username, password) => {
    try {
      const res = await req.post("/login", { username, password });
      const { user } = res.data as {
        user: { username: string; role: Role; userId?: string };
      };
      set({ user, isAuth: true });
    } catch (error) {
      set({ user: null, isAuth: false });
      console.error(error);
    } finally {
      get().getMe(); // เรียก getMe เพื่อโหลดข้อมูลผู้ใช้หลังจากล็อกอิน
      set({ isLoadingUser: false });
    }
  },
  logout: async () => {
    try {
      set({ isLoadingUser: true });
      await req.post("/logout");
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      set({ isLoadingUser: false });
      set({ user: null, isAuth: false });
    }
  },
  getMe: async () => {
    if (get().user) return; //
    try {
      set({ isLoadingUser: true });
      const res = await req.get("/me");
      const user = res.data as MeUserResponse;
      const userId = user.sub || user.id || user.userId;
      set({
        user: { username: user.username, role: user.role, userId },
        isAuth: true,
      });
    } catch (err) {
      // set({ user: null, isAuth: false });
      console.error(err);
    } finally {
      set({ isLoadingUser: false });
    }
  },
}));
