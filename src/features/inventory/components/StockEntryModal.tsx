import { useState, useRef, useEffect } from 'react';
import { Dialog, Select } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { EmployeeSearchSelect } from '@features/employee/components';
import { notify } from '@shared';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  INPUT_NUMBER,
  LABEL,
  dataPill,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  SELECT_VIEWPORT,
  SEPARATOR_H,
  tag,
} from '@/lib/styles';
import { inventoryService, useCreateStockEntry } from '../react-query';
import { StockEntryTypes } from '../types';
import type { CreateStockEntryDto, StockEntryType, Product } from '../types';

const TYPE_KEYS = Object.keys(StockEntryTypes) as StockEntryType[];

type FormValues = CreateStockEntryDto & { quantity: number };

const EMPTY = { type: 'in', quantity: 1, employeeId: undefined, note: '' } as unknown as FormValues;

interface Props {
  open: boolean;
  onClose: () => void;
  initialBarcode?: string;
}

export function StockEntryModal({ open, onClose, initialBarcode }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  // เริ่มจาก barcode ที่ผู้เรียกส่งมา — ผู้เรียกใส่ `key` ให้ตาม barcode
  // โมดัลจึงถูกสร้างใหม่เมื่อเปลี่ยนสินค้า ไม่ต้องคอย sync prop ลง state ใน effect
  const [barcodeInput, setBarcodeInput] = useState(initialBarcode ?? '');
  const [lookingUp, setLookingUp] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: EMPTY });

  const createStockEntry = useCreateStockEntry();

  async function lookupBarcode(barcode: string) {
    if (!barcode) return;
    setLookingUp(true);
    try {
      const res = await inventoryService.getByBarcode(barcode);
      setProduct(res.data.data);
    } catch {
      notify.error('สแกน barcode ไม่สำเร็จ', `ไม่พบสินค้า "${barcode}"`);
      setProduct(null);
    } finally {
      setLookingUp(false);
    }
  }

  // ค้นสินค้าให้เลยเมื่อเปิดมาพร้อม barcode — ผู้ใช้กด "รับสินค้าเข้า" จากแถวไหนก็ควรเห็นสินค้านั้นทันที
  useEffect(() => {
    if (open && initialBarcode) void lookupBarcode(initialBarcode);
  }, [open, initialBarcode]);

  async function handleBarcodeSubmit() {
    await lookupBarcode(barcodeInput.trim());
  }

  async function handleFinish(values: FormValues) {
    if (!product) return;
    await createStockEntry.mutateAsync({ ...values, productBarcode: product.barcode });
    handleClose();
  }

  function handleClose() {
    setBarcodeInput('');
    setProduct(null);
    reset(EMPTY);
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={cn(DIALOG_TITLE, 'flex items-center gap-2')}>
            <AppIcons.inbox className="text-success" />
            บันทึกรับสินค้าเข้าสต้อค
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          <div className={FIELD_ROW}>
            <label htmlFor="stock-entry-barcode" className={LABEL}>
              สแกน Barcode สินค้า
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <AppIcons.barcode className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-foreground-muted" />
                <input
                  id="stock-entry-barcode"
                  ref={barcodeRef}
                  className={cn(INPUT, 'pl-9')}
                  placeholder="สแกนหรือพิมพ์ barcode แล้วกด Enter"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void handleBarcodeSubmit();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className={btn()}
                onClick={() => void handleBarcodeSubmit()}
                disabled={lookingUp}
              >
                {lookingUp && <AppIcons.loading spin />}
                ค้นหา
              </button>
            </div>
          </div>

          {product && (
            <div className={alertBox('success')}>
              <AppIcons.success />
              <div>
                <span className="font-semibold">{product.name}</span>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={tag('neutral')}>{product.barcode}</span>
                  <span className="text-xs text-foreground-subtle">
                    สต้อคปัจจุบัน: <strong>{product.remaining} ชิ้น</strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={SEPARATOR_H} />

          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(handleFinish)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_ROW}>
                <label htmlFor="stock-entry-type" className={LABEL}>
                  ประเภท
                </label>
                <Controller
                  control={control}
                  name="type"
                  rules={{ required: 'กรุณาเลือกประเภท' }}
                  render={({ field }) => (
                    <Select.Root value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger
                        id="stock-entry-type"
                        ref={field.ref}
                        aria-invalid={!!errors.type}
                        className={SELECT_TRIGGER}
                      >
                        <Select.Value placeholder="เลือกประเภท" />
                        <Select.Icon>
                          <AppIcons.chevronDown />
                        </Select.Icon>
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                          <Select.Viewport className={SELECT_VIEWPORT}>
                            {TYPE_KEYS.map((t) => (
                              <Select.Item key={t} value={t} className={SELECT_ITEM}>
                                <Select.ItemText>
                                  <span className={dataPill(StockEntryTypes[t].color)}>
                                    {StockEntryTypes[t].label}
                                  </span>
                                </Select.ItemText>
                                <Select.ItemIndicator className="absolute right-2 text-primary">
                                  <AppIcons.check />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))}
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  )}
                />
                {errors.type && <span className={FIELD_ERROR}>{errors.type.message}</span>}
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="stock-entry-qty" className={LABEL}>
                  จำนวน (ชิ้น)
                </label>
                <input
                  id="stock-entry-qty"
                  type="number"
                  min={1}
                  className={INPUT_NUMBER}
                  aria-invalid={!!errors.quantity}
                  {...register('quantity', {
                    required: 'กรุณากรอกจำนวน',
                    valueAsNumber: true,
                    min: { value: 1, message: 'ต้องอย่างน้อย 1 ชิ้น' },
                  })}
                />
                {errors.quantity && <span className={FIELD_ERROR}>{errors.quantity.message}</span>}
              </div>
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="stock-entry-employee" className={LABEL}>
                พนักงานผู้บันทึก
              </label>
              <Controller
                control={control}
                name="employeeId"
                rules={{ required: 'กรุณาเลือกพนักงาน' }}
                render={({ field }) => (
                  <EmployeeSearchSelect
                    id="stock-entry-employee"
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    aria-invalid={!!errors.employeeId}
                  />
                )}
              />
              {errors.employeeId && <span className={FIELD_ERROR}>{errors.employeeId.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="stock-entry-note" className={LABEL}>
                หมายเหตุ
              </label>
              <input
                id="stock-entry-note"
                className={INPUT}
                placeholder="หมายเหตุ (ถ้ามี)"
                {...register('note')}
              />
            </div>

            <div className={DIALOG_FOOTER}>
              <button type="button" className={btn()} onClick={handleClose}>
                ยกเลิก
              </button>
              <button
                type="submit"
                className={btn('primary')}
                disabled={!product || createStockEntry.isPending}
              >
                {createStockEntry.isPending && <AppIcons.loading spin />}
                บันทึก
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
