import * as React from 'react';
import type { ReactNode } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '../Button';
import { AppIcons } from '../../icons';

export interface DeleteConfirmButtonProps {
  onConfirm: () => void;
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

  const trigger = children ?? (
    <Button variant="danger-ghost" size={size} icon={<AppIcons.delete />} loading={loading} disabled={disabled} />
  );

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <span className="inline-flex">{trigger}</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="flex gap-2">
          <IconAlertTriangle className="size-5 shrink-0 text-warning" />
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">{title}</div>
            {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="small" onClick={() => setOpen(false)} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant="danger"
            size="small"
            loading={loading}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            {okText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
