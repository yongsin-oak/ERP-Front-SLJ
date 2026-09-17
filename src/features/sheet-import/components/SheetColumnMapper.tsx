import { useState } from 'react';
import { Select } from 'radix-ui';
import { AppIcons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { SELECT_CONTENT, SELECT_ITEM, SELECT_TRIGGER, SELECT_VIEWPORT } from '@/lib/styles';
import type { ColumnMapping, DbFieldDef, SheetData } from '../types';

/** ค่าที่หมายถึง "ไม่จับคู่" — Radix Select ห้าม value เป็นสตริงว่าง จึงต้องมี sentinel */
const NO_MAPPING = '__none__';

export interface SheetColumnMapperProps {
  sheetData: SheetData;
  dbFields: DbFieldDef[];
  /** ยิงทุกครั้งที่การจับคู่เปลี่ยน — และยิงหนึ่งครั้งตอน mount ด้วยผลการจับคู่อัตโนมัติ */
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
    const vals = sheetData.rows
      .slice(0, 3)
      .map((r) => String(r[h] ?? ''))
      .filter(Boolean);
    sampleByCol[h] = vals.join(', ') || '—';
  });

  const mappedDbFields = new Set(mappings.map((m) => m.dbField).filter(Boolean) as string[]);
  const missingRequired = dbFields.filter((f) => f.required && !mappedDbFields.has(f.key));
  const mappedCount = mappings.filter((m) => m.dbField).length;

  function updateMapping(index: number, dbField: string | null) {
    const next = mappings.map((m, i) => (i === index ? { ...m, dbField } : m));
    setMappings(next);
    onChange?.(next);
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className={cn(GRID, 'border-b border-border bg-surface-100 px-4 py-2')}>
        <span className="text-xs font-medium text-foreground-lighter">คอลัมน์ในไฟล์ / ตัวอย่าง</span>
        <div />
        <span className="text-xs font-medium text-foreground-lighter">DB Field</span>
      </div>

      {sheetData.headers.map((col, i) => {
        const mapping = mappings[i];
        const isMapped = Boolean(mapping?.dbField);
        const selectId = `sheet-map-${i}`;

        return (
          <div
            key={col}
            className={cn(
              GRID,
              'items-center border-b border-border-muted px-4 py-2 last-of-type:border-b-0 hover:bg-surface-100',
            )}
          >
            <div className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{col}</span>
              <div
                className="mt-px truncate text-[11px] text-foreground-muted"
                title={sampleByCol[col]}
              >
                {sampleByCol[col]}
              </div>
            </div>

            <AppIcons.arrowRight
              className={cn('size-3.5', isMapped ? 'text-primary' : 'text-disabled')}
            />

            <Select.Root
              value={mapping?.dbField ?? NO_MAPPING}
              onValueChange={(v) => updateMapping(i, v === NO_MAPPING ? null : v)}
            >
              <Select.Trigger
                id={selectId}
                aria-label={`จับคู่คอลัมน์ ${col}`}
                className={cn(SELECT_TRIGGER, 'h-7.5')}
              >
                <Select.Value />
                <Select.Icon>
                  <AppIcons.chevronDown />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content position="popper" sideOffset={4} className={SELECT_CONTENT}>
                  <Select.Viewport className={SELECT_VIEWPORT}>
                    <Select.Item value={NO_MAPPING} className={SELECT_ITEM}>
                      <Select.ItemText>— ไม่จับคู่ —</Select.ItemText>
                    </Select.Item>
                    {dbFields.map((f) => (
                      <Select.Item key={f.key} value={f.key} className={SELECT_ITEM}>
                        <Select.ItemText>{f.required ? `${f.label} *` : f.label}</Select.ItemText>
                        <Select.ItemIndicator className="absolute right-2 text-primary">
                          <AppIcons.check />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-surface-100 px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-success-text">
          <AppIcons.success className="size-3.5" />
          จับคู่แล้ว {mappedCount}/{sheetData.headers.length} คอลัมน์
        </div>

        {missingRequired.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <AppIcons.alert className="size-3.5" />
            ต้องกำหนด: {missingRequired.map((f) => f.label).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
