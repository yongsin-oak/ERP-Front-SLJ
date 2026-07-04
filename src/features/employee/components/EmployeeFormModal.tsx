import { useEffect } from 'react';
import dayjs from 'dayjs';
import { FormModal, Form, Input, Select, DatePicker, Switch } from '@design-system';
import { DepartmentOptions } from '../types';
import type { Employee, CreateEmployeeDto } from '../types';

interface Props {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
  onSubmit: (values: CreateEmployeeDto) => Promise<void>;
  loading?: boolean;
}

export function EmployeeFormModal({ open, employee, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<CreateEmployeeDto & { startDateObj?: dayjs.Dayjs }>();
  const isEdit = !!employee;

  useEffect(() => {
    if (open && employee) {
      form.setFieldsValue({
        firstName: employee.firstName,
        lastName: employee.lastName,
        nickname: employee.nickname,
        phoneNumber: employee.phoneNumber ?? undefined,
        department: employee.department,
        isActive: employee.isActive,
        startDateObj: employee.startDate ? dayjs(employee.startDate) : undefined,
      });
    }
  }, [open, employee, form]);

  async function handleFinish(raw: unknown) {
    const values = raw as CreateEmployeeDto & { startDateObj?: dayjs.Dayjs };
    const { startDateObj, ...rest } = values;
    await onSubmit({
      ...rest,
      startDate: startDateObj ? startDateObj.format('YYYY-MM-DD') : undefined,
    });
  }

  return (
    <FormModal
      open={open}
      title={isEdit ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
      onClose={onClose}
      form={form}
      onFinish={handleFinish}
      loading={loading}
      submitLabel={isEdit ? 'บันทึก' : 'เพิ่มพนักงาน'}
    >
      <Form form={form} style={{ marginTop: 16 }} initialValues={{ isActive: true }}>
        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
          <Input placeholder="ชื่อ" />
        </Form.Item>
        <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}>
          <Input placeholder="นามสกุล" />
        </Form.Item>
        <Form.Item name="nickname" label="ชื่อเล่น" rules={[{ required: true, message: 'กรุณากรอกชื่อเล่น' }]}>
          <Input placeholder="ชื่อเล่น" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="เบอร์โทร">
          <Input placeholder="เบอร์โทร" />
        </Form.Item>
        <Form.Item name="department" label="แผนก" rules={[{ required: true, message: 'กรุณาเลือกแผนก' }]}>
          <Select options={DepartmentOptions} placeholder="เลือกแผนก" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="startDateObj" label="วันที่เริ่มงาน">
          <DatePicker format="DD/MM/YYYY" placeholder="วัน/เดือน/ปี" />
        </Form.Item>
        <Form.Item name="isActive" label="สถานะ" valuePropName="checked">
          <Switch checkedChildren="ใช้งาน" unCheckedChildren="ระงับ" />
        </Form.Item>
      </Form>
    </FormModal>
  );
}
