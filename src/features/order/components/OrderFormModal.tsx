import { useEffect, useState } from 'react';
import { Modal, Form, Tag, Space } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { Select, Input, Button } from '@design-system';
import { useShops, PlatformColor } from '@features/shop';
import { useEmployees } from '@features/employee';
import { OrderItemsEditor } from './OrderItemsEditor';
import type { Order, CreateOrderDto, OrderItem, OrderStatus } from '../types';

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: 'รอดำเนินการ', value: 'pending' },
  { label: 'ยืนยันแล้ว', value: 'confirmed' },
  { label: 'จัดส่งแล้ว', value: 'shipped' },
  { label: 'สำเร็จ', value: 'completed' },
  { label: 'ยกเลิก', value: 'cancelled' },
];

interface Props {
  open: boolean;
  order?: Order | null;
  onClose: () => void;
  onSubmit: (values: CreateOrderDto) => Promise<void>;
}

export function OrderFormModal({ open, order, onClose, onSubmit }: Props) {
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!order;

  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  useEffect(() => {
    if (!open) return;
    if (order) {
      form.setFieldsValue({
        status: order.status,
        note: order.note,
        shopId: order.shopId,
        employeeId: order.employeeId,
      });
      setItems(order.items ?? []);
    } else {
      form.resetFields();
      form.setFieldValue('status', 'pending');
      setItems([]);
    }
  }, [open, order, form]);

  async function handleOk() {
    if (items.length === 0) return;
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        items: items.map((i) => ({ barcode: i.barcode, quantity: i.quantity })),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const shopOptions = shops.map((s) => ({
    label: (
      <Space size={6}>
        <Tag color={PlatformColor[s.platform]} style={{ margin: 0 }}>{s.platform}</Tag>
        {s.name}
      </Space>
    ),
    value: s.id,
  }));

  const employeeOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.nickname})`,
    value: e.id,
  }));

  return (
    <Modal
      open={open}
      title={
        <Space>
          <ShopOutlined />
          {isEdit ? `แก้ไข Order` : 'สร้าง Order ใหม่'}
        </Space>
      }
      onCancel={onClose}
      width={800}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onClose}>ยกเลิก</Button>,
        <Button
          key="submit"
          variant="primary"
          onClick={handleOk}
          disabled={items.length === 0}
          loading={submitting}
        >
          {isEdit ? 'บันทึก' : 'สร้าง Order'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {/* Shop selector */}
          <Form.Item
            name="shopId"
            label="ร้านค้า / แพลตฟอร์ม"
            rules={[{ required: true, message: 'กรุณาเลือกร้านค้า' }]}
          >
            <Select
              options={shopOptions}
              placeholder="เลือกร้านค้า"
              style={{ width: '100%' }}
              loading={shopsLoading}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Employee selector */}
          <Form.Item
            name="employeeId"
            label="พนักงานผู้บันทึก"
            rules={[{ required: true, message: 'กรุณาเลือกพนักงาน' }]}
          >
            <Select
              options={employeeOptions}
              placeholder="เลือกพนักงาน"
              style={{ width: '100%' }}
              loading={employeesLoading}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Status */}
          <Form.Item name="status" label="สถานะ">
            <Select options={STATUS_OPTIONS} style={{ width: '100%' }} />
          </Form.Item>

          {/* Note */}
          <Form.Item name="note" label="หมายเหตุ">
            <Input placeholder="หมายเหตุ (ถ้ามี)" />
          </Form.Item>
        </div>
      </Form>

      <OrderItemsEditor items={items} onChange={setItems} />
    </Modal>
  );
}
