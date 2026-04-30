import { message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks';
import { Button, Form, Input, InputPassword, Card, Title } from '@design-system';
import { colors } from '@design-system';

export function LoginPage() {
  const { login, isAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const from = (location.state as { from?: string })?.from ?? '/inventory';

  useEffect(() => {
    if (isAuth) navigate(from, { replace: true });
  }, [isAuth, navigate, from]);

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch {
      message.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg.layout,
      }}
    >
      <Card style={{ width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: colors.brand.primary,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <LockOutlined style={{ color: '#fff', fontSize: 22 }} />
          </div>
          <Title level={4} style={{ margin: 0 }}>
            SLJ ERP
          </Title>
          <p style={{ color: colors.text.secondary, margin: '4px 0 0', fontSize: 13 }}>
            เข้าสู่ระบบ
          </p>
        </div>

        <Form form={form} onFinish={handleSubmit}>
          <Form.Item name="username" rules={[{ required: true, message: 'กรุณากรอกชื่อผู้ใช้' }]}>
            <Input prefix={<UserOutlined />} placeholder="ชื่อผู้ใช้" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}>
            <InputPassword prefix={<LockOutlined />} placeholder="รหัสผ่าน" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              variant="primary"
              htmlType="submit"
              size="large"
              block
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
