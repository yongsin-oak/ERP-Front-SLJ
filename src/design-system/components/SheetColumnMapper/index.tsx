import { useState } from 'react';
import styled from '@emotion/styled';
import { Flex } from 'antd';
import { Select } from '../Select';
import { colors, spacing, radius } from '../../tokens';
import { Text } from '../Typography';
import type { SheetData } from '../DropZoneSheet';
import { AppIcons } from '../../icons';

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Auto-match ─────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase().replace(/[\s_\-\.\/\\]/g, '');
}

function autoMatch(col: string, fields: DbFieldDef[]): string | null {
  const n = norm(col);
  return (
    fields.find(f => norm(f.key) === n || norm(f.label) === n)?.key ??
    fields.find(f => n.includes(norm(f.key)) || norm(f.key).includes(n))?.key ??
    null
  );
}

export function buildDefaultMappings(sheetData: SheetData, dbFields: DbFieldDef[]): ColumnMapping[] {
  return sheetData.headers.map(col => ({ sheetColumn: col, dbField: autoMatch(col, dbFields) }));
}

// ── Styled components ─────────────────────────────────────────────────────────

const Wrapper = styled.div`
  border: 1px solid ${colors.border.default};
  border-radius: ${radius.lg};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 28px 1fr;
  gap: ${spacing[3]};
  padding: ${spacing[2]} ${spacing[4]};
  background: ${colors.bg.layout};
  border-bottom: 1px solid ${colors.border.default};
`;

const MapRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 28px 1fr;
  align-items: center;
  gap: ${spacing[3]};
  padding: ${spacing[2]} ${spacing[4]};
  border-bottom: 1px solid ${colors.border.subtle};

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: ${colors.bg.layout};
  }
`;

const ColChip = styled.div`
  min-width: 0;
`;

const SampleText = styled.div`
  font-size: 11px;
  color: ${colors.text.tertiary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
`;

const Footer = styled(Flex)`
  padding: ${spacing[3]} ${spacing[4]};
  background: ${colors.bg.layout};
  border-top: 1px solid ${colors.border.default};
`;

// ── Component ─────────────────────────────────────────────────────────────────
//
// Pass `key={sheetData.fileName}` from the parent to reset mappings when a new
// file is uploaded. The component auto-matches on mount using name similarity.

export function SheetColumnMapper({ sheetData, dbFields, onChange }: SheetColumnMapperProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(() => {
    const initial = buildDefaultMappings(sheetData, dbFields);
    onChange?.(initial);
    return initial;
  });

  const sampleByCol: Record<string, string> = {};
  sheetData.headers.forEach(h => {
    const vals = sheetData.rows.slice(0, 3).map(r => String(r[h] ?? '')).filter(Boolean);
    sampleByCol[h] = vals.join(', ') || '—';
  });

  const mappedDbFields = new Set(mappings.map(m => m.dbField).filter(Boolean) as string[]);
  const missingRequired = dbFields.filter(f => f.required && !mappedDbFields.has(f.key));
  const mappedCount = mappings.filter(m => m.dbField).length;

  const selectOptions = [
    { value: '', label: '— ไม่จับคู่ —' },
    ...dbFields.map(f => ({
      value: f.key,
      label: f.required ? `${f.label} *` : f.label,
    })),
  ];

  function updateMapping(index: number, dbField: string | null) {
    const next = mappings.map((m, i) => (i === index ? { ...m, dbField } : m));
    setMappings(next);
    onChange?.(next);
  }

  return (
    <Wrapper>
      <TableHeader>
        <Text size="xs" strong style={{ color: colors.text.secondary }}>คอลัมน์ในไฟล์ / ตัวอย่าง</Text>
        <div />
        <Text size="xs" strong style={{ color: colors.text.secondary }}>DB Field</Text>
      </TableHeader>

      {sheetData.headers.map((col, i) => {
        const mapping = mappings[i];
        const isMapped = Boolean(mapping?.dbField);

        return (
          <MapRow key={col}>
            <ColChip>
              <Text size="sm" strong style={{ color: colors.text.primary, display: 'block' }}>
                {col}
              </Text>
              <SampleText title={sampleByCol[col]}>{sampleByCol[col]}</SampleText>
            </ColChip>

            <AppIcons.arrowRight
              style={{
                fontSize: 13,
                color: isMapped ? colors.brand.primary : colors.text.disabled,
              }}
            />

            <Select
              size="small"
              value={mapping?.dbField ?? ''}
              options={selectOptions}
              onChange={v => updateMapping(i, (v as string) || null)}
              style={{ width: '100%' }}
            />
          </MapRow>
        );
      })}

      <Footer align="center" justify="space-between" gap={spacing[4]}>
        <Flex align="center" gap={spacing[1]}>
          <AppIcons.success style={{ color: colors.semantic.successText, fontSize: 13 }} />
          <Text size="xs" style={{ color: colors.semantic.successText }}>
            จับคู่แล้ว {mappedCount}/{sheetData.headers.length} คอลัมน์
          </Text>
        </Flex>

        {missingRequired.length > 0 && (
          <Flex align="center" gap={spacing[1]}>
            <AppIcons.alert style={{ color: colors.semantic.errorText, fontSize: 13 }} />
            <Text size="xs" style={{ color: colors.semantic.errorText }}>
              ต้องกำหนด: {missingRequired.map(f => f.label).join(', ')}
            </Text>
          </Flex>
        )}
      </Footer>
    </Wrapper>
  );
}
