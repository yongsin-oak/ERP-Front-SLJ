import { useEffect } from 'react';
import { Form } from 'antd';
import { Modal, Input, TextArea, Button } from '@design-system';
import type { Brand, CreateBrandDto } from '../types';

interface Props {
  open: boolean;
  brand?: Brand | null;
  onClose: () => void;
  onSubmit: (values: CreateBrandDto) => Promise<void>;
}

export function BrandFormModal({ open, brand, onClose, onSubmit }: Props) {
  const [form] = Form.useForm<CreateBrandDto>();
  const isEdit = !!brand;

  useEffect(() => {
    if (!open) return;
    if (brand) form.setFieldsValue({ name: brand.name, description: brand.description ?? '' });
    else form.resetFields();
  }, [open, brand, form]);

  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
    onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'แก้ไขแบรนด์' : 'เพิ่มแบรนด์'}
      onCancel={onClose}
      width={520}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>ยกเลิก</Button>,
        <Button key="submit" variant="primary" onClick={handleOk}>
          {isEdit ? 'บันทึก' : 'เพิ่มแบรนด์'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="name" label="ชื่อแบรนด์" rules={[{ required: true, message: 'กรุณากรอกชื่อแบรนด์' }]}>
          <Input placeholder="ชื่อแบรนด์" />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
