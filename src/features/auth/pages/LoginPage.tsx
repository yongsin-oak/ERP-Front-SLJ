import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../stores';
import { useLoginTerminals } from '../react-query';
import { Button, Form, Input, InputPassword, Segmented, Select, Title, AppIcons } from '@design-system';
import { showError } from '@shared';
import { resolveRedirect } from '@config/access';

type LoginMode = 'staff' | 'terminal';

/* ── safe redirect ─────────────────────────────────── */
const SAFE_PATH = /^\/[A-Za-z0-9/_\-?=&%.]*$/;

/** path ที่ถูกเด้งมาจากหน้าที่ต้อง login ก่อน — null ถ้าไม่มี (ให้ผู้เรียกเลือก landing ตามประเภทผู้ใช้) */
function resolveFrom(value: string | undefined | null): string | null {
  if (!value || !SAFE_PATH.test(value) || value.startsWith('/login')) return null;
  return value;
}

/* ── brand ─────────────────────────────────────────── */
const APP_NAME = 'SLJ Supply Center';
/** ไฟล์ใน public/ — เสิร์ฟที่ root ไม่ต้อง import ผ่าน bundler */
const LOGO_SRC = '/slj-supply-logo.webp';

/** ป้ายในปุ่ม Segmented — span แทน div เพราะอยู่ใน <button> */
function ModeLabel({ icon: Icon, children }: { icon: typeof AppIcons.user; children: string }) {
  return (
    <span className="flex items-center justify-center gap-1.5">
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

/* ── main ───────────────────────────────────────────── */
export function LoginPage() {
  // selector ทีละค่า — subscribe เท่าที่ใช้ (ดูเหตุผลใน PrivateRoute)
  const login = useAuth((s) => s.login);
  const loginTerminal = useAuth((s) => s.loginTerminal);
  const isAuth = useAuth((s) => s.isAuth);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [staffForm] = Form.useForm<{ username: string; password: string }>();
  const [terminalForm] = Form.useForm<{ terminalCode: string; password: string }>();

  const stateFrom = (location.state as { from?: string } | null)?.from;
  const from = resolveFrom(stateFrom ?? params.get('from'));

  const [mode, setMode] = useState<LoginMode>('terminal');
  const [submitting, setSubmitting] = useState(false);

  const {
    data: terminals,
    isLoading: loadingTerminals,
    isError: terminalsError,
    refetch: refetchTerminals,
  } = useLoginTerminals();

  const terminalOptions = useMemo(
    () =>
      (terminals ?? []).map((t) => ({
        value: t.terminalCode,
        label: (
          <span className="flex items-center gap-2">
            <span className="font-mono">{t.terminalCode}</span>
            <span className="truncate text-foreground-lighter">{t.name}</span>
          </span>
        ),
      })),
    [terminals],
  );

  useEffect(() => {
    if (isAuth) navigate(resolveRedirect(user, from), { replace: true });
  }, [isAuth, navigate, from, user]);

  /* ── staff login ── */
  async function handleStaffSubmit(values: { username: string; password: string }) {
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      // อ่าน user จาก store โดยตรง — state ใน closure นี้ยังเป็นค่าก่อน login
      navigate(resolveRedirect(useAuth.getState().user, from), { replace: true });
    } catch (err) {
      showError(err, 'เข้าสู่ระบบ');
    } finally {
      setSubmitting(false);
    }
  }

  /* ── terminal login ── */
  async function handleTerminalSubmit(values: { terminalCode: string; password: string }) {
    setSubmitting(true);
    try {
      await loginTerminal(values.terminalCode.trim(), values.password);
      navigate(resolveRedirect(useAuth.getState().user, from), { replace: true });
    } catch (err) {
      showError(err, 'เข้าสู่ระบบด้วย Terminal');
    } finally {
      setSubmitting(false);
    }
  }

  function handleModeChange(v: LoginMode) {
    setMode(v);
    staffForm.resetFields();
    terminalForm.resetFields();
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        {/* ── โลโก้ ─────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          {/* ไฟล์เป็น webp ทึบ (พื้นขาวติดมาในภาพ) → ครอบเป็นไทล์มีขอบ ให้ดูตั้งใจทั้ง light/dark */}
          <img
            src={LOGO_SRC}
            alt={APP_NAME}
            width={56}
            height={56}
            className="size-14 rounded-lg border border-border object-cover"
          />
          <span className="text-sm text-foreground-lighter">{APP_NAME}</span>
        </div>

        {/* ── ฟอร์ม ─────────────────────────────────── */}
        <div className="mt-6 rounded-lg border border-border bg-background p-6 sm:p-8">
          <Title level={3} className="text-center">เข้าสู่ระบบ</Title>

          <Segmented
            className="mt-6"
            size="large"
            block
            value={mode}
            onChange={(v) => handleModeChange(v as LoginMode)}
            options={[
              { value: 'terminal', label: <ModeLabel icon={AppIcons.terminal}>เครื่องยิงออเดอร์</ModeLabel> },
              { value: 'staff', label: <ModeLabel icon={AppIcons.user}>เจ้าหน้าที่</ModeLabel> },
            ]}
          />

          <div className="mt-6">
            {mode === 'terminal' ? (
              <Form form={terminalForm} onFinish={handleTerminalSubmit}>
                <Form.Item
                  name="terminalCode"
                  label="เครื่อง"
                  rules={[{ required: true, message: 'กรุณาเลือกเครื่อง' }]}
                  extra={
                    terminalsError ? (
                      <span className="flex items-center gap-1.5 text-error-text">
                        โหลดรายชื่อเครื่องไม่สำเร็จ
                        <button
                          type="button"
                          className="underline underline-offset-2 hover:text-foreground"
                          onClick={() => void refetchTerminals()}
                        >
                          ลองใหม่
                        </button>
                      </span>
                    ) : undefined
                  }
                >
                  <Select
                    size="large"
                    placeholder="เลือกเครื่องที่ใช้งาน"
                    options={terminalOptions}
                    loading={loadingTerminals}
                    showSearch
                    notFoundContent={loadingTerminals ? 'กำลังโหลด…' : 'ไม่พบเครื่องที่ใช้งานอยู่'}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="รหัสผ่านเครื่อง"
                  rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน Terminal' }]}
                >
                  <InputPassword size="large" autoComplete="current-password" />
                </Form.Item>

                {/* h-11 = 44px ตาม UX bar สำหรับหน้าจอที่ Operator/Warehouse ใช้ทุกกะ */}
                <Button variant="primary" htmlType="submit" size="large" block loading={submitting} className="mt-2 h-11">
                  เข้าสู่ระบบ
                </Button>
              </Form>
            ) : (
              <Form form={staffForm} onFinish={handleStaffSubmit}>
                <Form.Item
                  name="username"
                  label="ชื่อผู้ใช้"
                  rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}
                >
                  <Input size="large" autoComplete="username" autoFocus />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="รหัสผ่าน"
                  rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
                >
                  <InputPassword size="large" autoComplete="current-password" />
                </Form.Item>

                <Button variant="primary" htmlType="submit" size="large" block loading={submitting} className="mt-2 h-11">
                  เข้าสู่ระบบ
                </Button>
              </Form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-foreground-muted">
          ลืมรหัสผ่านหรือเข้าไม่ได้ — ติดต่อผู้ดูแลระบบ
        </p>
      </div>
    </div>
  );
}
