import type { Role } from '@features/auth/types';

/**
 * Single source of truth สำหรับสิทธิ์เข้าถึงตาม role.
 * - key = absolute path (ตรงกับ key ใน NAV ของ AppLayout)
 * - value = รายชื่อ role ที่เข้าถึงได้
 * - path ที่ไม่อยู่ในแมพนี้ = เปิดให้ทุก role
 *
 * ใช้ร่วมกันทั้ง **เมนู** (`AppLayout` → ซ่อนเมนู) และ **route guard**
 * (`router` → `RoleGuard` เด้ง 403) เพื่อกัน policy drift ระหว่างสองที่
 */
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/brand': ['SuperAdmin'],
  '/category': ['SuperAdmin'],
  '/shop': ['SuperAdmin'],
  '/employee': ['SuperAdmin'],
  '/user': ['SuperAdmin'],
  '/terminal': ['SuperAdmin'],
  '/role': ['SuperAdmin'],
  '/stock/adjust': ['SuperAdmin'],
};

/** true ถ้า role เข้าถึง path นี้ได้ (path ที่ไม่ถูก gate = เข้าได้เสมอ) */
export function canAccess(role: Role | undefined, path: string): boolean {
  const required = ROUTE_ROLES[path];
  if (!required || required.length === 0) return true;
  return !!role && required.includes(role);
}
