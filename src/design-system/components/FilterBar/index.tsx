import { useCallback, useRef } from 'react';
import { Flex } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { Input } from '../Input';
import { Select } from '../Select';
import { DateRangePresets } from '../DateRangePresets';
import { Button } from '../Button';
import { Text } from '../Typography';
import { spacing } from '../../tokens';
import type { DefaultOptionType } from 'antd/es/select';

const DEBOUNCE_MS = 300;

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterItemBase = { key: string; label: string; width?: number };

export type FilterItem =
  | (FilterItemBase & { type: 'search'; placeholder?: string })
  | (FilterItemBase & { type: 'select'; options: DefaultOptionType[]; placeholder?: string; mode?: 'multiple' })
  | (FilterItemBase & { type: 'daterange' });

export type FilterValues = Record<string, unknown>;

export interface FilterBarProps {
  items: FilterItem[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FilterBar({ items, values, onChange, onClear }: FilterBarProps) {
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const set = useCallback(
    (key: string, value: unknown) => onChange({ ...values, [key]: value }),
    [values, onChange],
  );

  const debounceSet = useCallback(
    (key: string, value: unknown) => {
      if (timerRef.current[key]) clearTimeout(timerRef.current[key]);
      timerRef.current[key] = setTimeout(() => set(key, value), DEBOUNCE_MS);
    },
    [set],
  );

  const hasAny = items.some(item => {
    const v = values[item.key];
    return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);
  });

  return (
    <Flex wrap gap={spacing[2]} align="center">
      {items.map(item => {
        const val = values[item.key];
        const w = item.width ?? (item.type === 'daterange' ? 260 : item.type === 'search' ? 220 : 180);

        if (item.type === 'search') {
          return (
            <Flex key={item.key} vertical gap={2}>
              {item.label && <Text size="xs" type="secondary">{item.label}</Text>}
              <Input
                prefix={<SearchOutlined />}
                placeholder={item.placeholder ?? `ค้นหา${item.label ? ` ${item.label}` : ''}…`}
                defaultValue={val as string}
                onChange={e => debounceSet(item.key, e.target.value || undefined)}
                allowClear
                style={{ width: w }}
              />
            </Flex>
          );
        }

        if (item.type === 'select') {
          return (
            <Flex key={item.key} vertical gap={2}>
              {item.label && <Text size="xs" type="secondary">{item.label}</Text>}
              <Select
                placeholder={item.placeholder ?? `เลือก ${item.label}`}
                value={val as string | string[] | undefined}
                onChange={v => set(item.key, v ?? undefined)}
                options={item.options}
                mode={item.mode}
                allowClear
                style={{ width: w }}
              />
            </Flex>
          );
        }

        if (item.type === 'daterange') {
          return (
            <Flex key={item.key} vertical gap={2}>
              {item.label && <Text size="xs" type="secondary">{item.label}</Text>}
              <DateRangePresets
                value={val as [Dayjs | null, Dayjs | null] | null ?? undefined}
                onChange={range => set(item.key, range ?? undefined)}
                style={{ width: w }}
              />
            </Flex>
          );
        }

        return null;
      })}

      {hasAny && (
        <Button
          variant="ghost"
          size="small"
          icon={<ClearOutlined />}
          onClick={() => { onChange({}); onClear?.(); }}
          style={{ alignSelf: 'flex-end', marginBottom: 2 }}
        >
          ล้างตัวกรอง
        </Button>
      )}
    </Flex>
  );
}
