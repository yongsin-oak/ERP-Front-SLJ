import { useEffect } from 'react';
import { Dialog, Select } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { AppIcons } from '@/lib/icons';
import {
  btn,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT,
  DIALOG_FOOTER,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  FIELD_ERROR,
  FIELD_ROW,
  INPUT,
  LABEL,
  SELECT_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  SELECT_VIEWPORT,
  TEXTAREA,
} from '@/lib/styles';
import { PlatformBadge } from './PlatformBadge';
import { PLATFORM_ORDER } from '../types';
import type { Shop, CreateShopDto, Platform } from '../types';

interface Props {
  open: boolean;
  shop?: Shop | null;
  onClose: () => void;
  onSubmit: (values: CreateShopDto) => Promise<void>;
  loading?: boolean;
}

const EMPTY = { name: '', platform: undefined, description: '' } as unknown as CreateShopDto;

export function ShopFormModal({ open, shop, onClose, onSubmit, loading }: Props) {
  const isEdit = !!shop;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateShopDto>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ดูเหตุผลใน BrandFormModal
  useEffect(() => {
    if (!open) return;
    reset(
      shop ?
        { name: shop.name, platform: shop.platform, description: shop.description ?? '' }
      : EMPTY,
    );
  }, [open, shop, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={DIALOG_TITLE}>
            {isEdit ? 'แก้ไขร้านค้า' : 'เพิ่มร้านค้า'}
          </Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) =>
              onSubmit({ ...values, description: values.description || undefined }),
            )}
          >
            <div className={FIELD_ROW}>
              <label htmlFor="shop-platform" className={LABEL}>
                แพลตฟอร์ม
              </label>
              <Controller
                control={control}
                name="platform"
                rules={{ required: 'กรุณาเลือกแพลตฟอร์ม' }}
                render={({ field }) => (
                  <Select.Root value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger
                      id="shop-platform"
                      ref={field.ref}
                      aria-invalid={!!errors.platform}
                      className={SELECT_TRIGGER}
                    >
                      <Select.Value placeholder="เลือกแพลตฟอร์ม" />
                      <Select.Icon>
                        <AppIcons.chevronDown />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                        <Select.Viewport className={SELECT_VIEWPORT}>
                          {PLATFORM_ORDER.map((p: Platform) => (
                            <Select.Item key={p} value={p} className={SELECT_ITEM}>
                              <Select.ItemText>
                                <span className="flex items-center gap-2">
                                  <PlatformBadge platform={p} size={16} />
                                  {p}
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
              {errors.platform && <span className={FIELD_ERROR}>{errors.platform.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="shop-name" className={LABEL}>
                ชื่อร้าน
              </label>
              <input
                id="shop-name"
                className={INPUT}
                placeholder="ชื่อร้าน"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'กรุณากรอกชื่อร้าน' })}
              />
              {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="shop-description" className={LABEL}>
                รายละเอียด
              </label>
              <textarea
                id="shop-description"
                rows={3}
                className={TEXTAREA}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                {...register('description')}
              />
            </div>

            <div className={DIALOG_FOOTER}>
              <button type="button" className={btn('ghost')} onClick={onClose} disabled={loading}>
                ยกเลิก
              </button>
              <button type="submit" className={btn('primary')} disabled={loading}>
                {loading && <AppIcons.loading spin />}
                {isEdit ? 'บันทึก' : 'เพิ่มร้านค้า'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
