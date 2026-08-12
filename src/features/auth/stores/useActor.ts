import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { registerActorTokenGetter, registerActorInvalidHandler } from '@shared';
import type { Role } from '../types';

/** พนักงานที่ยืนยัน PIN แล้ว = ผู้บันทึกออเดอร์บนเครื่องนี้ */
export interface ActorEmployee {
  id: string;
  name: string;
  role: Role;
}

/**
 * ถือว่า token ใกล้หมดอายุถ้าเหลือน้อยกว่านี้ → บังคับ re-verify PIN ก่อนบันทึก
 * (กัน token ตายกลางคันตอนกำลังส่ง request)
 */
const EXPIRY_BUFFER_MS = 60 * 1000;

interface ActorStore {
  employee: ActorEmployee | null;
  token: string | null;
  /** epoch ms ที่ token หมดอายุ */
  expiresAt: number | null;
  setActor: (r: { actorToken: string; expiresIn: number; employee: ActorEmployee }) => void;
  clear: () => void;
  /** token ที่ยังใช้ได้จริง (เผื่อ buffer) — null ถ้าไม่มี/ใกล้หมดอายุ */
  getValidToken: () => string | null;
  isValid: () => boolean;
}

export const useActor = create<ActorStore>()(
  persist(
    (set, get) => ({
      employee: null,
      token: null,
      expiresAt: null,

      setActor: ({ actorToken, expiresIn, employee }) =>
        set({ token: actorToken, employee, expiresAt: Date.now() + expiresIn * 1000 }),

      clear: () => set({ employee: null, token: null, expiresAt: null }),

      getValidToken: () => {
        const { token, expiresAt } = get();
        if (!token || !expiresAt) return null;
        if (expiresAt - EXPIRY_BUFFER_MS <= Date.now()) return null;
        return token;
      },

      isValid: () => get().getValidToken() !== null,
    }),
    {
      // จำ actor ข้าม reload — token อายุ 4 ชม. (backend ACTOR_TOKEN_EXPIRES_IN)
      // reload ภายในช่วงนั้นจึงไม่ต้องกรอก PIN ซ้ำ. getValidToken กรอง token
      // ที่หมดอายุอยู่แล้ว → ถ้า restore มาแล้วเกินอายุ หน้าที่ต้องใช้ PIN จะขอใหม่เอง
      name: 'slj-actor',
      storage: createJSONStorage(() => localStorage),
      // เก็บเฉพาะ state ที่เป็นข้อมูล ไม่เก็บ action/getter
      partialize: (s) => ({ token: s.token, employee: s.employee, expiresAt: s.expiresAt }),
    },
  ),
);

// แนบ X-Actor-Token อัตโนมัติทุก request — interceptor อ่านผ่าน getter นี้
// (กัน shared/api import features/auth → circular dependency)
registerActorTokenGetter(() => useActor.getState().getValidToken());

// backend ปฏิเสธ actor token (หมดอายุ/ไม่ถูกต้อง) → ล้างทิ้งให้ state ตรงกับความจริง
// หน้าที่ต้องใช้ PIN จะเห็น employee = null แล้วขอ PIN ใหม่เอง (ไม่ต้อง reload)
registerActorInvalidHandler(() => useActor.getState().clear());
