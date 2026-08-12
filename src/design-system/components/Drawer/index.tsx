import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { IconX } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  open?: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: number | string;
  height?: number | string;
  closable?: boolean;
  footer?: React.ReactNode | null;
  extra?: React.ReactNode;
  maskClosable?: boolean;
  /** @deprecated antd compat — Radix unmount เนื้อหาตอนปิดเสมอ prop นี้ถูกเมิน */
  destroyOnClose?: boolean;
  /** @deprecated antd compat — Radix unmount เนื้อหาตอนปิดเสมอ prop นี้ถูกเมิน */
  destroyOnHidden?: boolean;
  className?: string;
  styles?: {
    body?: React.CSSProperties;
    header?: React.CSSProperties;
    footer?: React.CSSProperties;
  };
  children?: React.ReactNode;
}

const PLACEMENT: Record<NonNullable<DrawerProps['placement']>, string> = {
  right:
    'inset-y-0 right-0 h-full border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
  left:
    'inset-y-0 left-0 h-full border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
  top:
    'inset-x-0 top-0 w-full border-b data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
  bottom:
    'inset-x-0 bottom-0 w-full border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
};

export function Drawer({
  open,
  onClose,
  title,
  placement = 'right',
  width = 480,
  height,
  closable = true,
  footer,
  extra,
  maskClosable,
  className,
  styles,
  children,
}: DrawerProps) {
  const horizontal = placement === 'left' || placement === 'right';

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose?.();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-overlay) bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onInteractOutside={(e) => {
            if (maskClosable === false) e.preventDefault();
          }}
          className={cn(
            'fixed z-(--z-overlay) flex flex-col border-border bg-background shadow-overlay outline-none ease-out',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-200 data-[state=closed]:duration-150',
            PLACEMENT[placement],
            className,
          )}
          style={{ width: horizontal ? width : undefined, height: horizontal ? undefined : height }}
        >
          <div
            className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5"
            style={styles?.header}
          >
            {title != null ? (
              <DialogPrimitive.Title className="text-base font-medium text-foreground">
                {title}
              </DialogPrimitive.Title>
            ) : (
              <DialogPrimitive.Title className="sr-only">แผงด้านข้าง</DialogPrimitive.Title>
            )}
            <div className="flex items-center gap-2">
              {extra}
              {closable && (
                <DialogPrimitive.Close className="flex size-6 items-center justify-center rounded-sm text-foreground-lighter transition-colors duration-(--duration-fast) hover:bg-surface-200 hover:text-foreground">
                  <IconX className="size-3.5" />
                  <span className="sr-only">ปิด</span>
                </DialogPrimitive.Close>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto px-5 py-4" style={styles?.body}>
            {children}
          </div>

          {/* footer ยกพื้นเป็น surface-100 — สองโทนแบบ panel ของ Supabase */}
          {footer != null && (
            <div className="border-t border-border bg-surface-100 px-5 py-3.5" style={styles?.footer}>
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
