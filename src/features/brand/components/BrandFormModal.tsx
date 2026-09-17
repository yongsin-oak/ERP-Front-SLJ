import { useEffect } from 'react';
import { Dialog } from 'radix-ui';
import { useForm } from 'react-hook-form';
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
  TEXTAREA,
} from '@/lib/styles';
import type { Brand, CreateBrandDto } from '../types';

interface Props {
  open: boolean;
  brand?: Brand | null;
  onClose: () => void;
  onSubmit: (values: CreateBrandDto) => Promise<void>;
  loading?: boolean;
}

const EMPTY: CreateBrandDto = { name: '', description: '' };

export function BrandFormModal({ open, brand, onClose, onSubmit, loading }: Props) {
  const isEdit = !!brand;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBrandDto>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ถ้า reset แค่ตอน mount ผู้ใช้ที่กดแก้ไขรายการที่สอง
  // จะเห็นค่าของรายการแรกค้างอยู่ (Radix ไม่ unmount เนื้อหาระหว่าง open สลับ)
  useEffect(() => {
    if (!open) return;
    reset(brand ? { name: brand.name, description: brand.description ?? '' } : EMPTY);
  }, [open, brand, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={DIALOG_TITLE}>
            {isEdit ? 'แก้ไขแบรนด์' : 'เพิ่มแบรนด์'}
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
            <div className={FIELD_ROW}>
              <label htmlFor="brand-name" className={LABEL}>
                ชื่อแบรนด์
              </label>
              <input
                id="brand-name"
                className={INPUT}
                placeholder="ชื่อแบรนด์"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'กรุณากรอกชื่อแบรนด์' })}
              />
              {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="brand-description" className={LABEL}>
                รายละเอียด
              </label>
              <textarea
                id="brand-description"
                rows={3}
                className={TEXTAREA}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                {...register('description')}
              />
            </div>

            <div className={DIALOG_FOOTER}>
              <button
                type="button"
                className={btn('ghost')}
                onClick={onClose}
                disabled={loading}
              >
                ยกเลิก
              </button>
              <button type="submit" className={btn('primary')} disabled={loading}>
                {loading && <AppIcons.loading spin />}
                {isEdit ? 'บันทึก' : 'เพิ่มแบรนด์'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
