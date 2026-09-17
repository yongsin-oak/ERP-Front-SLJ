import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Popover } from 'radix-ui';
import { Controller, useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import { useShops, PlatformBadge, PLATFORM_ORDER, PlatformHex } from '@features/shop';
import type { Shop, Platform } from '@features/shop';
import { useActor, useActorModal } from '@features/auth';
import { AppIcons } from '@/lib/icons';
import { useCombobox } from '@/lib/useCombobox';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  CARD_SM,
  dataPill,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  INPUT_SM,
  LABEL,
  PAGE_HEADER,
  PAGE_SUBTITLE,
  PAGE_TITLE,
  POPOVER_CONTENT,
  SELECT_ITEM,
  SELECT_LABEL,
  SELECT_TRIGGER,
  SEPARATOR_H,
  TEXT,
} from '@/lib/styles';
import { OrderItemsEditor } from '../components';
import { useCreateOrder } from '../react-query';
import type { OrderItem } from '../types';

interface HeaderForm {
  shopId?: string;
  orderNumber?: string;
  note?: string;
}

const EMPTY: HeaderForm = { shopId: undefined, orderNumber: '', note: '' };

/**
 * ช่องเลือกร้านค้า จัดกลุ่มตามแพลตฟอร์ม + ค้นได้
 * Radix Select ค้นไม่ได้ และร้านค้าของศูนย์มีหลายสิบร้านข้ามแพลตฟอร์ม
 * การเลื่อนหาอย่างเดียวจึงช้าเกินไปสำหรับหน้าที่ Operator ใช้ทุกบิล
 */
