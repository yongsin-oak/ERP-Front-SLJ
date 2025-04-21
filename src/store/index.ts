import Cookies from "js-cookie";
import { create } from "zustand";
import req from "../utils/req";
import { useToken } from "./BearerToken";

type StateTheme = {
  themeMode: "dark" | "light";
};

type StateAuth = {
  user: string | null;
};

type ActionTheme = {
  setTheme: (theme: StateTheme["themeMode"]) => void;
};
type ActionAuth = {
  logout: () => void;
  login: (username: string, password: string) => void;
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
  user: null,
  login: async (username, password) => {
    const res = await req.post("/login", {
      username: username,
      password: password,
    });
    const { token, role } = res.data;
    useToken.getState().setToken(token);
    set({ user: role });
  },
  logout: () => {
    set({ user: null });
    Cookies.remove("token");
    useToken.getState().setToken("");
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
