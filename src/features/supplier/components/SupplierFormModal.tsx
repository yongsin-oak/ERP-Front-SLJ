import { useEffect } from 'react';
import { Dialog, Switch } from 'radix-ui';
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
  SWITCH,
  SWITCH_THUMB,
  TEXTAREA,
} from '@/lib/styles';
import type { Supplier, CreateSupplierDto } from '../types';

interface Props {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSubmit: (values: CreateSupplierDto) => Promise<void>;
  loading?: boolean;
}

const EMPTY = {
  name: '',
  contactName: undefined,
  phone: undefined,
  email: undefined,
  address: undefined,
  taxId: undefined,
  isActive: true,
  note: undefined,
} as unknown as CreateSupplierDto;

export function SupplierFormModal({ open, supplier, onClose, onSubmit, loading }: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSupplierDto>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ดูเหตุผลใน BrandFormModal
  useEffect(() => {
    if (!open) return;
    reset(
      supplier ?
        {
          name: supplier.name,
          contactName: supplier.contactName ?? undefined,
          phone: supplier.phone ?? undefined,
          email: supplier.email ?? undefined,
          address: supplier.address ?? undefined,
          taxId: supplier.taxId ?? undefined,
          isActive: supplier.isActive,
          note: supplier.note ?? undefined,
        }
      : EMPTY,
    );
  }, [open, supplier, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={DIALOG_TITLE}>
            {supplier ? 'แก้ไขซัพพลายเออร์' : 'เพิ่มซัพพลายเออร์'}
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
              <label htmlFor="supplier-name" className={LABEL}>
                ชื่อบริษัท / ซัพพลายเออร์
              </label>
              <input
                id="supplier-name"
                className={INPUT}
                placeholder="บริษัท โค้กไทย จำกัด"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'กรุณากรอกชื่อ' })}
              />
              {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={FIELD_ROW}>
                <label htmlFor="supplier-contact" className={LABEL}>
                  ชื่อผู้ติดต่อ
                </label>
                <input
                  id="supplier-contact"
                  className={INPUT}
                  placeholder="คุณสมศักดิ์"
                  {...register('contactName')}
                />
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="supplier-phone" className={LABEL}>
                  เบอร์โทรศัพท์
                </label>
                <input
                  id="supplier-phone"
                  className={INPUT}
                  placeholder="02-111-1111"
                  {...register('phone')}
                />
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="supplier-email" className={LABEL}>
                  อีเมล
                </label>
                <input
                  id="supplier-email"
                  type="email"
                  className={INPUT}
                  placeholder="order@company.co.th"
                  {...register('email')}
                />
              </div>

              <div className={FIELD_ROW}>
                <label htmlFor="supplier-taxid" className={LABEL}>
                  เลขประจำตัวผู้เสียภาษี
                </label>
                <input
                  id="supplier-taxid"
                  className={INPUT}
                  placeholder="0105537000001"
                  maxLength={13}
                  {...register('taxId')}
                />
              </div>
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="supplier-address" className={LABEL}>
                ที่อยู่
              </label>
              <textarea
                id="supplier-address"
                rows={2}
                className={TEXTAREA}
                placeholder="ที่อยู่"
                {...register('address')}
              />
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="supplier-note" className={LABEL}>
                หมายเหตุ
              </label>
              <textarea id="supplier-note" rows={2} className={TEXTAREA} {...register('note')} />
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
                      {field.value ? 'ใช้งาน' : 'ปิดใช้งาน'}
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
                {supplier ? 'บันทึก' : 'เพิ่ม'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
