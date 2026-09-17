import { useEffect } from 'react';
import { Dialog, Switch } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { BrandSearchSelect } from '@features/brand/components';
import { CategorySearchSelect } from '@features/category/components';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  btn,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT_LG,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  INPUT_NUMBER,
  LABEL,
  SWITCH,
  SWITCH_THUMB,
} from '@/lib/styles';
import type { Product, CreateProductDto, UpdateProductDto } from '../types';

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (values: CreateProductDto | UpdateProductDto) => Promise<void>;
  loading?: boolean;
}

const EMPTY = { isActive: true, remaining: 0 } as unknown as CreateProductDto;

/** ช่องกรอกจำนวนเงิน — สัญลักษณ์บาทอยู่ในกรอบ ไม่ใช่ addon ข้างนอก เพื่อไม่ให้แถวสูงขึ้น */
function MoneyField({
  id,
  label,
  register,
}: {
  id: string;
  label: string;
  register: React.ComponentProps<'input'>;
}) {
  return (
    <div className={FIELD_ROW}>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={0}
          step="0.01"
          placeholder="0"
          className={cn(INPUT_NUMBER, 'pr-7')}
          {...register}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-foreground-muted"
        >
          ฿
        </span>
      </div>
    </div>
  );
}

export function ProductFormModal({
  open,
  product,
  onClose,
  onSubmit,
  loading = false,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductDto>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ดูเหตุผลใน BrandFormModal
  useEffect(() => {
    if (!open) return;
    reset(
      product ?
        {
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
        }
      : EMPTY,
    );
  }, [open, product, reset]);

  const num = { valueAsNumber: true } as const;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content
          className={cn(DIALOG_CONTENT_LG, 'max-h-[85vh] overflow-y-auto')}
          aria-describedby={undefined}
        >
          <Dialog.Title className={DIALOG_TITLE}>
            {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => onSubmit(values))}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_ROW}>
                <label htmlFor="product-barcode" className={LABEL}>
                  Barcode
                </label>
                <input
                  id="product-barcode"
                  className={INPUT}
                  placeholder="8850999xxxxxx"
                  disabled={isEdit}
                  aria-invalid={!!errors.barcode}
                  {...register('barcode', { required: 'กรุณากรอก barcode' })}
                />
                {errors.barcode && <span className={FIELD_ERROR}>{errors.barcode.message}</span>}
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="product-sku" className={LABEL}>
                  SKU (รหัสภายใน)
                </label>
                <input
                  id="product-sku"
                  className={INPUT}
                  placeholder="COKE-CAN-325"
                  {...register('sku')}
                />
              </div>
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="product-name" className={LABEL}>
                ชื่อสินค้า
              </label>
              <input
                id="product-name"
                className={INPUT}
                placeholder="ชื่อสินค้า"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'กรุณากรอกชื่อสินค้า' })}
              />
              {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_ROW}>
                <label htmlFor="product-brand" className={LABEL}>
                  แบรนด์
                </label>
                <Controller
                  control={control}
                  name="brandId"
                  render={({ field }) => (
                    <BrandSearchSelect
                      id="product-brand"
                      allowClear
                      value={field.value ?? undefined}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="product-category" className={LABEL}>
                  หมวดหมู่
                </label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <CategorySearchSelect
                      id="product-category"
                      allowClear
                      value={field.value ?? undefined}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MoneyField
                id="product-cost-pack"
                label="ราคาทุน/แพ็ค"
                register={register('costPrice.pack', num)}
              />
              <MoneyField
                id="product-cost-carton"
                label="ราคาทุน/ลัง"
                register={register('costPrice.carton', num)}
              />
              <div className={FIELD_ROW}>
                <label htmlFor="product-remaining" className={LABEL}>
                  จำนวนเริ่มต้น
                </label>
                <input
                  id="product-remaining"
                  type="number"
                  min={0}
                  placeholder="0"
                  disabled={isEdit}
                  className={INPUT_NUMBER}
                  {...register('remaining', num)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MoneyField
                id="product-sell-pack"
                label="ราคาขาย/แพ็ค"
                register={register('sellPrice.pack', num)}
              />
              <MoneyField
                id="product-sell-carton"
                label="ราคาขาย/ลัง"
                register={register('sellPrice.carton', num)}
              />
              <div className={FIELD_ROW}>
                <label htmlFor="product-minstock" className={LABEL}>
                  stock ขั้นต่ำ
                </label>
                <input
                  id="product-minstock"
                  type="number"
                  min={0}
                  placeholder="50"
                  className={INPUT_NUMBER}
                  {...register('minStock', num)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className={FIELD_ROW}>
                <label htmlFor="product-pieces" className={LABEL}>
                  ชิ้น/แพ็ค
                </label>
                <input
                  id="product-pieces"
                  type="number"
                  min={1}
                  placeholder="12"
                  className={INPUT_NUMBER}
                  {...register('piecesPerPack', num)}
                />
              </div>
              <div className={FIELD_ROW}>
                <label htmlFor="product-packs" className={LABEL}>
                  แพ็ค/ลัง
                </label>
                <input
                  id="product-packs"
                  type="number"
                  min={1}
                  placeholder="10"
                  className={INPUT_NUMBER}
                  {...register('packPerCarton', num)}
                />
              </div>
              <div className={FIELD_ROW}>
                <label htmlFor="product-maxstock" className={LABEL}>
                  stock สูงสุด
                </label>
                <input
                  id="product-maxstock"
                  type="number"
                  min={0}
                  placeholder="2000"
                  className={INPUT_NUMBER}
                  {...register('maxStock', num)}
                />
              </div>
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="product-image" className={LABEL}>
                URL รูปภาพ
              </label>
              <input
                id="product-image"
                className={INPUT}
                placeholder="https://..."
                {...register('imageUrl')}
              />
            </div>

            <div className={FIELD_ROW}>
              <span className={LABEL}>สถานะ</span>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <Switch.Root
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                      className={SWITCH}
                    >
                      <Switch.Thumb className={SWITCH_THUMB} />
                    </Switch.Root>
                    <span className="text-sm text-foreground-light">
                      {field.value ? 'ใช้งาน' : 'ปิด'}
                    </span>
                  </label>
                )}
              />
            </div>

            <div className={DIALOG_FOOTER}>
              <button type="button" className={btn('ghost')} onClick={onClose} disabled={loading}>
                ยกเลิก
              </button>
              <button type="submit" className={btn('primary')} disabled={loading}>
                {loading && <AppIcons.loading spin />}
                {isEdit ? 'บันทึก' : 'เพิ่มสินค้า'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
