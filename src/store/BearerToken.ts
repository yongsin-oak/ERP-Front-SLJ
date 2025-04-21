import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Cookies from "js-cookie";

interface TokenType {
  token: string;
  setToken: (state: string) => void;
}

const cookieStorage = {
  getItem: (key: string) => Cookies.get(key) ?? null,
  setItem: (key: string, value: string) =>
    Cookies.set(key, value, { expires: 7, secure: true }),
  removeItem: (key: string) => Cookies.remove(key),
};

const useTokenStore = persist<TokenType>(
  (set) => ({
    token: "",
    setToken: (token) => set(() => ({ token })),
  }),
  { name: "token", storage: createJSONStorage(() => cookieStorage) }
);

export const useToken = create(useTokenStore);
