import { useEffect } from 'react';
import { Form, Space } from 'antd';
import { FormModal, Input, TextArea, Select } from '@design-system';
import { PlatformBadge } from './PlatformBadge';
import { PLATFORM_ORDER } from '../types';
import type { Shop, CreateShopDto, Platform } from '../types';

interface Props {
  open: boolean;
  shop?: Shop | null;
  onClose: () => void;
  onSubmit: (values: CreateShopDto) => Promise<void>;
  loading?: boolean;
}

export function ShopFormModal({ open, shop, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<CreateShopDto>();
  const isEdit = !!shop;

  useEffect(() => {
    if (open && shop) {
      form.setFieldsValue({
        name: shop.name,
        platform: shop.platform,
        description: shop.description ?? '',
      });
    }
  }, [open, shop, form]);

  const platformOptions = PLATFORM_ORDER.map((p: Platform) => ({
    label: (
      <Space size={8}>
        <PlatformBadge platform={p} size={16} />
        <span>{p}</span>
      </Space>
    ),
    value: p,
  }));

  async function handleFinish(raw: unknown) {
    const values = raw as CreateShopDto;
    await onSubmit({ ...values, description: values.description || undefined });
  }

  return (
    <FormModal
      open={open}
      title={isEdit ? 'แก้ไขร้านค้า' : 'เพิ่มร้านค้า'}
      onClose={onClose}
      form={form}
      onFinish={handleFinish}
      loading={loading}
      width={520}
      submitLabel={isEdit ? 'บันทึก' : 'เพิ่มร้านค้า'}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="platform" label="แพลตฟอร์ม" rules={[{ required: true, message: 'กรุณาเลือกแพลตฟอร์ม' }]}>
          <Select options={platformOptions} placeholder="เลือกแพลตฟอร์ม" />
        </Form.Item>
        <Form.Item name="name" label="ชื่อร้าน" rules={[{ required: true, message: 'กรุณากรอกชื่อร้าน' }]}>
          <Input placeholder="ชื่อร้าน" />
        </Form.Item>
        <Form.Item name="description" label="รายละเอียด">
          <TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)" />
        </Form.Item>
      </Form>
    </FormModal>
  );
}
