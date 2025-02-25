import { create } from "zustand";

type StateTheme = {
  themeMode: "dark" | "light";
};

type StateAuth = {
  token: string | null;
  user: string | null;
};

type ActionTheme = {
  setTheme: (theme: StateTheme["themeMode"]) => void;
};
type ActionAuth = {
  setToken: (token: string) => void;
  setUser: (role: string) => void;
  logout: () => void;
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

export const useAuth = create<StateAuth & ActionAuth>((set) => ({
  token:
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || null,
  user: null,
  setToken: (token) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()};`;
    set({ token });
  },
  setUser: (role) => {
    set({ user: role });
  },
  logout: () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    set({ user: null });
    set({ token: null });
  },
}));

// // Hook เพื่อโหลดค่าธีมจาก Local Storage
// export const useInitializeTheme = () => {
//   const { setTheme } = useStoreTheme();

//   useEffect(() => {
//     // โหลดค่าจาก Local Storage ถ้ามี
//     const storedTheme = localStorage.getItem("themeMode") as
//       | "dark"
//       | "light"
//       | null;

//     if (storedTheme) {
//       setTheme(storedTheme);
//     }
//   }, [setTheme]);
// };
