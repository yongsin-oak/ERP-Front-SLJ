import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Segmented, Typography, Space } from 'antd';
import { LockOutlined, UserOutlined, DesktopOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useAuth } from '../hooks';
import { Button, Form, Input, InputPassword, Card } from '@design-system';
import { colors } from '@design-system';
import { showError } from '@lib';

const { Text } = Typography;

type LoginMode = 'staff' | 'terminal';

const TerminalCodeDisplay = styled.div`
  background: ${colors.neutral[100]};
  border: 1.5px solid ${colors.border.strong};
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 4px;
  text-align: center;
  min-height: 54px;
  color: ${colors.text.primary};
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
`;

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
      <div style={{
        width: 52, height: 52,
        background: colors.brand.primary,
        borderRadius: 14,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        boxShadow: `0 4px 16px ${colors.brand.primary}44`,
      }}>
        <LockOutlined style={{ color: '#fff', fontSize: 24 }} />
      </div>
      <Typography.Title level={4} style={{ margin: 0, fontSize: 20 }}>SLJ ERP</Typography.Title>
    </div>
  );
}

/* ── main ───────────────────────────────────────────── */
export function LoginPage() {
  const { login, loginTerminal, isAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [staffForm] = Form.useForm();
  const [terminalForm] = Form.useForm();

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${colors.brand.primary}10 0%, ${colors.bg.layout} 60%)`,
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', borderRadius: 16 }}>
        <Logo />

        {/* mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Segmented
            value={mode}
            onChange={(v) => handleModeChange(v as LoginMode)}
            options={[
              { label: <Space><UserOutlined />เจ้าหน้าที่</Space>,   value: 'staff' },
              { label: <Space><DesktopOutlined />Terminal</Space>, value: 'terminal' },
            ]}
            block
          />
        </div>

        {/* ── staff form ── */}
        {mode === 'staff' && (
          <Form form={staffForm} onFinish={handleStaffSubmit}>
            <Form.Item name="username" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}>
              <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้" size="large" autoComplete="username" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
              <InputPassword prefix={<LockOutlined />} placeholder="รหัสผ่าน" size="large" autoComplete="current-password" />
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
              <DesktopOutlined style={{ marginRight: 4 }} />Terminal Code
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
                prefix={<LockOutlined />}
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
                const code = getFieldValue('terminalCode');
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
