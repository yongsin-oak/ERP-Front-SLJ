import { useEffect } from 'react';
import { InputNumber, Row, Col, Switch, Form as AntForm } from 'antd';
import { Modal, Form, Input, Select, Button } from '@design-system';
import { useBrands } from '@features/brand';
import { useCategories } from '@features/category';
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

  const { data: brandsData } = useBrands({ page: 1, limit: 200 });
  const brands = brandsData?.data ?? [];
  const { data: categoriesData } = useCategories({ page: 1, limit: 200 });
  const categories = categoriesData?.data ?? [];

  const brandOptions = brands.map((b) => ({ label: b.name, value: b.id }));
  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

  useEffect(() => {
    if (open) {
      if (product) {
        form.setFieldsValue({
          barcode: product.barcode,
          name: product.name,
          sku: product.sku ?? undefined,
          brandId: product.brand?.id,
          categoryId: product.category?.id,
          costPrice: product.costPrice,
          sellPrice: product.sellPrice,
          remaining: product.remaining,
          minStock: product.minStock,
          maxStock: product.maxStock ?? undefined,
          isActive: product.isActive,
          imageUrl: product.imageUrl ?? undefined,
          piecesPerPack: product.piecesPerPack,
          packPerCarton: product.packPerCarton,
          productDimensions: product.productDimensions,
          cartonDimensions: product.cartonDimensions,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true, remaining: 0 });
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
      width={720}
      footer={[
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button key="submit" variant="primary" onClick={handleOk}>
          {isEdit ? 'บันทึก' : 'เพิ่มสินค้า'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="barcode" label="Barcode" rules={[{ required: true, message: 'กรุณากรอก barcode' }]}>
              <Input placeholder="8850999xxxxxx" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="sku" label="SKU (รหัสภายใน)">
              <Input placeholder="COKE-CAN-325" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="name" label="ชื่อสินค้า" rules={[{ required: true, message: 'กรุณากรอกชื่อสินค้า' }]}>
          <Input placeholder="ชื่อสินค้า" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="brandId" label="แบรนด์">
              <Select
                options={brandOptions}
                placeholder="เลือกแบรนด์"
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="categoryId" label="หมวดหมู่">
              <Select
                options={categoryOptions}
                placeholder="เลือกหมวดหมู่"
                allowClear
                showSearch={{ optionFilterProp: 'label' }}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name={['costPrice', 'pack']} label="ราคาทุน/แพ็ค">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="฿" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['costPrice', 'carton']} label="ราคาทุน/ลัง">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="฿" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="remaining" label="จำนวนเริ่มต้น">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" disabled={isEdit} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name={['sellPrice', 'pack']} label="ราคาขาย/แพ็ค">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="฿" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name={['sellPrice', 'carton']} label="ราคาขาย/ลัง">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" addonAfter="฿" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="minStock" label="stock ขั้นต่ำ">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="50" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="piecesPerPack" label="ชิ้น/แพ็ค">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="12" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="packPerCarton" label="แพ็ค/ลัง">
              <InputNumber min={1} style={{ width: '100%' }} placeholder="10" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maxStock" label="stock สูงสุด">
              <InputNumber min={0} style={{ width: '100%' }} placeholder="2000" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="imageUrl" label="URL รูปภาพ">
          <Input placeholder="https://..." />
        </Form.Item>

        <AntForm.Item name="isActive" label="สถานะ" valuePropName="checked">
          <Switch checkedChildren="ใช้งาน" unCheckedChildren="ปิด" />
        </AntForm.Item>
      </Form>
    </Modal>
  );
}
