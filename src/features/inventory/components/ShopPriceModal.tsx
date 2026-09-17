import { useEffect, useRef, useState } from 'react';
import { AlertDialog, Dialog, DropdownMenu, Popover } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { useShops, PlatformBadge } from '@features/shop';
import { AppIcons } from '@/lib/icons';
import { formatMoney } from '@/lib/format';
import { useCombobox } from '@/lib/useCombobox';
import { cn } from '@/lib/utils';
import {
  btn,
  btnIcon,
  dataPill,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_CONTENT_XL,
  DIALOG_DESC,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT_NUMBER,
  INPUT_SM,
  LABEL,
  MENU_CONTENT,
  MENU_ITEM,
  MENU_ITEM_DANGER,
  MENU_SEPARATOR,
  POPOVER_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  TABLE,
  TABLE_EMPTY,
  TABLE_TD,
  TABLE_TH,
  TABLE_TR,
  TABLE_WRAP,
} from '@/lib/styles';
import { useShopPrices, useCreateShopPrice, useUpdateShopPrice, useDeleteShopPrice } from '../react-query';
import type { ShopPrice, CreateShopPriceDto } from '../types';

interface Props {
  open: boolean;
  barcode: string;
  productName: string;
  onClose: () => void;
}

interface FormValues {
  shopId: string;
  sellPack?: number;
  sellCarton?: number;
  costPack?: number;
  costCarton?: number;
}

const EMPTY = {
  shopId: '',
  sellPack: undefined,
  sellCarton: undefined,
  costPack: undefined,
  costCarton: undefined,
} as unknown as FormValues;

