import { useEffect } from 'react';
import { InputNumber, Row, Col, Switch, Form as AntForm } from 'antd';
import { FormModal, Form, Input } from '@design-system';
import { BrandSearchSelect } from '@features/brand/components';
import { CategorySearchSelect } from '@features/category/components';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (values: CreateProductDto | UpdateProductDto) => Promise<void>;
  loading?: boolean;
}

export function ProductFormModal({ open, product, onClose, onSubmit, loading = false }: ProductFormModalProps) {
  const [form] = Form.useForm<CreateProductDto>();
  const isEdit = !!product;


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
        form.setFieldsValue({ isActive: true, remaining: 0 });
      }
    }
  }, [open, product, form]);

  return (
    <FormModal
      open={open}
      title={isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
      form={form}
      onFinish={async (values) => {
        await onSubmit(values as CreateProductDto | UpdateProductDto);
      }}
      onClose={onClose}
      loading={loading}
      width={720}
      submitLabel={isEdit ? 'บันทึก' : 'เพิ่มสินค้า'}
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
              <BrandSearchSelect allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="categoryId" label="หมวดหมู่">
              <CategorySearchSelect allowClear />
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
    </FormModal>
  );
}
