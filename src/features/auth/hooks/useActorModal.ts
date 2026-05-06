import { create } from 'zustand';

interface ActorModalStore {
  open: boolean;
  _resolve: ((token: string) => void) | null;
  _reject: ((err: Error) => void) | null;
  /** เปิด modal แล้วรอ actor_token — ใช้ await request() ก่อน call API ที่ต้องการ actor */
  request: () => Promise<string>;
  confirm: (token: string) => void;
  cancel: () => void;
}

export const useActorModal = create<ActorModalStore>((set, get) => ({
  open: false,
  _resolve: null,
  _reject: null,

  request: () =>
    new Promise<string>((resolve, reject) => {
      set({ open: true, _resolve: resolve, _reject: reject });
    }),

  confirm: (token) => {
    get()._resolve?.(token);
    set({ open: false, _resolve: null, _reject: null });
  },

  cancel: () => {
    get()._reject?.(new Error('ยกเลิก'));
    set({ open: false, _resolve: null, _reject: null });
  },
}));
