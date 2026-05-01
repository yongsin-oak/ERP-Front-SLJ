import { useEffect } from 'react';
import { InputNumber, Row, Col } from 'antd';
import { Modal, Form, Input, Button } from '@design-system';
import type { Product, CreateProductDto } from '../types';

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (values: CreateProductDto) => Promise<void>;
}

export function ProductFormModal({ open, product, onClose, onSubmit }: ProductFormModalProps) {
  const [form] = Form.useForm<CreateProductDto>();
  const isEdit = !!product;

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue({
          barcode: product.barcode,
          name: product.name,
          brandId: product.brand?.id,
          categoryId: product.category?.id,
          costPrice: product.costPrice,
          sellPrice: product.sellPrice,
          remaining: product.remaining,
          minStock: product.minStock,
          piecesPerPack: product.piecesPerPack,
          packPerCarton: product.packPerCarton,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, product, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
      onCancel={onClose}
      width={640}
      footer={[
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button key="submit" variant="primary" onClick={handleOk}>
          {isEdit ? 'บันทึก' : 'เพิ่มสินค้า'}
        </Button>,
      ]}
    >
      <Form form={form} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="barcode" label="Barcode" rules={[{ required: true, message: 'กรุณากรอก barcode' }]}>
              <Input placeholder="barcode" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="name" label="ชื่อสินค้า" rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}>
              <Input placeholder="ชื่อสินค้า" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="brand" label="แบรนด์">
              <Input placeholder="แบรนด์" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="หมวดหมู่">
              <Input placeholder="หมวดหมู่" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="costPrice" label="ราคาทุน" rules={[{ required: true, message: 'กรุณากรอกราคาทุน' }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="บาท" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sellingPrice" label="ราคาขาย" rules={[{ required: true, message: 'กรุณากรอกราคาขาย' }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="บาท" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="stock" label="จำนวนคงเหลือ" rules={[{ required: true, message: 'กรุณากรอกจำนวน' }]}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="unit" label="หน่วย">
              <Input placeholder="ชิ้น / กล่อง / อัน" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="weight" label="น้ำหนัก (กรัม)">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="รายละเอียด">
          <Input placeholder="รายละเอียดสินค้า" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
