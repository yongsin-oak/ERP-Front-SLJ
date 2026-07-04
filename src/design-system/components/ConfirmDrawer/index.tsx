import { useState } from 'react';
import * as React from 'react';
import type { ReactNode } from 'react';
import { Drawer } from '../Drawer';
import { Button } from '../Button';
import { Text } from '../Typography';
import { cn } from '@/lib/utils';

export interface ConfirmDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Step 1: form content */
  formContent: ReactNode;
  /** Step 2: summary to confirm before submitting */
  summary: ReactNode;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  width?: number;
  confirmLabel?: string;
  /** Shown when step is review — e.g. "ยืนยันการลบ 50 รายการ?" */
  confirmTitle?: string;
}

const STEP_LABELS = ['กรอกข้อมูล', 'ยืนยัน'];

export function ConfirmDrawer({
  open,
  onClose,
  title,
  formContent,
  summary,
  onConfirm,
  loading = false,
  width = 520,
  confirmLabel = 'ยืนยัน',
  confirmTitle,
}: ConfirmDrawerProps) {
  const [step, setStep] = useState(0);

  function handleClose() {
    setStep(0);
    onClose();
  }

  async function handleConfirm() {
    await onConfirm();
    setStep(0);
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={title}
      width={width}
      footer={
        <div className="flex items-center justify-between">
          {step === 0 ? (
            <>
              <Button variant="ghost" onClick={handleClose} disabled={loading}>
                ยกเลิก
              </Button>
              <Button variant="primary" onClick={() => setStep(1)}>
                ถัดไป →
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep(0)} disabled={loading}>
                ← ย้อนกลับ
              </Button>
              <Button variant="primary" onClick={handleConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </>
          )}
        </div>
      }
    >
      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-2">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  i === step ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="h-px flex-1 bg-divider" />}
          </React.Fragment>
        ))}
      </div>

      {step === 0 ? (
        formContent
      ) : (
        <div>
          {confirmTitle && (
            <div className="mb-4 rounded-md border border-warning-border bg-warning-bg px-4 py-3">
              <Text size="sm" strong type="warning">
                {confirmTitle}
              </Text>
            </div>
          )}
          {summary}
        </div>
      )}
    </Drawer>
  );
}
