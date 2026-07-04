import { useEffect } from 'react';
import { Form } from '@design-system';
import { FormModal, Input, TextArea, Select } from '@design-system';
import type { Category, CreateCategoryDto } from '../types';

interface Props {
  open: boolean;
  category?: Category | null;
  /** สำหรับ dropdown เลือก parent — ตัด self + descendants ออกใน caller */
  parentOptions: { label: string; value: string }[];
  onClose: () => void;
  onSubmit: (values: CreateCategoryDto) => Promise<void>;
  loading?: boolean;
}

export function CategoryFormModal({ open, category, parentOptions, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<CreateCategoryDto>();
  const isEdit = !!category;

  useEffect(() => {
    if (!open || !category) return;
    form.setFieldsValue({
      name: category.name,
      description: category.description ?? '',
      parentId: category.parentId ?? undefined,
    });
  }, [open, category, form]);

  async function handleFinish(raw: unknown) {
    const values = raw as CreateCategoryDto;
    await onSubmit({
      ...values,
      parentId: values.parentId || undefined,
      description: values.description || undefined,
    });
  }

  return (
    <FormModal
      open={open}
      title={isEdit ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
      onClose={onClose}
      form={form}
      onFinish={handleFinish}
      loading={loading}
      width={520}
      submitLabel={isEdit ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
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
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
        </Form.Item>
      </Form>
    </FormModal>
  );
}
