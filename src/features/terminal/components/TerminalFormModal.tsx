import { useEffect } from 'react';
import { Switch, Row, Col } from 'antd';
import { FormModal, Form, Input, InputPassword, Select } from '@design-system';
import type { Role } from '@features/auth/types';
import type { Terminal, CreateTerminalDto, UpdateTerminalDto } from '../types';

const ALL_ROLES: Role[] = [
  'SuperAdmin', 'Admin', 'Operator', 'Warehouse',
  'Accountant', 'HR', 'Marketing', 'Sales',
];

interface Props {
  open: boolean;
  terminal: Terminal | null;
  onClose: () => void;
  onSubmit: (values: CreateTerminalDto | UpdateTerminalDto) => Promise<void>;
  loading?: boolean;
}

type FormValues = {
  terminalCode: string;
  name: string;
  role: Role;
  password?: string;
  isActive?: boolean;
};

export function TerminalFormModal({ open, terminal, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!terminal;

  useEffect(() => {
    if (open && terminal) {
      form.setFieldsValue({
        terminalCode: terminal.terminalCode,
        name: terminal.name,
        role: terminal.role,
        isActive: terminal.isActive,
        password: undefined,
      });
    }
  }, [open, terminal, form]);

  async function handleFinish(raw: unknown) {
    const values = raw as FormValues;
    if (isEdit && !values.password) {
      const { password: _, ...rest } = values;
      await onSubmit(rest as UpdateTerminalDto);
    } else {
      await onSubmit(values);
    }
  }

  return (
    <FormModal
      open={open}
      title={isEdit ? 'แก้ไข Terminal' : 'เพิ่ม Terminal'}
      onClose={onClose}
      form={form}
      onFinish={handleFinish}
      loading={loading}
      submitLabel={isEdit ? 'บันทึก' : 'เพิ่ม Terminal'}
      width={480}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="terminalCode"
              label="Terminal Code"
              rules={[
                { required: true, message: 'กรุณากรอก Terminal Code' },
                { pattern: /^[A-Za-z0-9_-]+$/, message: 'อนุญาต A-Z, 0-9, -, _ เท่านั้น' },
              ]}
            >
              <Input placeholder="เช่น POS-01" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label="ชื่อ Terminal"
              rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}
            >
              <Input placeholder="เช่น POS หน้าร้าน 1" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="role"
          label="บทบาท"
          rules={[{ required: true, message: 'กรุณาเลือกบทบาท' }]}
        >
          <Select
            placeholder="เลือกบทบาท"
            options={ALL_ROLES.map((r) => ({ label: r, value: r }))}
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={isEdit ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : 'รหัสผ่าน'}
          rules={
            isEdit
              ? [{ min: 8, message: 'ต้องมีอย่างน้อย 8 ตัวอักษร' }]
              : [
                  { required: true, message: 'กรุณากรอกรหัสผ่าน' },
                  { min: 8, message: 'ต้องมีอย่างน้อย 8 ตัวอักษร' },
                ]
          }
        >
          <InputPassword
            placeholder={isEdit ? 'เว้นว่างถ้าไม่เปลี่ยน' : 'รหัสผ่านอย่างน้อย 8 ตัว'}
            autoComplete="new-password"
          />
        </Form.Item>

        {isEdit && (
          <Form.Item name="isActive" label="สถานะ" valuePropName="checked">
            <Switch checkedChildren="เปิดใช้งาน" unCheckedChildren="ปิดใช้งาน" />
          </Form.Item>
        )}
      </Form>
    </FormModal>
  );
}
