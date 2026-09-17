import * as React from 'react';
import type { ReactNode } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../Button';
import { AppIcons } from '../../icons';

export interface DeleteConfirmButtonProps {
  /** ถ้าคืน Promise ปุ่มลบจะขึ้น loading + ปิด popover เมื่อ settle */
  onConfirm: () => void | Promise<unknown>;
  loading?: boolean;
  title?: string;
  description?: string;
  okText?: string;
  cancelText?: string;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  children?: ReactNode;
}

export function DeleteConfirmButton({
  onConfirm,
  loading = false,
  title = 'ยืนยันการลบ',
  description = 'ไม่สามารถยกเลิกการดำเนินการนี้ได้',
  okText = 'ลบ',
  cancelText = 'ยกเลิก',
  disabled = false,
  size = 'small',
  children,
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const busy = loading || submitting;

  async function handleConfirm() {
    if (busy) return;
    const result = onConfirm();
    if (result instanceof Promise) {
      setSubmitting(true);
      try {
        await result;
      } catch {
        // error ถูก toast โดย handleError ของ mutation แล้ว
      } finally {
        setSubmitting(false);
      }
    }
    setOpen(false);
  }

  const trigger = children ?? (
    <Button
      variant="danger-ghost"
      size={size}
      aria-label={title}
      icon={<AppIcons.delete />}
      loading={loading}
      disabled={disabled}
    />
  );

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <span className="inline-flex">{trigger}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 overflow-hidden rounded-xl border-error-border p-0 shadow-overlay">
        <div className="h-1 bg-error" />
        <div className="flex gap-3 p-4 pb-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-error-bg text-error-text ring-1 ring-error-border">
            <IconAlertTriangle className="size-5" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            {description && <div className="mt-1 text-xs leading-5 text-foreground-light">{description}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-surface-100 px-4 py-3">
          <Button variant="ghost" size="small" onClick={() => setOpen(false)} disabled={busy}>
            {cancelText}
          </Button>
          <Button variant="danger" size="small" loading={busy} onClick={handleConfirm}>
            {okText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
