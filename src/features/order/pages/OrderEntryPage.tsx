import { useState, useMemo, useRef, useEffect } from 'react';
import { Flex, Row, Col, Card, Form, Tag, Space, Typography, Alert, Divider } from 'antd';
import type { InputRef } from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  HistoryOutlined,
  UserOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Select, Input, Button, PageHeader } from '@design-system';
import { colors, shadow } from '@design-system';
import { useShops, PlatformBadge, PLATFORM_ORDER, PlatformHex } from '@features/shop';
import type { Shop, Platform } from '@features/shop';
import { useEmployees } from '@features/employee/react-query';
import { OrderItemsEditor } from '../components';
import { useCreateOrder } from '../react-query';
import type { OrderItem } from '../types';

const { Text } = Typography;

interface HeaderForm {
  employeeId?: string;
  shopId?: string;
  orderNumber?: string;
  note?: string;
}

export function OrderEntryPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<HeaderForm>();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [resetTick, setResetTick] = useState(0);
  const headerValues = Form.useWatch([], form) ?? {};
  const orderNumberRef = useRef<InputRef>(null);

  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const createOrder = useCreateOrder();

  const employeeReady = !!headerValues.employeeId;
  const shopReady = !!headerValues.shopId;
  const orderNumberReady = !!headerValues.orderNumber?.trim();
  const headerReady = employeeReady && shopReady && orderNumberReady;
  const canSave = headerReady && items.length > 0;

  const selectedShop = useMemo<Shop | undefined>(
    () => shops.find((s) => s.id === headerValues.shopId),
    [shops, headerValues.shopId],
  );
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === headerValues.employeeId),
    [employees, headerValues.employeeId],
  );

  // group shops ตาม platform
  const shopOptions = useMemo(() => {
    const grouped = new Map<Platform, Shop[]>();
    PLATFORM_ORDER.forEach((p) => grouped.set(p, []));
    shops.forEach((s) => grouped.get(s.platform)?.push(s));
    return PLATFORM_ORDER
      .filter((p) => (grouped.get(p)?.length ?? 0) > 0)
      .map((p) => ({
        label: (
          <Space size={6}>
            <PlatformBadge platform={p} size={14} />
            <span style={{ fontWeight: 600, fontSize: 12 }}>{p}</span>
          </Space>
        ),
        title: p,
        options: grouped.get(p)!.map((s) => ({
          label: (
            <Space size={8}>
              <PlatformBadge platform={s.platform} size={16} />
              <span>{s.name}</span>
            </Space>
          ),
          value: s.id,
          searchText: `${s.platform} ${s.name}`,
        })),
      }));
  }, [shops]);

  const employeeOptions = employees.map((e) => ({
    label: `${e.firstName} ${e.lastName} (${e.nickname})`,
    value: e.id,
    searchText: `${e.firstName} ${e.lastName} ${e.nickname}`,
  }));

  // เมื่อพร้อมกรอกเลขออเดอร์ → focus
  useEffect(() => {
    if (employeeReady && shopReady && !orderNumberReady) {
      orderNumberRef.current?.focus();
    }
  }, [employeeReady, shopReady, orderNumberReady]);

  const totals = useMemo(() => {
    const qty = items.reduce((s, i) => s + i.quantity, 0);
    const price = items.reduce((s, i) => s + i.sellingPrice * i.quantity, 0);
    return { qty, price };
  }, [items]);

  async function handleSave() {
    if (!canSave) return;
    const values = await form.validateFields();
    const noteParts = [values.orderNumber?.trim(), values.note?.trim()].filter(Boolean);
    await createOrder.mutateAsync({
      recordBy: values.employeeId!,
      shopId: values.shopId!,
      details: items.map((i) => ({
        productBarcode: i.barcode,
        quantityPack: i.quantity,
        quantityCarton: 0,
      })),
      note: noteParts.length ? noteParts.join(' | ') : undefined,
    });
    form.setFieldsValue({ orderNumber: '', note: '' });
    setItems([]);
    setResetTick((t) => t + 1);
    setTimeout(() => orderNumberRef.current?.focus(), 0);
  }

  function handleClear() {
    form.resetFields();
    setItems([]);
    setResetTick((t) => t + 1);
  }

  return (
    <Flex vertical gap={12} style={{ paddingBottom: 80 }}>
      <PageHeader
        title="บันทึก Order"
        subtitle="เลือกพนักงาน → ร้านค้า → กรอกเลขคำสั่งซื้อ → สแกนสินค้า"
        actions={
          <>
            <Button icon={<HistoryOutlined />} onClick={() => navigate('/order/history')}>
              ประวัติออเดอร์
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleClear}>
              ล้างฟอร์ม
            </Button>
          </>
        }
      />

      <Form form={form} layout="vertical" requiredMark="optional">
        <Card size="small">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="employeeId"
                label={<Space size={6}><UserOutlined /> พนักงานผู้บันทึก</Space>}
                rules={[{ required: true, message: 'กรุณาเลือกพนักงาน' }]}
              >
                <Select
                  options={employeeOptions}
                  placeholder="เลือกพนักงาน"
                  style={{ width: '100%' }}
                  loading={employeesLoading}
                  showSearch={{ optionFilterProp: 'searchText' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="shopId"
                label={<Space size={6}><ShopOutlined /> ร้านค้า / แพลตฟอร์ม</Space>}
                rules={[{ required: true, message: 'กรุณาเลือกร้านค้า' }]}
              >
                <Select
                  options={shopOptions}
                  placeholder="เลือกร้านค้า"
                  style={{ width: '100%' }}
                  loading={shopsLoading}
                  showSearch={{ optionFilterProp: 'searchText' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="orderNumber"
                label="เลขคำสั่งซื้อ"
                rules={[{ required: true, message: 'กรุณากรอกเลขคำสั่งซื้อ' }]}
              >
                <Input
                  ref={orderNumberRef}
                  placeholder="ยิง / กรอกเลขคำสั่งซื้อจากแพลตฟอร์ม"
                  disabled={!employeeReady || !shopReady}
                  autoComplete="off"
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {!headerReady ? (
          <Alert
            type="info"
            showIcon
            message="กรอกข้อมูลด้านบนให้ครบเพื่อเริ่มเพิ่มสินค้า"
            style={{ marginTop: 4 }}
          />
        ) : (
          <PaperOrderCard
            orderNumber={headerValues.orderNumber!.trim()}
            shop={selectedShop}
            employee={selectedEmployee}
            items={items}
            onItemsChange={setItems}
            resetSignal={resetTick}
            noteField={
              <Form.Item name="note" label="หมายเหตุ" style={{ marginBottom: 0 }}>
                <Input placeholder="หมายเหตุ (ถ้ามี)" />
              </Form.Item>
            }
          />
        )}
      </Form>

      <SaveBar
        ready={canSave}
        loading={createOrder.isPending}
        qty={totals.qty}
        price={totals.price}
        onSave={handleSave}
      />
    </Flex>
  );
}

interface PaperOrderCardProps {
  orderNumber: string;
  shop?: Shop;
  employee?: { firstName: string; lastName: string; nickname: string };
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  resetSignal: number;
  noteField: React.ReactNode;
}

function PaperOrderCard({
  orderNumber,
  shop,
  employee,
  items,
  onItemsChange,
  resetSignal,
  noteField,
}: PaperOrderCardProps) {
  const accent = shop ? PlatformHex[shop.platform] : colors.brand.primary;

  return (
    <div
      style={{
        background: colors.bg.base,
        borderRadius: 8,
        boxShadow: shadow.sm,
        border: `1px solid ${colors.border.default}`,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 4, background: accent }} />

      <div style={{ padding: '14px 20px 12px', borderBottom: `1px dashed ${colors.border.default}` }}>
        <Flex justify="space-between" align="center" gap={16} wrap>
          <div style={{ minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.6 }}>
              ORDER NUMBER
            </Text>
            <div
              style={{
                marginTop: 2,
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.3,
                wordBreak: 'break-all',
                color: colors.text.primary,
              }}
            >
              {orderNumber}
            </div>
          </div>

          {shop && (
            <Space size={10} align="center">
              <PlatformBadge platform={shop.platform} size={28} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{shop.name}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{shop.platform}</Text>
              </div>
            </Space>
          )}
        </Flex>

        <Divider style={{ margin: '12px 0 10px' }} />

        <Row gutter={[20, 6]}>
          <Col xs={24} sm={8}>
            <InfoLine
              label="พนักงาน"
              value={employee ? `${employee.firstName} (${employee.nickname})` : '-'}
            />
          </Col>
          <Col xs={24} sm={8}>
            <InfoLine label="วันที่บันทึก" value={dayjs().format('DD/MM/YYYY HH:mm')} />
          </Col>
          <Col xs={24} sm={8}>
            <div>{noteField}</div>
          </Col>
        </Row>
      </div>

      <div style={{ padding: '14px 20px 18px' }}>
        <Flex align="center" gap={8} style={{ marginBottom: 10 }}>
          <ShoppingCartOutlined style={{ color: accent }} />
          <Text strong>รายการสินค้า</Text>
          {items.length > 0 && (
            <Tag color="blue" style={{ marginLeft: 4 }}>{items.length} รายการ</Tag>
          )}
        </Flex>
        <OrderItemsEditor items={items} onChange={onItemsChange} resetSignal={resetSignal} />
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 10, letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Text>
      <div style={{ fontSize: 12, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function SaveBar({
  ready,
  loading,
  qty,
  price,
  onSave,
}: {
  ready: boolean;
  loading: boolean;
  qty: number;
  price: number;
  onSave: () => void;
}) {
  return (
    <Flex
      justify="flex-end"
      align="center"
      gap={20}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.bg.base,
        borderTop: `1px solid ${colors.border.default}`,
        padding: '10px 20px',
        boxShadow: shadow.sm,
        zIndex: 50,
      }}
    >
      <Space size={20}>
        <span style={{ fontSize: 13 }}>
          จำนวนรวม: <Text strong>{qty.toLocaleString()} ชิ้น</Text>
        </span>
        <span style={{ fontSize: 13 }}>
          ยอดรวม:{' '}
          <Text strong style={{ fontSize: 15, color: colors.brand.primary }}>
            ฿{price.toLocaleString()}
          </Text>
        </span>
      </Space>
      <Button
        variant="primary"
        icon={<SaveOutlined />}
        disabled={!ready}
        loading={loading}
        onClick={onSave}
      >
        บันทึกคำสั่งซื้อ
      </Button>
    </Flex>
  );
}
