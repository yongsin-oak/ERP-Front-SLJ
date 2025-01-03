import { create } from "zustand";

type State = {
  themeMode: "dark" | "light";
};

type Action = {
  setTheme: (theme: State["themeMode"]) => void;
};

export const useStoreTheme = create<State & Action>((set) => ({
  themeMode:
    (localStorage.getItem("themeMode") as "dark" | "light" | null) ?? "light",
  setTheme: (theme) => {
    // บันทึกธีมลงใน Local Storage
    localStorage.setItem("themeMode", theme);
    set({ themeMode: theme });
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
