import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Segmented, Typography, Space, Alert } from 'antd';
import { LockOutlined, UserOutlined, DesktopOutlined, DeleteOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import { useAuth } from '../hooks';
import { Button, Form, Input, InputPassword, Card } from '@design-system';
import { colors } from '@design-system';
import { showError } from '@lib';

const { Title, Text } = Typography;

type LoginMode = 'staff' | 'terminal';

/* ── terminal numpad ───────────────────────────────── */
const NumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const NumKey = styled.button<{ variant?: 'muted' }>`
  height: 54px;
  border: 1.5px solid ${colors.border.strong};
  border-radius: 10px;
  background: ${({ variant }) => variant === 'muted' ? colors.bg.hover : colors.bg.base};
  color: ${colors.text.primary};
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, transform 0.08s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover  { background: ${colors.bg.hover}; }
  &:active { transform: scale(0.93); background: ${colors.bg.active}; }
  &:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
`;

const TerminalDisplay = styled.div`
  background: ${colors.neutral[100]};
  border: 1.5px solid ${colors.border.strong};
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 6px;
  text-align: center;
  min-height: 60px;
  color: ${colors.text.primary};
  font-family: 'SF Mono', 'Fira Code', monospace;
`;

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','back','0','clear'];

/* ── safe redirect ─────────────────────────────────── */
const SAFE_PATH = /^\/[A-Za-z0-9/_\-?=&%.]*$/;

function resolveFrom(value: string | undefined | null): string {
  if (!value || !SAFE_PATH.test(value) || value.startsWith('/login')) return '/dashboard';
  return value;
}

/* ── logo block ─────────────────────────────────────── */
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
        boxShadow: `0 4px 14px ${colors.brand.primary}44`,
      }}>
        <LockOutlined style={{ color: '#fff', fontSize: 24 }} />
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
  const [form] = Form.useForm();

  const stateFrom = (location.state as { from?: string } | null)?.from;
  const from = resolveFrom(stateFrom ?? params.get('from'));

  const [mode, setMode] = useState<LoginMode>('staff');
  const [submitting, setSubmitting] = useState(false);
  const [terminalCode, setTerminalCode] = useState('');
  const [terminalError, setTerminalError] = useState('');

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

  /* ── terminal numpad ── */
  function handleNumKey(k: string) {
    setTerminalError('');
    if (k === 'clear') return setTerminalCode('');
    if (k === 'back')  return setTerminalCode((c) => c.slice(0, -1));
    if (terminalCode.length < 12) setTerminalCode((c) => c + k);
  }

  async function handleTerminalLogin() {
    if (!terminalCode.trim()) { setTerminalError('กรุณากรอกรหัสเครื่อง'); return; }
    setSubmitting(true);
    try {
      await loginTerminal(terminalCode.trim());
      navigate(from, { replace: true });
    } catch (err) {
      showError(err, 'เข้าสู่ระบบด้วย Terminal');
      setTerminalCode('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${colors.brand.primary}12 0%, ${colors.bg.layout} 60%)`,
    }}>
      <Card style={{ width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', borderRadius: 16 }}>
        <Logo />

        {/* mode toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Segmented
            value={mode}
            onChange={(v) => { setMode(v as LoginMode); setTerminalCode(''); setTerminalError(''); form.resetFields(); }}
            options={[
              { label: <Space><UserOutlined />เจ้าหน้าที่</Space>, value: 'staff' },
              { label: <Space><DesktopOutlined />Terminal</Space>, value: 'terminal' },
            ]}
            size="middle"
            style={{ width: '100%' }}
            block
          />
        </div>

        {/* ── staff form ── */}
        {mode === 'staff' && (
          <Form form={form} onFinish={handleStaffSubmit}>
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

        {/* ── terminal mode ── */}
        {mode === 'terminal' && (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <DesktopOutlined style={{ marginRight: 4 }} />รหัสเครื่อง (Terminal Code)
            </Text>

            <TerminalDisplay style={{ marginTop: 8 }}>
              {terminalCode || <span style={{ color: colors.text.disabled, letterSpacing: 2, fontSize: 16 }}>กรอกรหัสเครื่อง</span>}
            </TerminalDisplay>

            {terminalError && (
              <Alert type="error" message={terminalError} showIcon style={{ marginTop: 10, fontSize: 13 }} />
            )}

            <NumGrid style={{ marginTop: 12 }}>
              {NUMPAD_KEYS.map((k) => (
                <NumKey
                  key={k}
                  type="button"
                  disabled={submitting}
                  variant={k === 'back' || k === 'clear' ? 'muted' : undefined}
                  onClick={() => handleNumKey(k)}
                  aria-label={k}
                >
                  {k === 'back'  ? <DeleteOutlined style={{ fontSize: 18 }} /> :
                   k === 'clear' ? 'C' : k}
                </NumKey>
              ))}
            </NumGrid>

            <Button
              variant="primary"
              block
              size="large"
              style={{ marginTop: 16 }}
              loading={submitting}
              disabled={!terminalCode}
              onClick={handleTerminalLogin}
            >
              เข้าสู่ระบบด้วย Terminal
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
