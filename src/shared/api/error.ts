import { isAxiosError } from 'axios';
import { notify } from '../utils/notify';

/**
 * Machine-readable error codes จาก backend (`ErrorCode` ใน common/constants/error-code.enum.ts)
 * มีเฉพาะ error ที่ client ต้อง "ทำอะไรต่างออกไป" — ไม่ใช่แค่แสดงข้อความต่างกัน
 */
export const ERROR_CODE = {
  /**
   * PIN (actor) token หมด/ไม่ถูกต้อง — เป็น identity ชั้นรอง session หลักอาจยังดีอยู่
   * ห้าม refresh session และห้าม redirect ไป /login — ให้ขอ PIN ใหม่แล้วลองต่อที่เดิม
   */
  ACTOR_TOKEN_INVALID: 'ACTOR_TOKEN_INVALID',
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  /** HTTP label — "Unauthorized", "Conflict", … */
  error: string;
  /** มีเฉพาะ error ที่ต้องแยกแยะด้วยเครื่อง — ดู ERROR_CODE */
  code?: ErrorCode;
  timestamp: string;
  path: string;
}

const STATUS_LABEL: Record<number, string> = {
  400: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  401: 'หมดเซสชัน กรุณาเข้าสู่ระบบใหม่',
  403: 'ไม่มีสิทธิ์ดำเนินการนี้',
  404: 'ไม่พบข้อมูลที่ร้องขอ อาจถูกลบไปแล้ว',
  409: 'ข้อมูลนี้มีอยู่ในระบบแล้ว ไม่สามารถบันทึกซ้ำได้',
  422: 'ไม่สามารถดำเนินการได้ในขณะนี้',
  500: 'เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่ภายหลัง',
  503: 'บริการไม่พร้อมใช้งาน กรุณาลองใหม่ภายหลัง',
};

/**
 * Parse error from any source → ข้อความภาษาไทยสำหรับแสดงผู้ใช้
 * - รองรับ Axios error ตาม API.md error shape
 * - รองรับ network error / timeout
 * - รองรับ array message (validation errors)
 */
export function getErrorMessage(err: unknown, fallback = 'เกิดข้อผิดพลาด'): string {
  if (!err) return fallback;

  // Network errors / no response
  if (isAxiosError(err)) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ — ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'หมดเวลาเชื่อมต่อ — กรุณาลองใหม่';
    }
    const data = err.response?.data as Partial<ApiErrorBody> | undefined;
    const status = err.response?.status;

    // API error body
    if (data?.message) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      if (msg && msg.trim().length > 0) return msg;
    }

    // Status fallback
    if (status && STATUS_LABEL[status]) return STATUS_LABEL[status];
    if (status) return `เกิดข้อผิดพลาด (${status})`;

    return err.message || fallback;
  }

  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err;
  return fallback;
}

/** Status code จาก error (ถ้าเป็น axios) */
export function getErrorStatus(err: unknown): number | null {
  return isAxiosError(err) ? err.response?.status ?? null : null;
}

/**
 * Machine-readable code จาก error body — null ถ้า backend ไม่ได้ติดมา
 * ใช้แยกประเภท error ด้วยเครื่อง แทนการ match ข้อความ (ข้อความเปลี่ยนเมื่อไหร่ก็พัง)
 */
export function getErrorCode(err: unknown): ErrorCode | null {
  if (!isAxiosError(err)) return null;
  const data = err.response?.data as Partial<ApiErrorBody> | undefined;
  return data?.code ?? null;
}

/**
 * แสดง error toast — ใช้ใน onError ของ mutation
 * รับ prefix optional เพื่อบอก context (เช่น "ลบสินค้า")
 */
export function showError(err: unknown, prefix?: string): void {
  console.error(`[${prefix ?? 'Error'}]`, err);
  const detail = getErrorMessage(err);
  notify.error(prefix ? `${prefix}ไม่สำเร็จ` : 'เกิดข้อผิดพลาด', detail);
}

/**
 * สร้าง onError handler สำเร็จรูปสำหรับ mutation
 *
 * @example
 *   useMutation({ onError: handleError('ลบสินค้า') })
 */
export function handleError(prefix?: string) {
  return (err: unknown) => showError(err, prefix);
}
