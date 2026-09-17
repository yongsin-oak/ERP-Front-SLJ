import { useEffect, useRef } from 'react';
import { Dialog, Popover } from 'radix-ui';
import { Controller, useForm } from 'react-hook-form';
import { AppIcons } from '@/lib/icons';
import { useCombobox } from '@/lib/useCombobox';
import { cn } from '@/lib/utils';
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
  INPUT_SM,
  LABEL,
  POPOVER_CONTENT,
  SELECT_ITEM,
  SELECT_TRIGGER,
  TEXTAREA,
} from '@/lib/styles';
import type { Category, CreateCategoryDto } from '../types';

interface Props {
  open: boolean;
  category?: Category | null;
  /** สำหรับ dropdown เลือก parent — ตัด self + descendants ออกใน caller */
  parentOptions: { label: string; value: string }[];
  onClose: () => void;
  onSubmit: (values: CreateCategoryDto) => Promise<void>;
  loading?: boolean;
}

const EMPTY = { name: '', description: '', parentId: undefined } as unknown as CreateCategoryDto;

/**
 * ช่องเลือกหมวดหมู่หลัก — Radix Select พิมพ์ค้นไม่ได้ จึงประกอบจาก Popover + input เอง
 * รายการหมวดหมู่ของร้านยาวถึงหลักร้อย ถ้าเลื่อนหาอย่างเดียวจะหาไม่เจอ
 */
function ParentSelect({
  value,
  onChange,
  options,
  id,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { label: string; value: string }[];
  id?: string;
}) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const combo = useCombobox({ listRef, options, value, onChange });
  const showClear = value != null && value !== '';

  return (
    <div className="relative inline-flex w-full">
      <Popover.Root open={combo.open} onOpenChange={combo.setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            id={id}
            className={cn(SELECT_TRIGGER, showClear && 'pr-14')}
          >
            <span className={cn('truncate', !combo.selected && 'text-foreground-muted')}>
              {combo.selected?.label ?? 'ไม่มี (เป็นหมวดหมู่ระดับบนสุด)'}
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
                placeholder="ค้นหาหมวดหมู่..."
                aria-label="ค้นหาหมวดหมู่หลัก"
                className={INPUT_SM}
              />
            </div>
            <div ref={listRef} role="listbox" className="max-h-60 overflow-y-auto p-1">
              {combo.filtered.length === 0 ?
                <div className="px-2 py-6 text-center text-sm text-foreground-muted">
                  ไม่พบหมวดหมู่
                </div>
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

      {showClear && (
        <button
          type="button"
          aria-label="ล้างหมวดหมู่หลัก"
          onClick={() => combo.clear()}
          className="absolute top-1/2 right-8 -translate-y-1/2 rounded-sm p-0.5 text-foreground-muted transition-colors hover:text-foreground"
        >
          <AppIcons.close className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function CategoryFormModal({
  open,
  category,
  parentOptions,
  onClose,
  onSubmit,
  loading,
}: Props) {
  const isEdit = !!category;
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryDto>({ defaultValues: EMPTY });

  // เติมค่าเดิมทุกครั้งที่เปิด — ดูเหตุผลใน BrandFormModal
  useEffect(() => {
    if (!open) return;
    reset(
      category ?
        {
          name: category.name,
          description: category.description ?? '',
          parentId: category.parentId ?? undefined,
        }
      : EMPTY,
    );
  }, [open, category, reset]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content className={DIALOG_CONTENT} aria-describedby={undefined}>
          <Dialog.Title className={DIALOG_TITLE}>
            {isEdit ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
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
              onSubmit({
                ...values,
                parentId: values.parentId || undefined,
                description: values.description || undefined,
              }),
            )}
          >
            <div className={FIELD_ROW}>
              <label htmlFor="category-name" className={LABEL}>
                ชื่อหมวดหมู่
              </label>
              <input
                id="category-name"
                className={INPUT}
                placeholder="ชื่อหมวดหมู่"
                aria-invalid={!!errors.name}
                {...register('name', { required: 'กรุณากรอกชื่อ' })}
              />
              {errors.name && <span className={FIELD_ERROR}>{errors.name.message}</span>}
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="category-parent" className={LABEL}>
                หมวดหมู่หลัก (ถ้ามี)
              </label>
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <ParentSelect
                    id="category-parent"
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    options={parentOptions}
                  />
                )}
              />
            </div>

            <div className={FIELD_ROW}>
              <label htmlFor="category-description" className={LABEL}>
                รายละเอียด
              </label>
              <textarea
                id="category-description"
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
                {isEdit ? 'บันทึก' : 'เพิ่มหมวดหมู่'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
