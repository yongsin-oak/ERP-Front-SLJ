import { useEffect } from 'react';
import { Form, Switch, Row, Col } from 'antd';
import { FormModal, Input, TextArea } from '@design-system';
import type { Supplier, CreateSupplierDto } from '../types';

interface Props {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSubmit: (values: CreateSupplierDto) => Promise<void>;
  loading?: boolean;
}

export function SupplierFormModal({ open, supplier, onClose, onSubmit, loading }: Props) {
  const [form] = Form.useForm<CreateSupplierDto>();

  useEffect(() => {
    if (open && supplier) {
      form.setFieldsValue({
        name: supplier.name,
        contactName: supplier.contactName ?? undefined,
        phone: supplier.phone ?? undefined,
        email: supplier.email ?? undefined,
        address: supplier.address ?? undefined,
        taxId: supplier.taxId ?? undefined,
        isActive: supplier.isActive,
        note: supplier.note ?? undefined,
      });
    }
  }, [open, supplier, form]);

  return (
    <FormModal
      open={open}
      title={supplier ? 'แก้ไขซัพพลายเออร์' : 'เพิ่มซัพพลายเออร์'}
      onClose={onClose}
      form={form}
      onFinish={(values) => onSubmit(values as CreateSupplierDto)}
      loading={loading}
      width={560}
      submitLabel={supplier ? 'บันทึก' : 'เพิ่ม'}
    >
      <Form form={form} layout="vertical" style={{ paddingTop: 8 }} initialValues={{ isActive: true }}>
        <Form.Item name="name" label="ชื่อบริษัท / ซัพพลายเออร์" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
          <Input placeholder="บริษัท โค้กไทย จำกัด" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contactName" label="ชื่อผู้ติดต่อ">
              <Input placeholder="คุณสมศักดิ์" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="phone" label="เบอร์โทรศัพท์">
              <Input placeholder="02-111-1111" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="อีเมล">
              <Input placeholder="order@company.co.th" type="email" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="taxId" label="เลขประจำตัวผู้เสียภาษี">
              <Input placeholder="0105537000001" maxLength={13} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="address" label="ที่อยู่">
          <TextArea rows={2} placeholder="ที่อยู่" />
        </Form.Item>
        <Form.Item name="note" label="หมายเหตุ">
          <TextArea rows={2} />
        </Form.Item>
        <Form.Item name="isActive" label="สถานะ" valuePropName="checked">
          <Switch checkedChildren="ใช้งาน" unCheckedChildren="ปิดใช้งาน" />
        </Form.Item>
      </Form>
    </FormModal>
  );
}
