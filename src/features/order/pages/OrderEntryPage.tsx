import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { Select, Input, Button, PageHeader, AppIcons, Form, Card, Tag, Alert, Divider, Stack, Inline, Grid, Text } from '@design-system';
import type { InputRef } from '@design-system';
import { useShops, PlatformBadge, PLATFORM_ORDER, PlatformHex } from '@features/shop';
import type { Shop, Platform } from '@features/shop';
import { useActor, useActorModal } from '@features/auth';
import { OrderItemsEditor } from '../components';
import { useCreateOrder } from '../react-query';
import type { OrderItem } from '../types';

interface HeaderForm {
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
  const createOrder = useCreateOrder();
  // ผู้บันทึกปัจจุบัน = พนักงานที่ยืนยัน PIN (actor). presence = มีสิทธิ์ใช้หน้านี้
  // (token หมดอายุจะถูก auto-clear ด้านล่าง → actorEmployee = null → กลับไปหน้าล็อก PIN)
  const actorEmployee = useActor((s) => s.employee);
  const actorExpiresAt = useActor((s) => s.expiresAt);
  const clearActor = useActor((s) => s.clear);

  const shopReady = !!headerValues.shopId;
  const orderNumberReady = !!headerValues.orderNumber?.trim();
  // เปิดบิล/เริ่มเพิ่มสินค้าได้เมื่อเลือกร้านแล้ว — ไม่ผูกกับการพิมพ์เลขคำสั่งซื้อทีละตัว
  const showBill = shopReady;
  const canSave = shopReady && orderNumberReady && items.length > 0;

  // auto-clear actor เมื่อ token ใกล้หมดอายุ (เผื่อ buffer 60s ให้ตรงกับ getValidToken)
  // → actorEmployee = null → หน้าถูกล็อกให้ยืนยัน PIN ใหม่
  useEffect(() => {
    if (!actorExpiresAt) return;
    const ms = actorExpiresAt - 60_000 - Date.now();
    if (ms <= 0) {
      clearActor();
      return;
    }
    const t = setTimeout(clearActor, ms);
    return () => clearTimeout(t);
  }, [actorExpiresAt, clearActor]);

  // หน้านี้ต้องยืนยัน PIN ก่อนใช้งาน — ถ้ายังไม่มี actor เปิด PIN ให้อัตโนมัติ
  // deps = [actorEmployee] → ทำงานตอน mount และตอน actor หลุด (หมดอายุ/ออก) เท่านั้น
  // (กดยกเลิกจะไม่เด้งซ้ำเพราะ actorEmployee ไม่เปลี่ยน)
  useEffect(() => {
    if (!actorEmployee && !useActorModal.getState().open) {
      useActorModal.getState().request().catch(() => {
        /* ผู้ใช้กดยกเลิก — กดปุ่มยืนยันบนหน้าล็อกได้ */
      });
    }
  }, [actorEmployee]);

