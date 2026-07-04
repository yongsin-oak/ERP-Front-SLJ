import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../Button';
import { cn } from '@/lib/utils';

export interface ModalButtonProps {
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export interface ModalProps {
  open?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode | null;
  width?: number | string;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  confirmLoading?: boolean;
  okButtonProps?: ModalButtonProps;
  cancelButtonProps?: ModalButtonProps;
  centered?: boolean;
  maskClosable?: boolean;
  closable?: boolean;
  /** antd compat — Radix unmounts content on close, so these are no-ops */
  destroyOnHidden?: boolean;
  destroyOnClose?: boolean;
  className?: string;
  styles?: {
    body?: React.CSSProperties;
    header?: React.CSSProperties;
    footer?: React.CSSProperties;
  };
  children?: React.ReactNode;
}

export function Modal({
  open,
  onCancel,
  onOk,
  title,
  footer,
  width = 560,
  okText = 'ตกลง',
  cancelText = 'ยกเลิก',
  confirmLoading,
  okButtonProps,
  cancelButtonProps,
  centered,
  maskClosable,
  closable,
  className,
  styles,
  children,
}: ModalProps) {
  const defaultFooter = (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={cancelButtonProps?.disabled || confirmLoading}>
        {cancelText}
      </Button>
      <Button
        variant={okButtonProps?.danger ? 'danger' : 'primary'}
        onClick={onOk}
        loading={confirmLoading || okButtonProps?.loading}
        disabled={okButtonProps?.disabled}
      >
        {okText}
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onCancel?.();
      }}
    >
      <DialogContent
        showClose={closable !== false}
        onInteractOutside={(e) => {
          if (maskClosable === false) e.preventDefault();
        }}
        className={cn(
          'max-h-[calc(100vh-3rem)] max-w-[calc(100vw-2rem)] gap-0 p-0',
          !centered && 'top-[7vh] translate-y-0',
          className,
        )}
        style={{ width }}
      >
        <DialogHeader className="border-b border-divider px-6 py-4" style={styles?.header}>
          {title != null ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            <DialogTitle className="sr-only">ไดอะล็อก</DialogTitle>
          )}
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5" style={styles?.body}>
          {children}
        </div>

        {footer !== null && (
          <div
            className="flex items-center justify-end gap-2 border-t border-divider px-6 py-4"
            style={styles?.footer}
          >
            {footer === undefined ? defaultFooter : footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
