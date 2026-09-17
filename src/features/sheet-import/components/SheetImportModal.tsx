import { Fragment, useState } from 'react';
import { Dialog } from 'radix-ui';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import {
  alertBox,
  btn,
  DIALOG_CLOSE_X,
  DIALOG_CONTENT_LG,
  DIALOG_CONTENT_XL,
  DIALOG_OVERLAY,
  DIALOG_TITLE,
  TEXT,
} from '@/lib/styles';
import { DropZoneSheet } from './DropZoneSheet';
import { SheetColumnMapper, buildDefaultMappings } from './SheetColumnMapper';
import { SheetTable } from './SheetTable';
import type { ColumnMapping, DbFieldDef, SheetData } from '../types';

export interface SheetImportModalProps<T> {
  open: boolean;
  onClose: () => void;
  title: string;
  dbFields: DbFieldDef[];
  validateRow: (mapped: Record<string, unknown>) => string[];
  transformRow: (mapped: Record<string, unknown>) => T;
  onImport: (rows: T[]) => Promise<void>;
  loading?: boolean;
}

interface ReviewState {
  displayData: SheetData;
  internalRows: Record<string, unknown>[];
  errors: Record<number, string[]>;
}

const STEP_LABELS = ['อัพโหลด', 'จับคู่คอลัมน์', 'ตรวจสอบ'];
const REVIEW_STEP = 2;

function Steps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => (
        <Fragment key={label}>
          <li className="flex items-center gap-2" aria-current={i === current ? 'step' : undefined}>
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                i <= current ?
                  'bg-primary text-primary-foreground'
                : 'bg-surface-200 text-foreground-lighter',
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                'text-sm',
                i === current ? 'font-medium text-foreground' : 'text-foreground-lighter',
              )}
            >
              {label}
            </span>
          </li>
          {i < STEP_LABELS.length - 1 && <li aria-hidden className="h-px flex-1 bg-border-muted" />}
        </Fragment>
      ))}
    </ol>
  );
}

export function SheetImportModal<T extends object>({
  open,
  onClose,
  title,
  dbFields,
  validateRow,
  transformRow,
  onImport,
  loading = false,
}: SheetImportModalProps<T>) {
  const [step, setStep] = useState(0);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [review, setReview] = useState<ReviewState | null>(null);

  function reset() {
    setStep(0);
    setSheetData(null);
    setMappings([]);
    setReview(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleParsed(data: SheetData) {
    setSheetData(data);
    setMappings(buildDefaultMappings(data, dbFields));
    setStep(1);
  }

  function buildReview() {
    if (!sheetData) return;

    const internalRows: Record<string, unknown>[] = sheetData.rows.map((row) => {
      const mapped: Record<string, unknown> = {};
      for (const m of mappings) {
        if (m.dbField) mapped[m.dbField] = row[m.sheetColumn];
      }
      return mapped;
    });

    const errors: Record<number, string[]> = {};
    internalRows.forEach((row, i) => {
      const errs = validateRow(row);
      if (errs.length) errors[i] = errs;
    });

    const mappedFields = dbFields.filter((f) => mappings.some((m) => m.dbField === f.key));
    const displayHeaders = mappedFields.map((f) => f.label);
    const displayRows = internalRows.map((row) => {
      const dr: Record<string, unknown> = {};
      for (const f of mappedFields) dr[f.label] = row[f.key];
      return dr;
    });

    setReview({
      displayData: {
        fileName: sheetData.fileName,
        headers: displayHeaders,
        rows: displayRows,
        totalRows: sheetData.totalRows,
      },
      internalRows,
      errors,
    });
    setStep(REVIEW_STEP);
  }

  async function handleImport() {
    if (!review) return;
    const { internalRows, errors } = review;
    const valid = internalRows.filter((_, i) => !errors[i]);
    try {
      await onImport(valid.map(transformRow));
      handleClose();
    } catch {
      // error แสดงผ่าน onError ของ mutation แล้ว
    }
  }

  const errorCount = review ? Object.keys(review.errors).length : 0;
  const validCount = review ? review.internalRows.length - errorCount : 0;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={DIALOG_OVERLAY} />
        <Dialog.Content
          className={cn(
            step === REVIEW_STEP ? DIALOG_CONTENT_XL : DIALOG_CONTENT_LG,
            'max-h-[90vh] overflow-y-auto',
          )}
          aria-describedby={undefined}
        >
          <Dialog.Title className={DIALOG_TITLE}>{title}</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" aria-label="ปิด" className={DIALOG_CLOSE_X}>
              <AppIcons.close />
            </button>
          </Dialog.Close>

          <div className="mb-2">
            <Steps current={step} />
          </div>

          {step === 0 && <DropZoneSheet onParsed={handleParsed} onClear={reset} />}

          {step === 1 && sheetData && (
            <>
              <SheetColumnMapper
                key={sheetData.fileName}
                sheetData={sheetData}
                dbFields={dbFields}
                onChange={setMappings}
              />
              <div className="flex justify-end gap-2">
                <button type="button" className={btn()} onClick={reset}>
                  เริ่มใหม่
                </button>
                <button type="button" className={btn('primary')} onClick={buildReview}>
                  ถัดไป — ตรวจสอบ
                </button>
              </div>
            </>
          )}

          {step === REVIEW_STEP && review && (
            <>
              {errorCount > 0 && (
                <div className={alertBox('warning')}>
                  <AppIcons.warning />
                  <span>พบ {errorCount} แถวที่มีข้อผิดพลาด — แถวเหล่านั้นจะถูกข้ามไป</span>
                </div>
              )}
              <SheetTable data={review.displayData} errors={review.errors} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={TEXT.muted}>
                  {validCount} แถวพร้อมนำเข้า
                  {errorCount > 0 && ` · ${errorCount} แถวมีข้อผิดพลาด (ข้าม)`}
                </span>
                <div className="flex gap-2">
                  <button type="button" className={btn()} onClick={() => setStep(1)}>
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    className={btn('primary')}
                    disabled={loading || validCount === 0}
                    onClick={() => void handleImport()}
                  >
                    {loading && <AppIcons.loading spin />}
                    นำเข้า {validCount} รายการ
                  </button>
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
