import { create } from 'zustand';

interface ActorModalStore {
  open: boolean;
  _resolve: (() => void) | null;
  _reject: ((err: Error) => void) | null;
  /**
   * เปิด modal ให้พนักงานยืนยัน PIN — resolve เมื่อยืนยันสำเร็จ (actor ถูกเก็บใน useActor แล้ว),
   * reject เมื่อผู้ใช้กดยกเลิก. ใช้ `await request()` ก่อนดำเนินการที่ต้องระบุผู้บันทึก
   */
  request: () => Promise<void>;
  confirm: () => void;
  cancel: () => void;
}

export const useActorModal = create<ActorModalStore>((set, get) => ({
  open: false,
  _resolve: null,
  _reject: null,

  request: () =>
    new Promise<void>((resolve, reject) => {
      set({ open: true, _resolve: resolve, _reject: reject });
    }),

  confirm: () => {
    get()._resolve?.();
    set({ open: false, _resolve: null, _reject: null });
  },

  cancel: () => {
    get()._reject?.(new Error('ยกเลิกการยืนยันตัวตน'));
    set({ open: false, _resolve: null, _reject: null });
  },
}));
