import { useEffect } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { Modal, Form, Input, Select, Button } from '@design-system';
import { DepartmentOptions } from '../types';
import type { Employee, CreateEmployeeDto } from '../types';

interface EmployeeFormModalProps {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
  onSubmit: (values: CreateEmployeeDto) => Promise<void>;
}

export function EmployeeFormModal({ open, employee, onClose, onSubmit }: EmployeeFormModalProps) {
  const [form] = Form.useForm<CreateEmployeeDto & { startDateObj: dayjs.Dayjs }>();
  const isEdit = !!employee;

  useEffect(() => {
    if (open) {
      if (employee) {
        form.setFieldsValue({
          ...employee,
          startDateObj: dayjs(employee.startDate),
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, employee, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const { startDateObj, ...rest } = values;
    await onSubmit({ ...rest, startDate: startDateObj.format('YYYY-MM-DD') });
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button key="submit" variant="primary" onClick={handleOk}>
          {isEdit ? 'บันทึก' : 'เพิ่มพนักงาน'}
        </Button>,
      ]}
    >
      <Form form={form} style={{ marginTop: 16 }}>
        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
          <Input placeholder="ชื่อ" />
        </Form.Item>
        <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}>
          <Input placeholder="นามสกุล" />
        </Form.Item>
        <Form.Item name="nickname" label="ชื่อเล่น" rules={[{ required: true, message: 'กรุณากรอกชื่อเล่น' }]}>
          <Input placeholder="ชื่อเล่น" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="เบอร์โทร" rules={[{ required: true, message: 'กรุณากรอกเบอร์โทร' }]}>
          <Input placeholder="เบอร์โทร" />
        </Form.Item>
        <Form.Item name="department" label="แผนก" rules={[{ required: true, message: 'กรุณาเลือกแผนก' }]}>
          <Select options={DepartmentOptions} placeholder="เลือกแผนก" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="startDateObj" label="วันที่เริ่มงาน" rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}>
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="วัน/เดือน/ปี" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
