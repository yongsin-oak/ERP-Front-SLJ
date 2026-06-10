import { useEffect } from 'react';
import { Form } from 'antd';
import { FormModal, Input, TextArea } from '@design-system';
import type { Brand, CreateBrandDto } from '../types';

interface Props {
  open: boolean;
  brand?: Brand | null;
  onClose: () => void;
  onSubmit: (values: CreateBrandDto) => Promise<void>;
  loading?: boolean;
}

export function BrandFormModal({ open, brand, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<CreateBrandDto>();
  const isEdit = !!brand;

  useEffect(() => {
    if (!open || !brand) return;
    form.setFieldsValue({ name: brand.name, description: brand.description ?? '' });
  }, [open, brand, form]);

  return (
    <FormModal
      open={open}
      title={isEdit ? 'แก้ไขแบรนด์' : 'เพิ่มแบรนด์'}
      onClose={onClose}
      form={form}
      onFinish={(values) => onSubmit(values as CreateBrandDto)}
      loading={loading}
      width={520}
      submitLabel={isEdit ? 'บันทึก' : 'เพิ่มแบรนด์'}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="name" label="ชื่อแบรนด์" rules={[{ required: true, message: 'กรุณากรอกชื่อแบรนด์' }]}>
          <Input placeholder="ชื่อแบรนด์" />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
        </Form.Item>
      </Form>
    </FormModal>
  );
}
