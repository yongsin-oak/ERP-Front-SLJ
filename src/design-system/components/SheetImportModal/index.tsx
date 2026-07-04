import * as React from 'react';
import { useState } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { Alert } from '../Alert';
import { Text } from '../Typography';
import { DropZoneSheet } from '../DropZoneSheet';
import { SheetColumnMapper, buildDefaultMappings } from '../SheetColumnMapper';
import { SheetTable } from '../SheetTable';
import type { SheetData } from '../DropZoneSheet';
import type { DbFieldDef, ColumnMapping } from '../SheetColumnMapper';
import { cn } from '@/lib/utils';

export type { DbFieldDef, ColumnMapping };

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

function Steps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-xs font-medium',
                i <= current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className={cn('text-sm', i === current ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && <div className="h-px flex-1 bg-divider" />}
        </React.Fragment>
      ))}
    </div>
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
    setStep(2);
  }

  async function handleImport() {
    if (!review) return;
    const { internalRows, errors } = review;
    const valid = internalRows.filter((_, i) => !errors[i]);
    try {
      await onImport(valid.map(transformRow));
      handleClose();
    } catch {
      // error displayed by mutation's onError handler
    }
  }

  const errorCount = review ? Object.keys(review.errors).length : 0;
  const validCount = review ? review.internalRows.length - errorCount : 0;

  return (
    <Modal open={open} onCancel={handleClose} title={title} footer={null} width={step === 2 ? 900 : 640}>
      <div className="mb-6">
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
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={reset}>เริ่มใหม่</Button>
            <Button variant="primary" onClick={buildReview}>
              ถัดไป — ตรวจสอบ
            </Button>
          </div>
        </>
      )}

      {step === 2 && review && (
        <>
          {errorCount > 0 && (
            <Alert
              type="warning"
              showIcon
              message={`พบ ${errorCount} แถวที่มีข้อผิดพลาด — แถวเหล่านั้นจะถูกข้ามไป`}
              className="mb-3"
            />
          )}
          <SheetTable data={review.displayData} errors={review.errors} />
          <div className="mt-4 flex items-center justify-between">
            <Text type="secondary">
              {validCount} แถวพร้อมนำเข้า
              {errorCount > 0 && ` · ${errorCount} แถวมีข้อผิดพลาด (ข้าม)`}
            </Text>
            <div className="flex gap-2">
              <Button onClick={() => setStep(1)}>ย้อนกลับ</Button>
              <Button variant="primary" loading={loading} disabled={validCount === 0} onClick={handleImport}>
                นำเข้า {validCount} รายการ
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
