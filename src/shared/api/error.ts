import { isAxiosError } from 'axios';
import { notify } from '../utils/notify';

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
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
 * แสดง error toast — ใช้ใน onError ของ mutation
 * รับ prefix optional เพื่อบอก context (เช่น "ลบสินค้า")
 */
export function showError(err: unknown, prefix?: string): void {
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