  const selectedShop = useMemo<Shop | undefined>(
    () => shops.find((s) => s.id === headerValues.shopId),
    [shops, headerValues.shopId],
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

  const totals = useMemo(() => {
    const qty = items.reduce((s, i) => s + i.quantity + (i.quantityCarton ?? 0), 0);
    const price = items.reduce(
      (s, i) => s + i.sellingPrice * i.quantity + (i.sellPriceCarton ?? 0) * (i.quantityCarton ?? 0),
      0,
    );
    return { qty, price };
  }, [items]);

  /** เปิด PIN modal ยืนยันผู้บันทึก — คืน true ถ้ามี actor ใช้ได้, false ถ้ายกเลิก */
  async function ensureActor() {
    if (useActor.getState().getValidToken()) return true;
    try {
      await useActorModal.getState().request();
      return true;
    } catch {
      return false;
    }
  }

  function handleVerifyActor() {
    useActorModal.getState().request().catch(() => {
      /* ผู้ใช้กดยกเลิก — ไม่ต้องทำอะไร */
    });
  }

  async function handleSave() {
    if (!canSave) return;
    const values = await form.validateFields();
    // ต้องยืนยันผู้บันทึก (PIN) ก่อนเสมอ — ถ้าไม่มี/หมดอายุ เปิด PIN ให้ยืนยันก่อน
    if (!(await ensureActor())) return;
    await createOrder.mutateAsync({
      shopId: values.shopId!,
      orderNumber: values.orderNumber?.trim() || undefined,
      note: values.note?.trim() || undefined,
      details: items.map((i) => ({
        productBarcode: i.barcode,
        quantityPack: i.quantity,
        quantityCarton: i.quantityCarton ?? 0,
      })),
    });
    form.setFieldsValue({ orderNumber: '', note: '' });
    setItems([]);
    setResetTick((t) => t + 1);
  }

  function handleClear() {
    form.resetFields();
    setItems([]);
    setResetTick((t) => t + 1);
  }

  // Hard gate — ต้องยืนยัน PIN ก่อนถึงจะเข้าใช้งานหน้าบันทึกออเดอร์ได้
  if (!actorEmployee) {
    return <ActorGate onVerify={handleVerifyActor} onBack={() => navigate('/dashboard')} />;
  }

  return (
    <Stack gap={3} style={{ paddingBottom: 80 }}>
      <PageHeader
        title="บันทึก Order"
        subtitle="เลือกร้านค้า → กรอกเลขคำสั่งซื้อ → สแกนสินค้า"
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

      <OperatorBar
        operatorName={actorEmployee?.name}
        onVerify={handleVerifyActor}
        onClear={clearActor}
      />

      <Form form={form} layout="vertical" requiredMark="optional">
        <Card size="small">
          <Grid cols={2} gap={4}>
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
                disabled={!shopReady}
                autoComplete="off"
                onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
              />
            </Form.Item>
          </Grid>
        </Card>

        {!showBill ? (
          <Alert
            type="info"
            showIcon
            message="เลือกร้านค้าเพื่อเริ่มเพิ่มสินค้า"
            style={{ marginTop: 4 }}
          />
        ) : (
          <PaperOrderCard
            orderNumber={headerValues.orderNumber?.trim() ?? ''}
            shop={selectedShop}
            operatorName={actorEmployee?.name}
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

function ActorGate({ onVerify, onBack }: { onVerify: () => void; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card size="small" style={{ maxWidth: 440, width: '100%' }}>
        <Stack gap={4} align="center" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <AppIcons.lock size={28} className="text-primary" />
          </div>
          <div>
            <Text strong style={{ fontSize: 16 }}>ต้องยืนยันตัวตนก่อนบันทึกออเดอร์</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">กดรหัส PIN พนักงานเพื่อเข้าใช้งานหน้านี้</Text>
            </div>
          </div>
          <Inline gap={2} wrap={false}>
            <Button onClick={onBack}>ย้อนกลับ</Button>
            <Button variant="primary" icon={<AppIcons.lock />} onClick={onVerify}>
              ยืนยันตัวตน (PIN)
            </Button>
          </Inline>
        </Stack>
      </Card>
    </div>
  );
}

function OperatorBar({
  operatorName,
  onVerify,
  onClear,
}: {
  operatorName?: string;
  onVerify: () => void;
  onClear: () => void;
}) {
  return (
    <Card size="small">
      <Inline justify="between" align="center" gap={3} wrap>
        <Inline gap={2} align="center" wrap={false}>
          <AppIcons.user className={operatorName ? 'text-success' : 'text-muted-foreground'} />
          {operatorName ? (
            <Text>
              กำลังบันทึกโดย <Text strong>{operatorName}</Text>
            </Text>
          ) : (
            <Text type="secondary">ยังไม่ได้ยืนยันผู้บันทึก — ต้องกด PIN ก่อนบันทึกออเดอร์</Text>
          )}
        </Inline>
        <Inline gap={2} wrap={false}>
          <Button icon={<AppIcons.lock />} onClick={onVerify}>
            {operatorName ? 'เปลี่ยนผู้บันทึก' : 'ยืนยันตัวตน (PIN)'}
          </Button>
          {operatorName && (
            <Button variant="ghost" onClick={onClear}>
              ออก
            </Button>
          )}
        </Inline>
      </Inline>
    </Card>
  );
}

interface PaperOrderCardProps {
  orderNumber: string;
  shop?: Shop;
  operatorName?: string;
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  resetSignal: number;
  noteField: React.ReactNode;
}

function PaperOrderCard({
  orderNumber,
  shop,
  operatorName,
  items,
  onItemsChange,
  resetSignal,
  noteField,
}: PaperOrderCardProps) {
  const accent = shop ? PlatformHex[shop.platform] : 'var(--color-primary)';

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <div style={{ height: 4, background: accent }} />

      <div className="border-b border-dashed border-border px-5 pt-3.5 pb-3">
        <Inline justify="between" align="center" gap={4} wrap>
          <div style={{ minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.6 }}>
              ORDER NUMBER
            </Text>
            <div className="mt-0.5 text-base leading-[1.3] font-semibold break-all text-foreground">
              {orderNumber || '—'}
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
          <InfoLine label="ผู้บันทึก" value={operatorName ?? '— ยังไม่ยืนยัน PIN'} />
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-5 py-2.5 shadow-sm"
    >
      <Inline gap={5} wrap={false}>
        <span style={{ fontSize: 13 }}>
          จำนวนรวม: <Text strong>{qty.toLocaleString()} ชิ้น</Text>
        </span>
        <span style={{ fontSize: 13 }}>
          ยอดรวม:{' '}
          <Text strong className="text-[15px] text-primary">
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
