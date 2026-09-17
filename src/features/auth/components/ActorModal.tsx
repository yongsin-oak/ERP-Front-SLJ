import { useState, useEffect } from "react";
import { Dialog } from "radix-ui";
import { showError } from "@shared";
import { EmployeeSearchSelect } from '@features/employee/components/EmployeeSearchSelect';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  TEXT,
} from '@/lib/styles';
import { authService } from "../react-query/services";
import { useActorModal, useActor } from "../stores";

const PIN_MIN = 4;
const PIN_MAX = 4;

const KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "clear",
  "0",
  "back",
];

const KEY_BASE =
  'flex h-[50px] select-none items-center justify-center rounded-[10px] border-[1.5px] border-border-strong text-xl font-semibold outline-none transition-[background,transform] duration-100 [-webkit-tap-highlight-color:transparent] hover:bg-accent active:scale-[0.93] disabled:cursor-not-allowed disabled:opacity-35 disabled:transform-none';

const KEY_VARIANT: Record<'danger' | 'muted' | 'default', string> = {
  danger: 'bg-error-bg text-error',
  muted: 'bg-accent text-foreground',
  default: 'bg-card text-foreground',
};

/* ── main ────────────────────────────────────────── */
export function ActorModal() {
  // selector ทีละค่า — ActorModal ถูก mount ค้างไว้ใน AppLayout ตลอดอายุแอป
  const open = useActorModal((s) => s.open);
  const confirm = useActorModal((s) => s.confirm);
  const cancel = useActorModal((s) => s.cancel);
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleKey(k: string) {
    setError("");
    if (k === "clear") return setPin("");
    if (k === "back") return setPin((p) => p.slice(0, -1));
    if (pin.length >= PIN_MAX) return;

    const next = pin + k;
    setPin(next);
    // กรอกครบ PIN_MAX หลัก + เลือกพนักงานแล้ว → ยืนยันอัตโนมัติ (Operator ไม่ต้องกดปุ่มซ้ำ)
    // ยังไม่เลือกพนักงาน = ไม่ยิง (กันขึ้น error ทั้งที่แค่กรอก PIN ก่อน)
    if (next.length === PIN_MAX && employeeId && !loading) void handleConfirm(next);
  }

  // pinValue / empId รับค่าล่าสุดตรง ๆ ได้ เพราะ auto-confirm ยิงก่อน state รอบใหม่จะ commit
  async function handleConfirm(pinValue = pin, empId = employeeId) {
    if (!empId) {
      setError("กรุณาเลือกพนักงาน");
      return;
    }
    if (pinValue.length < PIN_MIN) {
      setError(`กรุณากรอก PIN อย่างน้อย ${PIN_MIN} หลัก`);
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyPin(empId, pinValue);
      useActor.getState().setActor(res.data.data);
      confirm();
    } catch (err) {
      setPin("");
      showError(err, "ยืนยันตัวตน");
    } finally {
      setLoading(false);
    }
  }

  const canConfirm = !!employeeId && pin.length >= PIN_MIN;

  // รองรับการพิมพ์ PIN ด้วยคีย์บอร์ดจริง (นอกจากกดปุ่มบนจอ):
  // เลข 0-9 = เพิ่มหลัก · Backspace = ลบ · Enter = ยืนยัน
  // ข้ามเมื่อ focus อยู่ในช่องพิมพ์ (เช่น ค้นหาพนักงาน) เพื่อไม่ชนกัน
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement as HTMLElement | null;
      const inField = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
      if (e.key === "Enter") {
        if (!inField && canConfirm && !loading) {
          e.preventDefault();
          void handleConfirm();
        }
        return;
      }
      if (inField) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("back");
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKey(e.key);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, canConfirm, loading, employeeId, pin]);

  // ล้างค่าทุกครั้งที่ปิด — โมดัลนี้ mount ค้างไว้ตลอดอายุแอป ถ้าไม่ล้าง
  // การยืนยันครั้งถัดไปจะเห็น PIN กับพนักงานของครั้งก่อนค้างอยู่
  useEffect(() => {
    if (open) return;
    setPin("");
    setEmployeeId("");
    setError("");
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && cancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content
          className={cn(DIALOG_CONTENT, 'max-w-85 gap-3')}
          aria-describedby={undefined}
        >
          <Dialog.Title className={cn(DIALOG_TITLE, 'flex items-center gap-2')}>
            <AppIcons.lock className="text-primary" />
            ยืนยันตัวตนพนักงาน
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          {/* employee */}
          <div className="flex flex-col gap-1.5">
            <span className={cn(TEXT.subtle, 'flex items-center gap-1')}>
              <AppIcons.user />
              พนักงาน
            </span>
            <EmployeeSearchSelect
              placeholder="เลือกพนักงาน"
              value={employeeId || undefined}
              onChange={(v) => {
                const next = v ?? '';
                setEmployeeId(next);
                setError("");
                // ปล่อย focus ออกจาก select เพื่อให้พิมพ์ PIN ด้วยคีย์บอร์ดได้ทันที
                requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
                // กรอก PIN ครบก่อนแล้วค่อยเลือกพนักงาน → ยืนยันอัตโนมัติเช่นกัน
                if (pin.length === PIN_MAX && !loading && next) void handleConfirm(pin, next);
              }}
            />
          </div>

          {/* PIN dots (show up to PIN_MAX slots, filled = entered digits) */}
          <span className={cn(TEXT.subtle, 'flex items-center gap-1')}>
            <AppIcons.lock />
            PIN ({PIN_MAX} หลัก) · พิมพ์ด้วยคีย์บอร์ดได้
          </span>
          <div className="mb-1 flex justify-center gap-2.5">
            {Array.from({ length: PIN_MAX }).map((_, i) => {
              const filled = i < pin.length;
              const active = i === pin.length;
              return (
                <div
                  key={i}
                  className={cn(
                    'size-3.5 rounded-full border-2 transition-all duration-100',
                    active || filled ? 'border-primary' : 'border-border-strong',
                    filled ? 'bg-primary scale-115' : 'bg-transparent scale-100',
                  )}
                />
              );
            })}
          </div>

          {error && (
            <div role="alert" className={alertBox('danger')}>
              <AppIcons.alert />
              <span>{error}</span>
            </div>
          )}

          {/* keypad */}
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => {
              const variant =
                k === "clear" ? "danger" : k === "back" ? "muted" : "default";
              return (
                <button
                  key={k}
                  type="button"
                  disabled={loading}
                  className={cn(KEY_BASE, KEY_VARIANT[variant])}
                  onClick={() => handleKey(k)}
                  aria-label={k}
                >
                  {k === "back" ?
                    "⌫"
                  : k === "clear" ?
                    "C"
                  : k}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={cn(btn('primary', 'lg'), 'mt-1 w-full')}
            disabled={!canConfirm || loading}
            onClick={() => void handleConfirm()}
          >
            {loading && <AppIcons.loading spin />}
            ยืนยัน
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
