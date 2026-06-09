import { useState } from "react";
import { Modal, Space, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Select, Button } from "@design-system";
import { colors } from "@design-system";
import { showError } from "@shared";
import { useEmployees } from "@features/employee/react-query";
import { authService } from "../react-query/services";
import { useActorModal } from "../stores";

const { Text } = Typography;

const PIN_MIN = 4;
const PIN_MAX = 6;

/* ── PIN dots display ─────────────────────────────── */
const DotsRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 14px 0 18px;
`;

const Dot = styled.div<{ filled: boolean; active: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid
    ${({ filled, active }) =>
      active ? colors.brand.primary
      : filled ? colors.brand.primary
      : colors.border.strong};
  background: ${({ filled }) =>
    filled ? colors.brand.primary : "transparent"};
  transition: all 0.12s;
  transform: ${({ filled }) => (filled ? "scale(1.15)" : "scale(1)")};
`;

/* ── keypad ───────────────────────────────────────── */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const Key = styled.button<{ variant?: "danger" | "muted" }>`
  height: 50px;
  border: 1.5px solid ${colors.border.strong};
  border-radius: 10px;
  background: ${({ variant }) =>
    variant === "danger" ? colors.semantic.errorBg
    : variant === "muted" ? colors.bg.hover
    : colors.bg.base};
  color: ${({ variant }) =>
    variant === "danger" ? colors.semantic.error : colors.text.primary};
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.12s,
    transform 0.08s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${colors.bg.hover};
  }
  &:active {
    transform: scale(0.93);
  }
  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    transform: none;
  }
`;

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
        <Space>
          <LockOutlined style={{ color: colors.brand.primary }} />
          ยืนยันตัวตนพนักงาน
        </Space>
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
          <UserOutlined style={{ marginRight: 4 }} />
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
        <LockOutlined style={{ marginRight: 4 }} />
        PIN ({PIN_MIN}–{PIN_MAX} หลัก)
      </Text>
      <DotsRow>
        {Array.from({ length: PIN_MAX }).map((_, i) => (
          <Dot key={i} filled={i < pin.length} active={i === pin.length} />
        ))}
      </DotsRow>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 12, fontSize: 13 }}
        />
      )}

      {/* keypad */}
      <Grid>
        {KEYS.map((k) => (
          <Key
            key={k}
            type="button"
            disabled={loading}
            variant={
              k === "clear" ? "danger"
              : k === "back" ?
                "muted"
              : undefined
            }
            onClick={() => handleKey(k)}
            aria-label={k}
          >
            {k === "back" ?
              "⌫"
            : k === "clear" ?
              "C"
            : k}
          </Key>
        ))}
      </Grid>

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
