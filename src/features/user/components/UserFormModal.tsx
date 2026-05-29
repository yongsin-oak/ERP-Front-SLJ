import { useEffect } from 'react';
import { Form } from 'antd';
import { Modal, Input, InputPassword, Button, Select } from '@design-system';
import type { Role } from '@features/auth/types';
import type { CreateUserDto } from '../types';

interface Props {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onSubmit: (values: CreateUserDto) => Promise<void>;
}

export function UserFormModal({ open, roles, onClose, onSubmit }: Props) {
  const [form] = Form.useForm<CreateUserDto>();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
    onClose();
  }

  return (
    <Modal
      open={open}
      title="เพิ่มผู้ใช้งาน"
      onCancel={onClose}
      width={480}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>ยกเลิก</Button>,
        <Button key="submit" variant="primary" onClick={handleOk}>เพิ่มผู้ใช้งาน</Button>,
      ]}
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
    </Modal>
  );
}
