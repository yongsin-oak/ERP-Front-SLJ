import { toast } from 'sonner';

/**
 * App-wide notification API (Sonner-backed).
 * API คงเดิมจากเวอร์ชัน antd — ผู้เรียกไม่ต้องแก้
 * mount `<Toaster/>` (จาก @/components/ui/sonner) ที่ root หนึ่งครั้ง
 */

// duration เป็น ms · error = ค้างไว้จนผู้ใช้ปิดเอง (เหมือน antd duration:0)
const DURATION = { success: 4000, warning: 6000, error: Infinity } as const;

type ResolveType = keyof typeof DURATION;

let _seq = 0;

const TOAST_FN: Record<ResolveType, typeof toast.success> = {
  success: toast.success,
  warning: toast.warning,
  error: toast.error,
};

export const notify = {
  success(title: string, description?: string) {
    toast.success(title, { description, duration: DURATION.success });
  },

  warning(title: string, description?: string) {
    toast.warning(title, { description, duration: DURATION.warning });
  },

  error(title: string, description?: string) {
    toast.error(title, { description, duration: DURATION.error });
  },

  /** Returns an id — pass to `resolve()` or `dismiss()` when done */
  loading(title: string, description?: string): string {
    const id = `notify-${++_seq}`;
    toast.loading(title, { id, description, duration: Infinity });
    return id;
  },

  /** Replace a loading toast in-place with the final result */
  resolve(id: string, type: ResolveType, title: string, description?: string) {
    TOAST_FN[type](title, { id, description, duration: DURATION[type] });
  },

  dismiss(id: string) {
    toast.dismiss(id);
  },
};
