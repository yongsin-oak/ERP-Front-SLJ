import { useState, useCallback, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import { Text } from '../Typography';
import { Button } from '../Button';
import { AppIcons } from '../../icons';
import { cn } from '@/lib/utils';

export interface SheetData {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

const PREVIEW_ROWS = 5;
const DEFAULT_WARN_ROWS = 10_000;
/** ตรวจชนิดไฟล์เองด้วย — attribute `accept` กันแค่ file picker ไม่กันลากมาวาง */
const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

function PreviewTable({ headers, rows }: { headers: string[]; rows: Record<string, unknown>[] }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-md border border-border text-xs">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap border-b border-border bg-muted px-2.5 py-1.5 text-left font-semibold text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, PREVIEW_ROWS).map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td
                  key={h}
                  title={String(row[h] ?? '')}
                  className="max-w-45 truncate whitespace-nowrap border-b border-divider px-2.5 py-1.5 text-foreground"
                >
                  {String(row[h] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface DropZoneSheetProps {
  onParsed: (data: SheetData) => void;
  onClear?: () => void;
  warnRows?: number;
  disabled?: boolean;
}

export function DropZoneSheet({
  onParsed,
  onClear,
  warnRows = DEFAULT_WARN_ROWS,
  disabled = false,
}: DropZoneSheetProps) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          throw new Error(`รองรับเฉพาะไฟล์ ${ACCEPTED_EXTENSIONS.join(', ')}`);
        }
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });

        if (json.length === 0) throw new Error('ไฟล์ไม่มีข้อมูล กรุณาตรวจสอบไฟล์');

        const data: SheetData = {
          fileName: file.name,
          headers: Object.keys(json[0]),
          rows: json,
          totalRows: json.length,
        };
        setSheet(data);
        onParsed(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'ไม่สามารถอ่านไฟล์ได้');
      } finally {
        setLoading(false);
      }
    },
    [onParsed],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) parseFile(file);
    },
    [disabled, parseFile],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) parseFile(file);
      e.target.value = '';
    },
    [parseFile],
  );

  const handleClear = useCallback(() => {
    setSheet(null);
    setError(null);
    onClear?.();
  }, [onClear]);

  if (sheet) {
    return (
      <div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppIcons.excel className="size-5.5 text-success-text" />
              <div>
                <Text size="sm" strong>
                  {sheet.fileName}
                </Text>
                <br />
                <Text size="xs" type="secondary">
                  {sheet.totalRows.toLocaleString()} แถว · {sheet.headers.length} คอลัมน์
                </Text>
              </div>
            </div>
            <Button variant="ghost" size="small" icon={<AppIcons.close />} onClick={handleClear}>
              เปลี่ยนไฟล์
            </Button>
          </div>

          {sheet.totalRows > warnRows && (
            <div className="mt-2 flex items-center gap-1 text-warning-text">
              <AppIcons.warning className="size-4" />
              <Text size="xs" type="warning">
                มีข้อมูลมากกว่า {warnRows.toLocaleString()} แถว การนำเข้าอาจใช้เวลานาน
              </Text>
            </div>
          )}
        </div>

        <Text size="xs" type="secondary" className="my-2 block">
          ตัวอย่าง {Math.min(PREVIEW_ROWS, sheet.totalRows)} แถวแรก
        </Text>
        <PreviewTable headers={sheet.headers} rows={sheet.rows} />
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setActive(true);
        }}
        onDragLeave={() => setActive(false)}
        className={cn(
          'rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          active
            ? 'border-primary bg-primary-subtle'
            : 'border-border bg-muted hover:border-primary hover:bg-primary-subtle',
          disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-2">
          <AppIcons.inbox className={cn('size-10', loading ? 'text-primary' : 'text-foreground-subtle')} />
          <div>
            <Text size="sm" strong className={cn(loading ? 'text-primary' : 'text-foreground')}>
              {loading ? 'กำลังอ่านไฟล์…' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก'}
            </Text>
            <br />
            <Text size="xs" type="secondary">
              รองรับ .xlsx, .xls, .csv
            </Text>
          </div>
        </div>
      </div>

      {error && (
        <Text size="xs" type="danger" className="mt-2 block">
          {error}
        </Text>
      )}
    </div>
  );
}
