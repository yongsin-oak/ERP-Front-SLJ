import { useEffect } from 'react';
import { Form } from 'antd';
import { Modal, Input, TextArea, Button, Select } from '@design-system';
import type { Category, CreateCategoryDto } from '../types';

interface Props {
  open: boolean;
  category?: Category | null;
  /** สำหรับ dropdown เลือก parent — ตัด self + descendants ออกใน caller */
  parentOptions: { label: string; value: string }[];
  onClose: () => void;
  onSubmit: (values: CreateCategoryDto) => Promise<void>;
}

export function CategoryFormModal({ open, category, parentOptions, onClose, onSubmit }: Props) {
  const [form] = Form.useForm<CreateCategoryDto>();
  const isEdit = !!category;

  useEffect(() => {
    if (!open) return;
    if (category) {
      form.setFieldsValue({
        name: category.name,
        description: category.description ?? '',
        parentId: category.parentId ?? undefined,
      });
    } else {
      form.resetFields();
    }
  }, [open, category, form]);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit({
      ...values,
      parentId: values.parentId || undefined,
      description: values.description || undefined,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
      onCancel={onClose}
      width={520}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>ยกเลิก</Button>,
        <Button key="submit" variant="primary" onClick={handleOk}>
          {isEdit ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="name" label="ชื่อหมวดหมู่" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
          <Input placeholder="ชื่อหมวดหมู่" />
        </Form.Item>
        <Form.Item name="parentId" label="หมวดหมู่หลัก (ถ้ามี)">
          <Select
            allowClear
            placeholder="ไม่มี (เป็นหมวดหมู่ระดับบนสุด)"
            options={parentOptions}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
