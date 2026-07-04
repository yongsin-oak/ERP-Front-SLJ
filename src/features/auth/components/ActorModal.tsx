import { useState } from "react";
import { Modal, Select, Button, Alert, Inline, Text, AppIcons } from '@design-system';
import { showError } from "@shared";
import { useEmployees } from "@features/employee/react-query";
import { authService } from "../react-query/services";
import { useActorModal } from "../stores";
import { cn } from '@/lib/utils';

const PIN_MIN = 4;
const PIN_MAX = 6;

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
  const { open, confirm, cancel } = useActorModal();
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: employees = [] } = useEmployees();


  function handleKey(k: string) {
    setError("");
    if (k === "clear") return setPin("");
    if (k === "back") return setPin((p) => p.slice(0, -1));
    if (pin.length < PIN_MAX) setPin((p) => p + k);
  }

  async function handleConfirm() {
    if (!employeeId) {
      setError("กรุณาเลือกพนักงาน");
      return;
    }
    if (pin.length < PIN_MIN) {
      setError(`กรุณากรอก PIN อย่างน้อย ${PIN_MIN} หลัก`);
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyPin(employeeId, pin);
      confirm(res.data.data.actorToken);
    } catch (err) {
      setPin("");
      showError(err, "ยืนยันตัวตน");
    } finally {
      setLoading(false);
    }
  }

  const employeeOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.nickname})`,
    value: e.id,
  }));

  const canConfirm = !!employeeId && pin.length >= PIN_MIN;

  return (
    <Modal
      open={open}
      title={
        <Inline>
          <AppIcons.lock className="text-primary" />
          ยืนยันตัวตนพนักงาน
        </Inline>
      }
      onCancel={cancel}
      footer={null}
      width={340}
      destroyOnHidden
      centered
    >
      {/* employee */}
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <AppIcons.user style={{ marginRight: 4 }} />
          พนักงาน
        </Text>
        <Select
          style={{ width: "100%", marginTop: 6 }}
          options={employeeOptions}
          placeholder="เลือกพนักงาน"
          showSearch={{ optionFilterProp: "label" }}
          value={employeeId || undefined}
          onChange={(v) => {
            setEmployeeId(v as string);
            setError("");
          }}
        />
      </div>

      {/* PIN dots (show up to PIN_MAX slots, filled = entered digits) */}
      <Text type="secondary" style={{ fontSize: 12 }}>
        <AppIcons.lock style={{ marginRight: 4 }} />
        PIN ({PIN_MIN}–{PIN_MAX} หลัก)
      </Text>
      <div className="flex justify-center gap-2.5 mt-3.5 mb-4.5">
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
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 12, fontSize: 13 }}
        />
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

      <Button
        variant="primary"
        block
        style={{ marginTop: 14, height: 44 }}
        loading={loading}
        disabled={!canConfirm}
        onClick={handleConfirm}
      >
        ยืนยัน
      </Button>
    </Modal>
  );
}
