import { toast } from 'sonner';

/**
 * App-wide notification API (Sonner-backed).
 * API คงเดิมจากเวอร์ชัน antd — ผู้เรียกไม่ต้องแก้
 * mount `<Toaster/>` (จาก sonner โดยตรง — ตั้งค่าไว้ใน app/App.tsx) ที่ root หนึ่งครั้ง
 */

// duration เป็น ms · error = ค้างไว้จนผู้ใช้ปิดเอง (เหมือน antd duration:0)
const DURATION = { success: 4000, warning: 6000, error: Infinity } as const;

type ResolveType = 'success' | 'warning' | 'error';

// Snackbar (toast + action) ต้องอยู่นานพอให้ผู้ใช้กด — undo ~6s, retry ค้างจนกด
const ACTION_DURATION = { success: 6000, info: 6000, warning: 8000, error: Infinity } as const;

type ActionType = keyof typeof ACTION_DURATION;

let _seq = 0;

const TOAST_FN: Record<ResolveType, typeof toast.success> = {
  success: toast.success,
  warning: toast.warning,
  error: toast.error,
};

const ACTION_FN: Record<ActionType, typeof toast.success> = {
  success: toast.success,
  info: toast.info,
  warning: toast.warning,
  error: toast.error,
};

export interface SnackbarOptions {
  /** ป้ายปุ่ม action เช่น "เลิกทำ" / "ลองใหม่" / "ดู" */
  actionLabel: string;
  /** เรียกเมื่อกด action — toast ปิดเองหลังกด */
  onAction: () => void;
  type?: ActionType;
  description?: string;
  /** override อายุ toast (ms) — default ตาม type */
  duration?: number;
}

/** Snackbar core — module-level เพื่อให้ undo/retry เรียกได้โดยไม่พึ่ง `this` */
function fireAction(title: string, opts: SnackbarOptions): string {
  const id = `notify-${++_seq}`;
  const type = opts.type ?? 'info';
  ACTION_FN[type](title, {
    id,
    description: opts.description,
    duration: opts.duration ?? ACTION_DURATION[type],
    action: { label: opts.actionLabel, onClick: opts.onAction },
  });
  return id;
}

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

  /**
   * Snackbar — แจ้งผล + ปุ่ม action เดียว (Undo/Retry/View)
   * ใช้เมื่อผลลัพธ์ "ย้อนกลับได้" หรือ "ลองใหม่ได้" — ไม่ใช่ error สำคัญที่ต้องหยุด (นั่นใช้ Dialog)
   */
  action: fireAction,

  /**
   * Snackbar สำเร็จรูป: "<title> — เลิกทำ"
   * Pattern: ทำ action ทันที (optimistic/ลบจริง) แล้วเปิดช่องให้ย้อนกลับ — ดีกว่า confirm ทุกครั้ง
   */
  undo(title: string, onUndo: () => void, description?: string): string {
    return fireAction(title, { actionLabel: 'เลิกทำ', onAction: onUndo, type: 'success', description });
  },

  /** Snackbar สำเร็จรูป: "<title> — ลองใหม่" (error ที่ลองซ้ำได้ เช่น network) */
  retry(title: string, onRetry: () => void, description?: string): string {
    return fireAction(title, { actionLabel: 'ลองใหม่', onAction: onRetry, type: 'error', description });
  },
};
