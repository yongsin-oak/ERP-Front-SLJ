import { useState } from 'react';
import { Card, Form, Input, Tag, Flex, Typography } from 'antd';
import { PageHeader, Button , AppIcons } from '@design-system';
import { colors } from '@design-system';
import { useAuth, authService } from '@features/auth';
import { handleError } from '@shared';

const { Text } = Typography;

const ROLE_COLOR: Record<string, string> = {
  SuperAdmin: 'red', Admin: 'orange', Operator: 'blue', Warehouse: 'cyan',
  Accountant: 'green', HR: 'purple', Marketing: 'magenta', Sales: 'gold',
};

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage() {
  const user = useAuth((s) => s.user);
  const [form] = Form.useForm<PasswordForm>();
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(values: PasswordForm) {
    if (values.newPassword !== values.confirmPassword) {
      form.setFields([{ name: 'confirmPassword', errors: ['รหัสผ่านไม่ตรงกัน'] }]);
      return;
    }
    setSaving(true);
    try {
      await authService.updatePassword(values.currentPassword, values.newPassword);
      form.resetFields();
    } catch (err) {
      handleError('เปลี่ยนรหัสผ่าน')(err as Error);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  const displayName = user.name ?? user.username ?? user.terminalCode ?? '-';

  return (
    <Flex vertical gap={20}>
      <PageHeader title="โปรไฟล์" subtitle="ข้อมูลบัญชีและการตั้งค่าความปลอดภัย" />

      <Card size="small" title={<Flex gap={8} align="center"><AppIcons.user /> ข้อมูลบัญชี</Flex>}>
        <Flex vertical gap={12} style={{ padding: '4px 0' }}>
          <InfoRow label="ชื่อ" value={displayName} />
          {user.username && <InfoRow label="Username" value={<code style={{ fontSize: 13 }}>{user.username}</code>} />}
          {user.terminalCode && <InfoRow label="Terminal Code" value={<code style={{ fontSize: 13 }}>{user.terminalCode}</code>} />}
          <InfoRow
            label="บทบาท"
            value={
              <Tag color={ROLE_COLOR[user.role] ?? 'default'} style={{ margin: 0 }}>
                {user.isTerminal ? `Terminal · ${user.role}` : user.role}
              </Tag>
            }
          />
        </Flex>
      </Card>

      {!user.isTerminal && (
        <Card size="small" title={<Flex gap={8} align="center"><AppIcons.key /> เปลี่ยนรหัสผ่าน</Flex>}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleChangePassword}
            style={{ maxWidth: 420 }}
            requiredMark="optional"
          >
            <Form.Item
              name="currentPassword"
              label="รหัสผ่านปัจจุบัน"
              rules={[{ required: true, message: 'กรุณากรอกรหัสผ่านปัจจุบัน' }]}
            >
              <Input.Password placeholder="รหัสผ่านปัจจุบัน" autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="รหัสผ่านใหม่"
              rules={[
                { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
                { min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' },
              ]}
            >
              <Input.Password placeholder="รหัสผ่านใหม่" autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="ยืนยันรหัสผ่านใหม่"
              rules={[{ required: true, message: 'กรุณายืนยันรหัสผ่านใหม่' }]}
            >
              <Input.Password placeholder="ยืนยันรหัสผ่านใหม่" autoComplete="new-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button variant="primary" icon={<AppIcons.key />} htmlType="submit" loading={saving}>
                เปลี่ยนรหัสผ่าน
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </Flex>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Flex gap={12} align="center">
      <Text type="secondary" style={{ width: 120, flexShrink: 0, fontSize: 13 }}>{label}</Text>
      <div style={{ fontSize: 13, color: colors.text.primary }}>{value}</div>
    </Flex>
  );
}
