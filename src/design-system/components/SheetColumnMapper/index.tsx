import { useState } from 'react';
import { Select } from '../Select';
import { Text } from '../Typography';
import type { SheetData } from '../DropZoneSheet';
import { AppIcons } from '../../icons';
import { cn } from '@/lib/utils';

export interface DbFieldDef {
  key: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean';
}

export interface ColumnMapping {
  sheetColumn: string;
  dbField: string | null;
}

export interface SheetColumnMapperProps {
  sheetData: SheetData;
  dbFields: DbFieldDef[];
  /** onChange fires on every mapping change — also fires once on mount with auto-matched state */
  onChange?: (mappings: ColumnMapping[]) => void;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s_\-./\\]/g, '');
}

function autoMatch(col: string, fields: DbFieldDef[]): string | null {
  const n = norm(col);
  return (
    fields.find((f) => norm(f.key) === n || norm(f.label) === n)?.key ??
    fields.find((f) => n.includes(norm(f.key)) || norm(f.key).includes(n))?.key ??
    null
  );
}

export function buildDefaultMappings(sheetData: SheetData, dbFields: DbFieldDef[]): ColumnMapping[] {
  return sheetData.headers.map((col) => ({ sheetColumn: col, dbField: autoMatch(col, dbFields) }));
}

const GRID = 'grid grid-cols-[1fr_28px_1fr] gap-3';

export function SheetColumnMapper({ sheetData, dbFields, onChange }: SheetColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(() => {
    const initial = buildDefaultMappings(sheetData, dbFields);
    onChange?.(initial);
    return initial;
  });

  const sampleByCol: Record<string, string> = {};
  sheetData.headers.forEach((h) => {
    const vals = sheetData.rows.slice(0, 3).map((r) => String(r[h] ?? '')).filter(Boolean);
    sampleByCol[h] = vals.join(', ') || '—';
  });

  const mappedDbFields = new Set(mappings.map((m) => m.dbField).filter(Boolean) as string[]);
  const missingRequired = dbFields.filter((f) => f.required && !mappedDbFields.has(f.key));
  const mappedCount = mappings.filter((m) => m.dbField).length;

  const selectOptions = [
    { value: '', label: '— ไม่จับคู่ —' },
    ...dbFields.map((f) => ({ value: f.key, label: f.required ? `${f.label} *` : f.label })),
  ];

  function updateMapping(index: number, dbField: string | null) {
    const next = mappings.map((m, i) => (i === index ? { ...m, dbField } : m));
    setMappings(next);
    onChange?.(next);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className={cn(GRID, 'border-b border-border bg-muted px-4 py-2')}>
        <Text size="xs" strong type="secondary">
          คอลัมน์ในไฟล์ / ตัวอย่าง
        </Text>
        <div />
        <Text size="xs" strong type="secondary">
          DB Field
        </Text>
      </div>

      {sheetData.headers.map((col, i) => {
        const mapping = mappings[i];
        const isMapped = Boolean(mapping?.dbField);

        return (
          <div
            key={col}
            className={cn(GRID, 'items-center border-b border-divider px-4 py-2 last-of-type:border-b-0 hover:bg-muted')}
          >
            <div className="min-w-0">
              <Text size="sm" strong className="block text-foreground">
                {col}
              </Text>
              <div className="mt-px truncate text-[11px] text-foreground-subtle" title={sampleByCol[col]}>
                {sampleByCol[col]}
              </div>
            </div>

            <AppIcons.arrowRight
              className={cn('size-3.5', isMapped ? 'text-primary' : 'text-disabled')}
            />

            <Select
              size="small"
              value={mapping?.dbField ?? ''}
              options={selectOptions}
              onChange={(v) => updateMapping(i, (v as string) || null)}
              style={{ width: '100%' }}
            />
          </div>
        );
      })}

      <div className="flex items-center justify-between gap-4 border-t border-border bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          <AppIcons.success className="size-3.5 text-success-text" />
          <Text size="xs" type="success">
            จับคู่แล้ว {mappedCount}/{sheetData.headers.length} คอลัมน์
          </Text>
        </div>

        {missingRequired.length > 0 && (
          <div className="flex items-center gap-1">
            <AppIcons.alert className="size-3.5 text-error-text" />
            <Text size="xs" type="danger">
              ต้องกำหนด: {missingRequired.map((f) => f.label).join(', ')}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