/** ช่องเลือกร้านค้าที่ค้นได้ — ร้านค้าหลายสิบร้าน เลื่อนหาอย่างเดียวช้า */
function ShopSelect({
  value,
  onChange,
  options,
  id,
  invalid,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { label: string; value: string }[];
  id?: string;
  invalid?: boolean;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const combo = useCombobox({ options, value, onChange });

  return (
    <Popover.Root open={combo.open} onOpenChange={combo.setOpen}>
      <Popover.Trigger asChild>
        <button type="button" id={id} aria-invalid={invalid} className={SELECT_TRIGGER}>
          <span className={cn('truncate', !combo.selected && 'text-foreground-muted')}>
            {combo.selected?.label ?? 'เลือกร้านค้า'}
          </span>
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
              placeholder="ค้นหาร้านค้า..."
              aria-label="ค้นหาร้านค้า"
              className={INPUT_SM}
            />
          </div>
          <div ref={combo.listRef} role="listbox" className="max-h-60 overflow-y-auto p-1">
            {combo.filtered.length === 0 ?
              <div className="px-2 py-6 text-center text-sm text-foreground-muted">ไม่พบร้านค้า</div>
            : combo.filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={opt.value === value}
                  data-index={i}
                  onMouseEnter={() => combo.setActiveIndex(i)}
                  onClick={() => combo.pick(opt.value)}
                  className={cn(
                    SELECT_ITEM,
                    'text-left',
                    i === combo.activeIndex && 'bg-surface-200 text-foreground',
                  )}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.value === value && <AppIcons.check className="text-primary" />}
                </button>
              ))
            }
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function ShopPriceModal({ open, barcode, productName, onClose }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShopPrice | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ShopPrice | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: EMPTY });

  const { data: prices = [], isLoading } = useShopPrices(barcode, { enabled: open });
  const { data: shops = [] } = useShops();

  const create = useCreateShopPrice(barcode);
  const update = useUpdateShopPrice(barcode);
  const remove = useDeleteShopPrice(barcode);

  // เติมค่าเดิมทุกครั้งที่เปิดฟอร์ม — ไม่งั้นแก้ร้านที่สองจะเห็นราคาของร้านแรกค้างอยู่
  useEffect(() => {
    if (!formOpen) return;
    reset(
      editing ?
        {
          shopId: editing.shopId,
          sellPack: editing.sellPrice?.pack,
          sellCarton: editing.sellPrice?.carton,
          costPack: editing.costPrice?.pack,
          costCarton: editing.costPrice?.carton,
        }
      : EMPTY,
    );
  }, [formOpen, editing, reset]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(price: ShopPrice) {
    setEditing(price);
    setFormOpen(true);
  }

  async function handleFinish(values: FormValues) {
    const dto: CreateShopPriceDto = {
      shopId: editing?.shopId ?? values.shopId,
      sellPrice: { pack: values.sellPack, carton: values.sellCarton },
      costPrice:
        values.costPack != null || values.costCarton != null ?
          { pack: values.costPack, carton: values.costCarton }
        : undefined,
    };
    if (editing) {
      await update.mutateAsync({ shopId: editing.shopId, dto });
    } else {
      await create.mutateAsync(dto);
    }
    setFormOpen(false);
  }

  const shopMap = new Map(shops.map((s) => [s.id, s]));
  const usedShopIds = new Set(prices.map((p) => p.shopId));
  const availableShops = shops.filter((s) => !usedShopIds.has(s.id));
  const shopOptions = availableShops.map((s) => ({
    label: `${s.name} (${s.platform})`,
    value: s.id,
  }));

  const num = { valueAsNumber: true } as const;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content
            className={cn(DIALOG_CONTENT_XL, 'max-h-[85vh] overflow-y-auto')}
            aria-describedby={undefined}
          >
            <Dialog.Title className={DIALOG_TITLE}>ราคาร้านค้าเฉพาะ — {productName}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
                <AppIcons.close />
              </button>
            </Dialog.Close>

            <div className="flex justify-end">
              <button
                type="button"
                className={btn('primary')}
                onClick={openAdd}
                disabled={availableShops.length === 0}
              >
                <AppIcons.add />
                เพิ่มราคาร้านค้า
              </button>
            </div>

            <div className={TABLE_WRAP}>
              <table className={cn(TABLE, 'min-w-190')}>
                <thead>
                  <tr>
                    <th className={TABLE_TH}>ร้านค้า</th>
                    <th className={cn(TABLE_TH, 'w-25')}>Platform</th>
                    <th className={cn(TABLE_TH, 'w-33 text-right')}>ราคาขาย / Pack</th>
                    <th className={cn(TABLE_TH, 'w-35 text-right')}>ราคาขาย / Carton</th>
                    <th className={cn(TABLE_TH, 'w-33 text-right')}>ราคาทุน / Pack</th>
                    <th className={cn(TABLE_TH, 'w-35 text-right')}>ราคาทุน / Carton</th>
                    <th className={cn(TABLE_TH, 'w-14 text-center')}>
                      <span className="sr-only">ตัวเลือก</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ?
                    <tr>
                      <td colSpan={7} className={TABLE_EMPTY}>
                        <AppIcons.loading spin className="mx-auto size-5 text-primary" />
                      </td>
                    </tr>
                  : prices.length === 0 ?
                    <tr>
                      <td colSpan={7} className={TABLE_EMPTY}>
                        ยังไม่มีราคาเฉพาะร้าน — สินค้านี้ใช้ราคากลาง
                      </td>
                    </tr>
                  : prices.map((r) => {
                      const shop = shopMap.get(r.shopId);
                      return (
                        <tr key={r.id} className={TABLE_TR}>
                          <td className={TABLE_TD}>
                            {shop ?
                              <span className="flex items-center gap-2">
                                <PlatformBadge platform={shop.platform} size={16} />
                                <span>{shop.name}</span>
                              </span>
                            : r.shopId}
                          </td>
                          <td className={TABLE_TD}>
                            {shop ? <span className={dataPill('blue')}>{shop.platform}</span> : '-'}
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            {r.sellPrice?.pack != null ?
                              <span className="font-medium text-success-text">
                                {formatMoney(r.sellPrice.pack)}
                              </span>
                            : <span className="text-foreground-subtle">—</span>}
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            {r.sellPrice?.carton != null ?
                              <span className="font-medium text-success-text">
                                {formatMoney(r.sellPrice.carton)}
                              </span>
                            : <span className="text-foreground-subtle">—</span>}
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            {r.costPrice?.pack != null ?
                              <span className="text-foreground-lighter">
                                {formatMoney(r.costPrice.pack)}
                              </span>
                            : <span className="text-foreground-subtle">—</span>}
                          </td>
                          <td className={cn(TABLE_TD, 'text-right font-mono tabular-nums')}>
                            {r.costPrice?.carton != null ?
                              <span className="text-foreground-lighter">
                                {formatMoney(r.costPrice.carton)}
                              </span>
                            : <span className="text-foreground-subtle">—</span>}
                          </td>
                          <td className={cn(TABLE_TD, 'text-center')}>
                            <DropdownMenu.Root>
                              <DropdownMenu.Trigger asChild>
                                <button
                                  type="button"
                                  aria-label="ตัวเลือกของแถวนี้"
                                  className={btnIcon('ghost', 'sm')}
                                >
                                  <AppIcons.more />
                                </button>
                              </DropdownMenu.Trigger>
                              <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                  align="end"
                                  sideOffset={4}
                                  className={MENU_CONTENT}
                                >
                                  <DropdownMenu.Item
                                    className={MENU_ITEM}
                                    onSelect={() => openEdit(r)}
                                  >
                                    แก้ไข
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Separator className={MENU_SEPARATOR} />
                                  <DropdownMenu.Item
                                    className={MENU_ITEM_DANGER}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setPendingDelete(r);
                                    }}
                                  >
                                    ลบ
                                  </DropdownMenu.Item>
                                </DropdownMenu.Content>
                              </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ฟอร์มเพิ่ม/แก้ไขราคา */}
      <Dialog.Root open={formOpen} onOpenChange={(o) => !o && setFormOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className={DIALOG_OVERLAY} />
          <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
            <Dialog.Title className={DIALOG_TITLE}>
              {editing ? 'แก้ไขราคาร้านค้า' : 'เพิ่มราคาร้านค้า'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
                <AppIcons.close />
              </button>
            </Dialog.Close>

            <form
              noValidate
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(handleFinish)}
            >
              {!editing && (
                <div className={FIELD_ROW}>
                  <label htmlFor="shopprice-shop" className={LABEL}>
                    ร้านค้า
                  </label>
                  <Controller
                    control={control}
                    name="shopId"
                    rules={{ required: 'กรุณาเลือกร้านค้า' }}
                    render={({ field }) => (
                      <ShopSelect
                        id="shopprice-shop"
                        value={field.value || undefined}
                        onChange={(v) => field.onChange(v ?? '')}
                        options={shopOptions}
                        invalid={!!errors.shopId}
                      />
                    )}
                  />
                  {errors.shopId && <span className={FIELD_ERROR}>{errors.shopId.message}</span>}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={FIELD_ROW}>
                  <label htmlFor="shopprice-sell-pack" className={LABEL}>
                    ราคาขาย / Pack (฿)
                  </label>
                  <input
                    id="shopprice-sell-pack"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="ไม่กำหนด"
                    className={INPUT_NUMBER}
                    {...register('sellPack', num)}
                  />
                </div>
                <div className={FIELD_ROW}>
                  <label htmlFor="shopprice-sell-carton" className={LABEL}>
                    ราคาขาย / Carton (฿)
                  </label>
                  <input
                    id="shopprice-sell-carton"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="ไม่กำหนด"
                    className={INPUT_NUMBER}
                    {...register('sellCarton', num)}
                  />
                </div>
                <div className={FIELD_ROW}>
                  <label htmlFor="shopprice-cost-pack" className={LABEL}>
                    ราคาทุน / Pack (฿)
                  </label>
                  <input
                    id="shopprice-cost-pack"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="ไม่กำหนด"
                    className={INPUT_NUMBER}
                    {...register('costPack', num)}
                  />
                </div>
                <div className={FIELD_ROW}>
                  <label htmlFor="shopprice-cost-carton" className={LABEL}>
                    ราคาทุน / Carton (฿)
                  </label>
                  <input
                    id="shopprice-cost-carton"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="ไม่กำหนด"
                    className={INPUT_NUMBER}
                    {...register('costCarton', num)}
                  />
                </div>
              </div>

              <div className={DIALOG_FOOTER}>
                <button type="button" className={btn()} onClick={() => setFormOpen(false)}>
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className={btn('primary')}
                  disabled={editing ? update.isPending : create.isPending}
                >
                  {(editing ? update.isPending : create.isPending) && <AppIcons.loading spin />}
                  {editing ? 'บันทึก' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={DIALOG_OVERLAY} />
          <AlertDialog.Content className={cn(DIALOG_CONTENT, 'max-w-sm')}>
            <AlertDialog.Title className={DIALOG_TITLE}>ลบราคาร้านค้านี้?</AlertDialog.Title>
            <AlertDialog.Description className={DIALOG_DESC}>
              สินค้านี้จะกลับไปใช้ราคากลางสำหรับร้านนั้น
            </AlertDialog.Description>
            <div className={DIALOG_FOOTER}>
              <AlertDialog.Cancel asChild>
                <button type="button" className={btn()}>
                  ยกเลิก
                </button>
              </AlertDialog.Cancel>
              <button
                type="button"
                className={btn('danger')}
                disabled={remove.isPending}
                onClick={() => {
                  if (pendingDelete) remove.mutate(pendingDelete.shopId);
                  setPendingDelete(null);
                }}
              >
                {remove.isPending && <AppIcons.loading spin />}
                ลบ
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
