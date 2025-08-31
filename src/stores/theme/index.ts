import { create } from "zustand";

type StateTheme = {
  themeMode: "dark" | "light";
};

type ActionTheme = {
  setTheme: (theme: StateTheme["themeMode"]) => void;
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