function ShopGroupedSelect({
  shops,
  value,
  onChange,
  disabled,
  loading,
  invalid,
  id,
}: {
  shops: Shop[];
  value?: string;
  onChange: (v: string | undefined) => void;
  disabled?: boolean;
  loading?: boolean;
  invalid?: boolean;
  id?: string;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const shopById = useMemo(() => new Map(shops.map((s) => [s.id, s])), [shops]);

  // เรียงตามลำดับแพลตฟอร์มที่กำหนดไว้ เพื่อให้หัวกลุ่มเรียงเหมือนกันทุกครั้ง
  const options = useMemo(() => {
    const byPlatform = new Map<Platform, Shop[]>();
    PLATFORM_ORDER.forEach((p) => byPlatform.set(p, []));
    shops.forEach((s) => byPlatform.get(s.platform)?.push(s));
    return PLATFORM_ORDER.flatMap((p) =>
      (byPlatform.get(p) ?? []).map((s) => ({
        value: s.id,
        label: s.name,
        searchText: `${s.platform} ${s.name}`,
      })),
    );
  }, [shops]);

  const combo = useCombobox({ options, value, onChange });
  const selectedShop = value ? shopById.get(value) : undefined;

  return (
    <Popover.Root open={combo.open} onOpenChange={combo.setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          aria-invalid={invalid}
          className={SELECT_TRIGGER}
        >
          {selectedShop ?
            <span className="flex min-w-0 items-center gap-2">
              <PlatformBadge platform={selectedShop.platform} size={16} />
              <span className="truncate">{selectedShop.name}</span>
            </span>
          : <span className="text-foreground-muted">
              {loading ? 'กำลังโหลดร้านค้า…' : 'เลือกร้านค้า'}
            </span>
          }
          <AppIcons.chevronDown />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className={cn(POPOVER_CONTENT, 'w-(--radix-popover-trigger-width) p-0')}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            searchInputRef.current?.focus();
          }}
        >
          <div className="border-b border-border-muted p-1.5">
            <input
              ref={searchInputRef}
              value={combo.search}
              onChange={(e) => combo.onSearchChange(e.target.value)}
              onKeyDown={combo.onKeyDown}
              placeholder="ค้นหาร้านหรือแพลตฟอร์ม..."
              aria-label="ค้นหาร้านค้า"
              className={INPUT_SM}
            />
          </div>
          <div ref={combo.listRef} role="listbox" className="max-h-70 overflow-y-auto p-1">
            {combo.filtered.length === 0 ?
              <div className="px-2 py-6 text-center text-sm text-foreground-muted">ไม่พบร้านค้า</div>
            : combo.filtered.map((opt, i) => {
                const shop = shopById.get(opt.value);
                const prevShop = i > 0 ? shopById.get(combo.filtered[i - 1].value) : undefined;
                const showHeader = shop && shop.platform !== prevShop?.platform;
                return (
                  <div key={opt.value}>
                    {showHeader && (
                      <div className={cn(SELECT_LABEL, 'flex items-center gap-1.5')}>
                        <PlatformBadge platform={shop.platform} size={14} />
                        {shop.platform}
                      </div>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={opt.value === value}
                      data-index={i}
                      onMouseEnter={() => combo.setActiveIndex(i)}
                      onClick={() => combo.pick(opt.value)}
                      className={cn(
                        SELECT_ITEM,
                        'w-full text-left',
                        i === combo.activeIndex && 'bg-surface-200 text-foreground',
                      )}
                    >
                      {shop && <PlatformBadge platform={shop.platform} size={16} />}
                      <span className="flex-1 truncate">{opt.label}</span>
                      {opt.value === value && <AppIcons.check className="text-primary" />}
                    </button>
                  </div>
                );
              })
            }
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function OrderEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationItems = (location.state as { items?: OrderItem[] } | null)?.items;
  const [items, setItems] = useState<OrderItem[]>(locationItems ?? []);
  const [resetTick, setResetTick] = useState(0);
  // หัวบิลถูกยืนยันแล้วหรือยัง — true = เปิดบิลแล้ว (ล็อกร้านค้า/เลขคำสั่งซื้อ + เริ่มสแกนสินค้าได้)
  const [headerLocked, setHeaderLocked] = useState(false);
  // เวลาเริ่มบันทึกบิลนี้ — ตั้งตอนกดยืนยันหัวบิลครั้งแรก, ส่งขึ้น API ตอนบันทึก
  // (completedRecordAt = เวลาที่กดบันทึก) → backend เก็บลง column startRecordAt / completedRecordAt
  const startRecordAtRef = useRef<string | null>(null);

  const {
    register,
    control,
    trigger,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<HeaderForm>({ defaultValues: EMPTY, mode: 'onSubmit' });

  const headerValues = useWatch({ control }) as HeaderForm;

  const { data: shops = [], isLoading: shopsLoading } = useShops();
  const createOrder = useCreateOrder();
  // ผู้บันทึกปัจจุบัน = พนักงานที่ยืนยัน PIN (actor). presence = มีสิทธิ์ใช้หน้านี้
  // (token หมดอายุจะถูก auto-clear ด้านล่าง → actorEmployee = null → กลับไปหน้าล็อก PIN)
  const actorEmployee = useActor((s) => s.employee);
  const actorExpiresAt = useActor((s) => s.expiresAt);
  const clearActor = useActor((s) => s.clear);

  const shopReady = !!headerValues.shopId;
  const orderNumberReady = !!headerValues.orderNumber?.trim();
  // ยืนยันหัวบิลได้เมื่อกรอกร้านค้า + เลขคำสั่งซื้อครบ
  const canConfirmHeader = shopReady && orderNumberReady;
  // เปิดบิลหลังกดยืนยันหัวบิลเท่านั้น — กันบันทึกผิดร้าน/ผิดเลขคำสั่งซื้อ
  const showBill = headerLocked;
  const canSave = headerLocked && items.length > 0;

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
      useActorModal
        .getState()
        .request()
        .catch(() => {
          /* ผู้ใช้กดยกเลิก — กดปุ่มยืนยันบนหน้าล็อกได้ */
        });
    }
  }, [actorEmployee]);

  const selectedShop = useMemo<Shop | undefined>(
    () => shops.find((s) => s.id === headerValues.shopId),
    [shops, headerValues.shopId],
  );

  const totalQty = useMemo(
    () => items.reduce((s, i) => s + i.quantity + (i.quantityCarton ?? 0), 0),
    [items],
  );

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
    useActorModal
      .getState()
      .request()
      .catch(() => {
        /* ผู้ใช้กดยกเลิก — ไม่ต้องทำอะไร */
      });
  }

  /** ยืนยันหัวบิล — ผ่าน validate แล้วจึงเปิดบิลและล็อกร้านค้า/เลขคำสั่งซื้อ */
  async function handleConfirmHeader() {
    const ok = await trigger(['shopId', 'orderNumber']);
    if (!ok) return; // ข้อความขึ้นใต้ฟิลด์แล้ว
    // เริ่มจับเวลาบันทึกครั้งแรกที่เปิดบิล — reconfirm หลังแก้หัวบิลไม่รีเซ็ต (คงเวลาเริ่มเดิม)
    if (!startRecordAtRef.current) startRecordAtRef.current = dayjs().toISOString();
    setHeaderLocked(true);
  }

  /** ปลดล็อกหัวบิลเพื่อแก้ร้านค้า/เลขคำสั่งซื้อ — รายการสินค้าที่สแกนไว้ยังอยู่ */
  function handleEditHeader() {
    setHeaderLocked(false);
  }

  async function handleSave() {
    if (!canSave) return;
    const ok = await trigger();
    if (!ok) return;
    const values = getValues();
    // ต้องยืนยันผู้บันทึก (PIN) ก่อนเสมอ — ถ้าไม่มี/หมดอายุ เปิด PIN ให้ยืนยันก่อน
    if (!(await ensureActor())) return;
    await createOrder.mutateAsync({
      shopId: values.shopId!,
      orderNumber: values.orderNumber!.trim(),
      note: values.note?.trim() || undefined,
      startRecordAt: startRecordAtRef.current ?? undefined,
      completedRecordAt: dayjs().toISOString(),
      details: items.map((i) => ({
        productBarcode: i.barcode,
        quantityPack: i.quantity,
        quantityCarton: i.quantityCarton ?? 0,
      })),
    });
    setValue('orderNumber', '');
    setValue('note', '');
    setItems([]);
    setResetTick((t) => t + 1);
    startRecordAtRef.current = null;
    // บิลถัดไปต้องกรอกเลขคำสั่งซื้อ + ยืนยันหัวบิลใหม่ (ร้านค้าเดิมยังถูกเลือกไว้)
    setHeaderLocked(false);
  }

  function handleClear() {
    reset(EMPTY);
    setItems([]);
    setResetTick((t) => t + 1);
    startRecordAtRef.current = null;
    setHeaderLocked(false);
  }

  // Hard gate — ต้องยืนยัน PIN ก่อนถึงจะเข้าใช้งานหน้าบันทึกออเดอร์ได้
  if (!actorEmployee) {
    return <ActorGate onVerify={handleVerifyActor} onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="flex flex-col gap-3 pb-20">
      <div className={PAGE_HEADER}>
        <div className="min-w-0">
          <h1 className={PAGE_TITLE}>บันทึก Order</h1>
          <p className={PAGE_SUBTITLE}>
            เลือกร้านค้า → กรอกเลขคำสั่งซื้อ → ยืนยันหัวบิล → สแกนสินค้า
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn()} onClick={() => navigate('/order/history')}>
            <AppIcons.history />
            ประวัติออเดอร์
          </button>
          <button type="button" className={btn()} onClick={handleClear}>
            <AppIcons.refresh />
            ล้างฟอร์ม
          </button>
        </div>
      </div>

      <OperatorBar
        operatorName={actorEmployee?.name}
        onVerify={handleVerifyActor}
        onClear={clearActor}
      />

      <form noValidate onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-3">
        <section className={CARD_SM}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={FIELD_ROW}>
              <label htmlFor="order-shop" className={cn(LABEL, 'inline-flex items-center gap-1.5')}>
                <AppIcons.shop />
                ร้านค้า / แพลตฟอร์ม
              </label>
              <Controller
                control={control}
                name="shopId"
                rules={{ required: 'กรุณาเลือกร้านค้า' }}
                render={({ field }) => (
                  <ShopGroupedSelect
                    id="order-shop"
                    shops={shops}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={headerLocked}
                    loading={shopsLoading}
                    invalid={!!errors.shopId}
                  />
                )}
              />
              {errors.shopId && <span className={FIELD_ERROR}>{errors.shopId.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="order-number" className={LABEL}>
                เลขคำสั่งซื้อ
              </label>
              <input
                id="order-number"
                className={INPUT}
                placeholder="ยิง / กรอกเลขคำสั่งซื้อจากแพลตฟอร์ม"
                disabled={!shopReady || headerLocked}
                autoComplete="off"
                aria-invalid={!!errors.orderNumber}
                {...register('orderNumber', { required: 'กรุณากรอกเลขคำสั่งซื้อ' })}
                // ยิงบาร์โค้ดจบด้วย Enter → ยืนยันหัวบิลทันที
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  void handleConfirmHeader();
                }}
              />
              {errors.orderNumber && (
                <span className={FIELD_ERROR}>{errors.orderNumber.message}</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {headerLocked ?
              <>
                <span className="flex items-center gap-2">
                  <AppIcons.success className="size-4 text-success" />
                  <span className={TEXT.subtle}>เปิดบิลแล้ว — สแกนสินค้าได้เลย</span>
                </span>
                <button type="button" className={btn()} onClick={handleEditHeader}>
                  <AppIcons.edit />
                  แก้ไขหัวบิล
                </button>
              </>
            : <button
                type="button"
                className={btn('primary')}
                disabled={!canConfirmHeader}
                onClick={() => void handleConfirmHeader()}
              >
                <AppIcons.check />
                ยืนยันหัวบิล
              </button>
            }
          </div>
        </section>

        {!showBill ?
          <div className={alertBox('info')}>
            <AppIcons.alert />
            <span>
              กรอกร้านค้าและเลขคำสั่งซื้อ แล้วกด “ยืนยันหัวบิล” เพื่อเปิดบิลและเริ่มสแกนสินค้า
            </span>
          </div>
        : <PaperOrderCard
            orderNumber={headerValues.orderNumber?.trim() ?? ''}
            shop={selectedShop}
            operatorName={actorEmployee?.name}
            items={items}
            onItemsChange={setItems}
            resetSignal={resetTick}
            noteField={
              <div className={FIELD_ROW}>
                <label htmlFor="order-note" className={LABEL}>
                  หมายเหตุ
                </label>
                <input
                  id="order-note"
                  className={INPUT}
                  placeholder="หมายเหตุ (ถ้ามี)"
                  {...register('note')}
                />
              </div>
            }
          />
        }
      </form>

      <SaveBar
        ready={canSave}
        loading={createOrder.isPending}
        qty={totalQty}
        onSave={() => void handleSave()}
      />
    </div>
  );
}

function ActorGate({ onVerify, onBack }: { onVerify: () => void; onBack: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <section className={cn(CARD_SM, 'w-full max-w-110')}>
        <div className="flex flex-col items-center gap-4 px-2 py-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <AppIcons.lock className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-base font-medium text-foreground">
              ต้องยืนยันตัวตนก่อนบันทึกออเดอร์
            </p>
            <p className={cn(TEXT.muted, 'mt-1')}>กดรหัส PIN พนักงานเพื่อเข้าใช้งานหน้านี้</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className={btn()} onClick={onBack}>
              ย้อนกลับ
            </button>
            <button type="button" className={btn('primary')} onClick={onVerify}>
              <AppIcons.lock />
              ยืนยันตัวตน (PIN)
            </button>
          </div>
        </div>
      </section>
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
    <section className={CARD_SM}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <AppIcons.user className={operatorName ? 'text-success' : 'text-foreground-muted'} />
          {operatorName ?
            <span className="text-sm">
              กำลังบันทึกโดย <strong className="font-medium">{operatorName}</strong>
            </span>
          : <span className={TEXT.muted}>
              ยังไม่ได้ยืนยันผู้บันทึก — ต้องกด PIN ก่อนบันทึกออเดอร์
            </span>
          }
        </span>
        <div className="flex gap-2">
          <button type="button" className={btn()} onClick={onVerify}>
            <AppIcons.lock />
            {operatorName ? 'เปลี่ยนผู้บันทึก' : 'ยืนยันตัวตน (PIN)'}
          </button>
          {operatorName && (
            <button type="button" className={btn('ghost')} onClick={onClear}>
              ออก
            </button>
          )}
        </div>
      </div>
    </section>
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
  // สีแบรนด์ของแพลตฟอร์มภายนอก (Shopee/Lazada/…) — เป็นข้อมูล ไม่ใช่โทเคนของระบบเรา
  const accent = shop ? PlatformHex[shop.platform] : 'var(--color-primary)';

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="h-1" style={{ background: accent }} />

      <div className="border-b border-dashed border-border px-5 pt-3.5 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[11px] tracking-wide text-foreground-lighter">ORDER NUMBER</span>
            <div className="mt-0.5 text-base leading-[1.3] font-semibold break-all text-foreground">
              {orderNumber || '—'}
            </div>
          </div>

          {shop && (
            <div className="flex items-center gap-2.5">
              <PlatformBadge platform={shop.platform} size={28} />
              <div>
                <div className="text-sm font-medium">{shop.name}</div>
                <span className="text-[11px] text-foreground-lighter">{shop.platform}</span>
              </div>
            </div>
          )}
        </div>

        <div className={cn(SEPARATOR_H, 'my-3')} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <InfoLine label="ผู้บันทึก" value={operatorName ?? '— ยังไม่ยืนยัน PIN'} />
          <InfoLine label="วันที่บันทึก" value={dayjs().format('DD/MM/YYYY HH:mm')} />
          <div>{noteField}</div>
        </div>
      </div>

      <div className="px-5 pt-3.5 pb-4.5">
        <div className="mb-2.5 flex items-center gap-2">
          <AppIcons.cart style={{ color: accent }} />
          <span className="text-sm font-medium">รายการสินค้า</span>
          {items.length > 0 && <span className={dataPill('blue')}>{items.length} รายการ</span>}
        </div>
        <OrderItemsEditor items={items} onChange={onItemsChange} resetSignal={resetSignal} />
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-[10px] tracking-wide text-foreground-lighter">
        {label.toUpperCase()}
      </span>
      <div className="text-xs font-medium">{value}</div>
    </div>
  );
}

function SaveBar({
  ready,
  loading,
  qty,
  onSave,
}: {
  ready: boolean;
  loading: boolean;
  qty: number;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-end gap-5 border-t border-border bg-background px-5 py-2.5">
      <span className="text-sm">
        จำนวนรวม:{' '}
        <strong className="font-mono font-medium tabular-nums">{qty.toLocaleString()} ชิ้น</strong>
      </span>
      <button
        type="button"
        className={btn('primary')}
        disabled={!ready || loading}
        onClick={onSave}
      >
        {loading ? <AppIcons.loading spin /> : <AppIcons.save />}
        บันทึกคำสั่งซื้อ
      </button>
    </div>
  );
}
