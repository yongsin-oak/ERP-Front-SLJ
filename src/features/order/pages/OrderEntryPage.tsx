import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { Select, Input, Button, PageHeader, AppIcons, Form, Card, Tag, Alert, Divider, Stack, Inline, Grid, Text } from '@design-system';
import type { InputRef } from '@design-system';
import { colors, shadow } from '@design-system';
import { useShops, PlatformBadge, PLATFORM_ORDER, PlatformHex } from '@features/shop';
import type { Shop, Platform } from '@features/shop';
import { useEmployees } from '@features/employee/react-query';
import { OrderItemsEditor } from '../components';
import { useCreateOrder } from '../react-query';
import type { OrderItem } from '../types';

interface HeaderForm {
  employeeId?: string;
  shopId?: string;
  orderNumber?: string;
  note?: string;
}

export function OrderEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm<HeaderForm>();
  const locationItems = (location.state as { items?: OrderItem[] } | null)?.items;
  const [items, setItems] = useState<OrderItem[]>(locationItems ?? []);
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
          <span className="inline-flex items-center gap-1.5">
            <PlatformBadge platform={p} size={14} />
            <span style={{ fontWeight: 600, fontSize: 12 }}>{p}</span>
          </span>
        ),
        title: p,
        options: grouped.get(p)!.map((s) => ({
          label: (
            <span className="inline-flex items-center gap-2">
              <PlatformBadge platform={s.platform} size={16} />
              <span>{s.name}</span>
            </span>
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
    requestAnimationFrame(() => orderNumberRef.current?.focus());
  }

  function handleClear() {
    form.resetFields();
    setItems([]);
    setResetTick((t) => t + 1);
  }

  return (
    <Stack gap={3} style={{ paddingBottom: 80 }}>
      <PageHeader
        title="บันทึก Order"
        subtitle="เลือกพนักงาน → ร้านค้า → กรอกเลขคำสั่งซื้อ → สแกนสินค้า"
        actions={
          <>
            <Button icon={<AppIcons.history />} onClick={() => navigate('/order/history')}>
              ประวัติออเดอร์
            </Button>
            <Button icon={<AppIcons.refresh />} onClick={handleClear}>
              ล้างฟอร์ม
            </Button>
          </>
        }
      />

      <Form form={form} layout="vertical" requiredMark="optional">
        <Card size="small">
          <Grid cols={3} gap={4}>
            <Form.Item
              name="employeeId"
              label={<span className="inline-flex items-center gap-1.5"><AppIcons.user /> พนักงานผู้บันทึก</span>}
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
            <Form.Item
              name="shopId"
              label={<span className="inline-flex items-center gap-1.5"><AppIcons.shop /> ร้านค้า / แพลตฟอร์ม</span>}
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
          </Grid>
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
    </Stack>
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
        <Inline justify="between" align="center" gap={4} wrap>
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
            <div className="flex items-center gap-2.5">
              <PlatformBadge platform={shop.platform} size={28} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{shop.name}</div>
                <Text type="secondary" style={{ fontSize: 11 }}>{shop.platform}</Text>
              </div>
            </div>
          )}
        </Inline>

        <Divider style={{ margin: '12px 0 10px' }} />

        <Grid cols={3} gap={5}>
          <InfoLine
            label="พนักงาน"
            value={employee ? `${employee.firstName} (${employee.nickname})` : '-'}
          />
          <InfoLine label="วันที่บันทึก" value={dayjs().format('DD/MM/YYYY HH:mm')} />
          <div>{noteField}</div>
        </Grid>
      </div>

      <div style={{ padding: '14px 20px 18px' }}>
        <Inline gap={2} wrap={false} className="mb-2.5">
          <AppIcons.cart style={{ color: accent }} />
          <Text strong>รายการสินค้า</Text>
          {items.length > 0 && (
            <Tag color="blue" style={{ marginLeft: 4 }}>{items.length} รายการ</Tag>
          )}
        </Inline>
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
    <Inline
      justify="end"
      align="center"
      gap={5}
      wrap={false}
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
      <Inline gap={5} wrap={false}>
        <span style={{ fontSize: 13 }}>
          จำนวนรวม: <Text strong>{qty.toLocaleString()} ชิ้น</Text>
        </span>
        <span style={{ fontSize: 13 }}>
          ยอดรวม:{' '}
          <Text strong style={{ fontSize: 15, color: colors.brand.primary }}>
            ฿{price.toLocaleString()}
          </Text>
        </span>
      </Inline>
      <Button
        variant="primary"
        icon={<AppIcons.save />}
        disabled={!ready}
        loading={loading}
        onClick={onSave}
      >
        บันทึกคำสั่งซื้อ
      </Button>
    </Inline>
  );
}
