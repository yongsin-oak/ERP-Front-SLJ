import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../stores';
import { Button, Form, Input, InputPassword, Card, Segmented, Inline, Text, Title, AppIcons } from '@design-system';
import { showError } from '@shared';

type LoginMode = 'staff' | 'terminal';

function TerminalCodeDisplay({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-13.5 items-center justify-center rounded-[10px] border-[1.5px] border-border-strong bg-muted px-4 py-3 text-center text-[22px] font-bold tracking-[4px] text-foreground font-['SF_Mono','Fira_Code','Courier_New',monospace]">
      {children}
    </div>
  );
}

/* ── safe redirect ─────────────────────────────────── */
const SAFE_PATH = /^\/[A-Za-z0-9/_\-?=&%.]*$/;

function resolveFrom(value: string | undefined | null): string {
  if (!value || !SAFE_PATH.test(value) || value.startsWith('/login')) return '/dashboard';
  return value;
}

/* ── logo ───────────────────────────────────────────── */
function Logo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <div
        className="mb-3 inline-flex size-13 items-center justify-center rounded-[14px] bg-primary"
        style={{ boxShadow: '0 4px 16px color-mix(in srgb, var(--color-primary) 27%, transparent)' }}
      >
        <AppIcons.lock className="text-primary-foreground" style={{ fontSize: 24 }} />
      </div>
      <Title level={4} style={{ margin: 0, fontSize: 20 }}>SLJ ERP</Title>
    </div>
  );
}

/* ── main ───────────────────────────────────────────── */
export function LoginPage() {
  const { login, loginTerminal, isAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [staffForm] = Form.useForm<{ username: string; password: string }>();
  const [terminalForm] = Form.useForm<{ terminalCode: string; password: string }>();

  const stateFrom = (location.state as { from?: string } | null)?.from;
  const from = resolveFrom(stateFrom ?? params.get('from'));

  const [mode, setMode] = useState<LoginMode>('staff');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuth) navigate(from, { replace: true });
  }, [isAuth, navigate, from]);

  /* ── staff login ── */
  async function handleStaffSubmit(values: { username: string; password: string }) {
    setSubmitting(true);
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
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
      navigate(from, { replace: true });
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
    <div
      className="flex min-h-screen items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 6%, transparent) 0%, var(--color-canvas) 60%)',
      }}
    >
      <Card className="shadow-lg" style={{ width: 400, borderRadius: 16 }}>
        <Logo />

        {/* mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Segmented
            value={mode}
            onChange={(v) => handleModeChange(v as LoginMode)}
            options={[
              { label: <Inline><AppIcons.user />เจ้าหน้าที่</Inline>,   value: 'staff' },
              { label: <Inline><AppIcons.desktop />Terminal</Inline>, value: 'terminal' },
            ]}
            block
          />
        </div>

        {/* ── staff form ── */}
        {mode === 'staff' && (
          <Form form={staffForm} onFinish={handleStaffSubmit}>
            <Form.Item name="username" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}>
              <Input prefix={<AppIcons.user />} placeholder="ชื่อผู้ใช้" size="large" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
              <InputPassword prefix={<AppIcons.lock />} placeholder="รหัสผ่าน" size="large" autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button variant="primary" htmlType="submit" size="large" block loading={submitting}>
                เข้าสู่ระบบ
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* ── terminal form ── */}
        {mode === 'terminal' && (
          <Form form={terminalForm} onFinish={handleTerminalSubmit}>
            <Text type="secondary" style={{ fontSize: 12, marginBottom: 6, display: 'block' }}>
              <AppIcons.desktop style={{ marginRight: 4 }} />Terminal Code
            </Text>
            <Form.Item
              name="terminalCode"
              rules={[{ required: true, message: 'กรุณากรอกรหัสเครื่อง' }]}
            >
              <Input
                size="large"
                placeholder="เช่น POS-01"
                autoComplete="off"
                autoCapitalize="characters"
                style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: 2, textTransform: 'uppercase' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน Terminal' }]}
            >
              <InputPassword
                prefix={<AppIcons.lock />}
                placeholder="รหัสผ่าน Terminal"
                size="large"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button variant="primary" htmlType="submit" size="large" block loading={submitting}>
                เข้าสู่ระบบ Terminal
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* preview box for terminal code (decorative) */}
        {mode === 'terminal' && (
          <div style={{ marginTop: 16 }}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const code = getFieldValue('terminalCode') as string | undefined;
                return code ? (
                  <TerminalCodeDisplay>{code.toUpperCase()}</TerminalCodeDisplay>
                ) : null;
              }}
            </Form.Item>
          </div>
        )}
      </Card>
    </div>
  );
}
