import type { AuthUser, Role } from '@features/auth/types';
import type { DataColor } from '@/lib/styles';
import { IS_DEV } from '@config/env';

/**
 * Single source of truth สำหรับสิทธิ์เข้าถึงตาม role
 *
 * ใช้ร่วมกัน 3 ที่ เพื่อกัน policy drift:
 * - **เมนู** (`AppLayout` → `visibleNav` ซ่อนเมนูที่เข้าไม่ได้)
 * - **route guard** (`RoleGuard` ใน `<Page>` → แสดง 403 "ไม่มีสิทธิ์เข้าถึง")
 * - **landing** (หลัง login / เข้า root path → เด้งไปหน้าแรกของ role นั้น)
 *
 * ⚠️ **Default deny** — path ที่ไม่ได้ประกาศใน `ROUTE_ROLES` จะเข้าไม่ได้ทุก role
 * เพิ่ม route ใหม่ในไฟล์นี้ทุกครั้ง (dev mode จะ `console.warn` เตือนถ้าลืม)
 */

/** path ที่ผู้ใช้ล็อกอินแล้วเข้าได้ทุก role — ไม่อยู่ในเมนู ไม่ต้อง gate */
const ALWAYS_ALLOWED: readonly string[] = ['/profile'];

/**
 * key = absolute path (ตรงกับ key ใน NAV ของ AppLayout)
 * value = รายชื่อ role ที่เข้าถึงได้
 *
 * path ลูกที่ไม่ประกาศจะ match key ที่ยาวที่สุดซึ่งเป็น prefix
 * (เช่น `/stock/count/:id` → ใช้สิทธิ์ของ `/stock/count`)
 */
export const ROUTE_ROLES: Record<string, readonly Role[]> = {
  /* ── ภาพรวมธุรกิจ — เห็นตัวเลขยอดขาย/กำไร ── */
  '/dashboard': ['SuperAdmin', 'Admin', 'Accountant', 'Marketing', 'Sales'],
  '/report': ['SuperAdmin', 'Admin', 'Accountant', 'Marketing', 'Sales'],

  /* ── Order ── */
  '/order': ['SuperAdmin', 'Admin', 'Operator'],
  '/order/history': ['SuperAdmin', 'Admin', 'Operator', 'Accountant'],

  /* ── สินค้า ── */
  '/inventory': ['SuperAdmin', 'Admin', 'Operator', 'Warehouse', 'Accountant'],
  '/brand': ['SuperAdmin', 'Admin'],
  '/category': ['SuperAdmin', 'Admin'],

  /* ── สต็อก ── */
  '/stock/receive': ['SuperAdmin', 'Admin', 'Warehouse'],
  '/stock/damage': ['SuperAdmin', 'Admin', 'Warehouse'],
  '/stock/adjust': ['SuperAdmin'], // แก้จำนวนตรงๆ — กระทบ COGS ให้เจ้าของเท่านั้น
  '/stock/history': ['SuperAdmin', 'Admin', 'Warehouse', 'Accountant'],
  '/stock/count': ['SuperAdmin', 'Admin', 'Warehouse'], // ครอบ /stock/count/:id ด้วย

  /* ── จัดการ ── */
  '/shop': ['SuperAdmin', 'Admin'],
  '/supplier': ['SuperAdmin', 'Admin', 'Warehouse'],
  '/employee': ['SuperAdmin', 'HR'],

  /* ── ระบบ ── */
  '/user': ['SuperAdmin'],
  '/terminal': ['SuperAdmin'],
  '/role': ['SuperAdmin'],
};

/** เรียงยาว→สั้นครั้งเดียว เพื่อให้ match key ที่เจาะจงที่สุดก่อน (`/order/history` ก่อน `/order`) */
const ROUTE_KEYS_BY_SPECIFICITY = Object.keys(ROUTE_ROLES).sort((a, b) => b.length - a.length);

function matchRouteKey(path: string): string | undefined {
  return ROUTE_KEYS_BY_SPECIFICITY.find((key) => path === key || path.startsWith(`${key}/`));
}

