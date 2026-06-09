import { useState } from 'react';
import { Steps, Alert, Typography, Flex } from 'antd';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { DropZoneSheet } from '../DropZoneSheet';
import { SheetColumnMapper, buildDefaultMappings } from '../SheetColumnMapper';
import { SheetTable } from '../SheetTable';
import type { SheetData } from '../DropZoneSheet';
import type { DbFieldDef, ColumnMapping } from '../SheetColumnMapper';

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

const STEP_ITEMS = [
  { title: 'อัพโหลด' },
  { title: 'จับคู่คอลัมน์' },
  { title: 'ตรวจสอบ' },
];

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
        if (m.dbField) {
          mapped[m.dbField] = row[m.sheetColumn];
        }
      }
      return mapped;
    });

    const errors: Record<number, string[]> = {};
    internalRows.forEach((row, i) => {
      const errs = validateRow(row);
      if (errs.length) errors[i] = errs;
    });

    const mappedFields = dbFields.filter((f) =>
      mappings.some((m) => m.dbField === f.key),
    );
    const displayHeaders = mappedFields.map((f) => f.label);
    const displayRows = internalRows.map((row) => {
      const dr: Record<string, unknown> = {};
      for (const f of mappedFields) {
        dr[f.label] = row[f.key];
      }
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
    <Modal
      open={open}
      onCancel={handleClose}
      title={title}
      footer={null}
      width={step === 2 ? 900 : 640}
    >
      <div style={{ marginBottom: 24 }}>
        <Steps current={step} size="small" items={STEP_ITEMS} />
      </div>

      {step === 0 && (
        <DropZoneSheet onParsed={handleParsed} onClear={reset} />
      )}

      {step === 1 && sheetData && (
        <>
          <SheetColumnMapper
            key={sheetData.fileName}
            sheetData={sheetData}
            dbFields={dbFields}
            onChange={setMappings}
          />
          <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
            <Button onClick={reset}>เริ่มใหม่</Button>
            <Button variant="primary" onClick={buildReview}>
              ถัดไป — ตรวจสอบ
            </Button>
          </Flex>
        </>
      )}

      {step === 2 && review && (
        <>
          {errorCount > 0 && (
            <Alert
              type="warning"
              showIcon
              message={`พบ ${errorCount} แถวที่มีข้อผิดพลาด — แถวเหล่านั้นจะถูกข้ามไป`}
              style={{ marginBottom: 12 }}
            />
          )}
          <SheetTable data={review.displayData} errors={review.errors} />
          <Flex justify="space-between" align="center" style={{ marginTop: 16 }}>
            <Typography.Text type="secondary">
              {validCount} แถวพร้อมนำเข้า
              {errorCount > 0 && ` · ${errorCount} แถวมีข้อผิดพลาด (ข้าม)`}
            </Typography.Text>
            <Flex gap={8}>
              <Button onClick={() => setStep(1)}>ย้อนกลับ</Button>
              <Button
                variant="primary"
                loading={loading}
                disabled={validCount === 0}
                onClick={handleImport}
              >
                นำเข้า {validCount} รายการ
              </Button>
            </Flex>
          </Flex>
        </>
      )}
    </Modal>
  );
}
