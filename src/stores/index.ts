import { create } from "zustand";
import req from "../utils/common/req";
import { Role } from "../enums/Role.enum";

type StateTheme = {
  themeMode: "dark" | "light";
};

type StateAuth = {
  user: {
    username: string;
    role: Role;
  } | null;
  isLoadingUser: boolean;
  isAuth: boolean;
};

type ActionTheme = {
  setTheme: (theme: StateTheme["themeMode"]) => void;
};
type ActionAuth = {
  logout: () => void;
  login: (username: string, password: string) => void;
  getMe: () => void;
};

export const useStoreTheme = create<StateTheme & ActionTheme>((set) => ({
  themeMode:
    (localStorage.getItem("themeMode") as "dark" | "light" | null) ?? "light",
  setTheme: (theme) => {
    // บันทึกธีมลงใน Local Storage
    localStorage.setItem("themeMode", theme);
    set({ themeMode: theme });
  },
}));

export const useAuth = create<StateAuth & ActionAuth>((set, get) => ({
  user: null,
  isAuth: false,
  isLoadingUser: true,
  login: async (username, password) => {
    try {
      const res = await req.post("/login", { username, password });
      const { user } = res.data;
      set({ user, isAuth: true });
    } catch (error) {
      set({ user: null, isAuth: false });
      throw error;
    } finally {
      get().getMe(); // เรียก getMe เพื่อโหลดข้อมูลผู้ใช้หลังจากล็อกอิน
      set({ isLoadingUser: false });
    }
  },
  logout: async () => {
    set({ isLoadingUser: true });
    try {
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
      const user = res.data;
      set({ user, isAuth: true });
    } catch (err) {
      set({ user: null, isAuth: false });
      throw err;
    } finally {
      set({ isLoadingUser: false });
    }
  },
}));