/** role ที่เข้า path นี้ได้ — `[]` ถ้า path ไม่ได้ประกาศไว้ (default deny) */
export function getRequiredRoles(path: string): readonly Role[] {
  const key = matchRouteKey(path);
  return key ? ROUTE_ROLES[key] : [];
}

/** true ถ้า role เข้าถึง path นี้ได้ — path ที่ไม่ประกาศไว้ = เข้าไม่ได้ */
export function canAccess(role: Role | undefined, path: string): boolean {
  if (ALWAYS_ALLOWED.includes(path)) return true;

  const key = matchRouteKey(path);
  if (!key) {
    if (IS_DEV) {
      console.warn(
        `[access] "${path}" ไม่ได้ประกาศใน ROUTE_ROLES — ปฏิเสธการเข้าถึงไว้ก่อน (default deny). เพิ่มที่ src/config/access.ts`,
      );
    }
    return false;
  }

  return !!role && ROUTE_ROLES[key].includes(role);
}

/* ── Landing ─────────────────────────────────────────── */

/**
 * หน้าแรกของแต่ละ role — ต้องเป็น path ที่ role นั้น `canAccess` ได้เสมอ
 * (Operator/Warehouse ไม่มีสิทธิ์ dashboard จึงเด้งเข้างานหลักของตัวเองตรงๆ)
 */
export const ROLE_LANDING: Record<Role, string> = {
  SuperAdmin: '/dashboard',
  Admin: '/dashboard',
  Accountant: '/dashboard',
  Marketing: '/dashboard',
  Sales: '/dashboard',
  Operator: '/order',
  Warehouse: '/stock/receive',
  HR: '/employee',
};

/** เครื่องหน้าร้านมีงานเดียวคือยิงออเดอร์ — ข้าม landing ตาม role */
const TERMINAL_LANDING = '/order';

type LandingUser = Pick<AuthUser, 'role' | 'isTerminal'> | null | undefined;

export function getLandingPath(user: LandingUser): string {
  if (!user) return '/login';
  if (user.isTerminal) return TERMINAL_LANDING;
  return ROLE_LANDING[user.role];
}

/**
 * ปลายทางหลัง login — กลับไปหน้าที่ถูกเด้งมา (`from`) ถ้า role ยังมีสิทธิ์
 * ไม่งั้นไป landing ของ role นั้น เพื่อไม่ให้เจอ 403 ทันทีที่เพิ่งล็อกอินเสร็จ
 */
export function resolveRedirect(user: LandingUser, from: string | null | undefined): string {
  if (from) {
    const path = from.split(/[?#]/)[0];
    if (canAccess(user?.role, path)) return from;
  }
  return getLandingPath(user);
}

/* ── Labels ──────────────────────────────────────────── */

/**
 * สีประจำ role — จานสีเชิงหมวดหมู่ (ไม่ได้แปลว่าดี/ร้าย แค่แยกออกจากกัน)
 * เคยถูกก๊อปไว้ 5 ไฟล์ (AppLayout / TerminalPage / UserPage / ProfilePage / DevTools)
 * ซึ่งหลุดกันไปคนละชุดเมื่อเพิ่ม role ใหม่ — รวมไว้ที่เดียวกับ ROLE_LABEL
 */
export const ROLE_COLOR: Record<Role, DataColor> = {
  SuperAdmin: 'red',
  Admin: 'orange',
  Operator: 'blue',
  Warehouse: 'cyan',
  Accountant: 'green',
  HR: 'purple',
  Marketing: 'magenta',
  Sales: 'gold',
};

/** ชื่อ role ภาษาไทย — ใช้ในข้อความ 403 ให้ผู้ใช้ที่ไม่คุ้นศัพท์อังกฤษเข้าใจ */
export const ROLE_LABEL: Record<Role, string> = {
  SuperAdmin: 'ผู้ดูแลระบบ',
  Admin: 'แอดมิน',
  Operator: 'พนักงานยิงออเดอร์',
  Warehouse: 'พนักงานคลังสินค้า',
  Accountant: 'บัญชี',
  HR: 'ฝ่ายบุคคล',
  Marketing: 'การตลาด',
  Sales: 'ฝ่ายขาย',
};
