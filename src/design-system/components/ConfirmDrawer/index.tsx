import { useState } from 'react';
import * as React from 'react';
import type { ReactNode } from 'react';
import { Drawer } from '../Drawer';
import { Button } from '../Button';
import { Text } from '../Typography';
import { cn } from '@/lib/utils';
import { AppIcons } from '../../icons';

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
    try {
      await onConfirm();
      setStep(0);
    } catch {
      // ค้างที่หน้ายืนยันให้กดซ้ำได้ — error ถูก toast โดย handleError ของ mutation แล้ว
    }
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
                  i <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface-200 text-foreground-lighter',
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  'text-sm',
                  i === step ? 'font-medium text-foreground' : 'text-foreground-lighter',
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="h-px flex-1 bg-border-muted" />}
          </React.Fragment>
        ))}
      </div>

      {step === 0 ? (
        formContent
      ) : (
        <div>
          <div className="mb-5 rounded-xl border border-warning-border bg-warning-bg/60 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-warning-text ring-1 ring-warning-border">
                <AppIcons.warning className="size-5" />
              </span>
              <div>
                <Text strong>{confirmTitle ?? 'โปรดตรวจสอบข้อมูลก่อนยืนยัน'}</Text>
                <div className="mt-1 text-sm leading-5 text-foreground-light">เมื่อยืนยันแล้ว ระบบจะดำเนินการตามรายการสรุปด้านล่าง</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface-100 p-4">{summary}</div>
        </div>
      )}
    </Drawer>
  );
}
