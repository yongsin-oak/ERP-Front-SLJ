import { FormModal, Form, Input, InputPassword, Select } from '@design-system';
import type { Role } from '@features/auth/types';
import type { CreateUserDto } from '../types';

interface Props {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onSubmit: (values: CreateUserDto) => Promise<void>;
  loading?: boolean;
}

export function UserFormModal({ open, roles, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<CreateUserDto>();

  return (
    <FormModal
      open={open}
      title="เพิ่มผู้ใช้งาน"
      onClose={onClose}
      form={form}
      onFinish={(raw) => onSubmit(raw as CreateUserDto)}
      loading={loading}
      submitLabel="เพิ่มผู้ใช้งาน"
      width={480}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'กรุณากรอก username' },
            { min: 3, message: 'ต้องมีอย่างน้อย 3 ตัวอักษร' },
            { pattern: /^[a-zA-Z0-9_.-]+$/, message: 'อนุญาต a-z, 0-9, _, -, . เท่านั้น' },
          ]}
        >
          <Input placeholder="username" autoComplete="off" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'กรุณากรอก password' },
            { min: 8, message: 'ต้องมีอย่างน้อย 8 ตัวอักษร' },
          ]}
        >
          <InputPassword placeholder="password" autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="role" label="บทบาท" rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}>
          <Select
            placeholder="เลือกบทบาท"
            options={roles.map((r) => ({ label: r, value: r }))}
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Form.Item>
      </Form>
    </FormModal>
  );
}
