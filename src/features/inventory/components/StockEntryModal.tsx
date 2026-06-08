import { useState, useRef } from 'react';
import { Modal, Form, InputNumber, Space, Alert, Tag, Divider, Row, Col } from 'antd';
import { BarcodeOutlined, InboxOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { message } from 'antd';
import { Input, Select, Button } from '@design-system';
import { useEmployees } from '@features/employee';
import { inventoryService } from '../services';
import { useCreateStockEntry } from '../react-query';
import { StockEntryTypeLabel, StockEntryTypeColor } from '../types';
import type { CreateStockEntryDto, StockEntryType, Product } from '../types';

const TYPE_OPTIONS: { label: string; value: StockEntryType }[] = [
  { label: StockEntryTypeLabel.in, value: 'in' },
  { label: StockEntryTypeLabel.adjust, value: 'adjust' },
  { label: StockEntryTypeLabel.return, value: 'return' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function StockEntryModal({ open, onClose }: Props) {
  const [form] = Form.useForm<CreateStockEntryDto & { quantity: number }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const barcodeRef = useRef<InputRef>(null);

  const { data: employees = [] } = useEmployees();
  const createStockEntry = useCreateStockEntry();

  const employeeOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.nickname})`,
    value: e.id,
  }));

  async function handleBarcodeSubmit() {
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    setLookingUp(true);
    try {
      const res = await inventoryService.getByBarcode(barcode);
      setProduct(res.data.data);
    } catch {
      message.error(`ไม่พบสินค้า barcode: ${barcode}`);
      setProduct(null);
    } finally {
      setLookingUp(false);
    }
  }

  async function handleOk() {
    if (!product) return;
    const values = await form.validateFields();
    await createStockEntry.mutateAsync({ ...values, productBarcode: product.barcode });
    handleClose();
  }

  function handleClose() {
    setBarcodeInput('');
    setProduct(null);
    form.resetFields();
    onClose();
  }

  return (
    <Modal
      open={open}
      title={
        <Space>
          <InboxOutlined style={{ color: '#52c41a' }} />
          บันทึกรับสินค้าเข้าสต้อค
        </Space>
      }
      onCancel={handleClose}
      width={520}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleClose}>ยกเลิก</Button>,
        <Button
          key="submit"
          variant="primary"
          onClick={handleOk}
          disabled={!product}
          loading={createStockEntry.isPending}
        >
          บันทึก
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>สแกน Barcode สินค้า</div>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            ref={barcodeRef}
            prefix={<BarcodeOutlined />}
            placeholder="สแกนหรือพิมพ์ barcode แล้วกด Enter"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onPressEnter={handleBarcodeSubmit}
          />
          <Button onClick={handleBarcodeSubmit} loading={lookingUp}>ค้นหา</Button>
        </Space.Compact>
      </div>

      {product && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message={
            <div>
              <span style={{ fontWeight: 600 }}>{product.name}</span>
              <br />
              <Space size={4} style={{ marginTop: 4 }}>
                <Tag>{product.barcode}</Tag>
                <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                  สต้อคปัจจุบัน: <strong>{product.remaining} ชิ้น</strong>
                </span>
              </Space>
            </div>
          }
        />
      )}

      <Divider style={{ margin: '8px 0 16px' }} />

      <Form form={form} layout="vertical" initialValues={{ type: 'in', quantity: 1 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="type" label="ประเภท" rules={[{ required: true }]}>
              <Select
                style={{ width: '100%' }}
                options={TYPE_OPTIONS.map((t) => ({
                  label: <Tag color={StockEntryTypeColor[t.value]} style={{ margin: 0 }}>{t.label}</Tag>,
                  value: t.value,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="quantity" label="จำนวน (ชิ้น)" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="employeeId"
          label="พนักงานผู้บันทึก"
          rules={[{ required: true, message: 'กรุณาเลือกพนักงาน' }]}
        >
          <Select
            options={employeeOptions}
            placeholder="เลือกพนักงาน"
            style={{ width: '100%' }}
            showSearch={{ optionFilterProp: 'label' }}
          />
        </Form.Item>

        <Form.Item name="note" label="หมายเหตุ">
          <Input placeholder="หมายเหตุ (ถ้ามี)" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export { StockEntryTypeLabel, StockEntryTypeColor };
