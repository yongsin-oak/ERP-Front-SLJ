import { useState, useCallback, useRef } from 'react';
import { Select } from '../Select';
import type { SelectOption } from '../Select';

const DEBOUNCE_MS = 300;

export interface SearchableSelectProps<T = string> {
  value?: T | null;
  onChange?: (value: T | null) => void;
  /** Called with current search text; must return options */
  onSearch: (query: string) => Promise<SelectOption[]> | SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  /** Displayed label for a pre-selected value when options haven't loaded yet */
  initialLabel?: string;
}

export function SearchableSelect<T = string>({
  value,
  onChange,
  onSearch,
  placeholder = 'พิมพ์เพื่อค้นหา…',
  disabled = false,
  style,
  initialLabel,
}: SearchableSelectProps<T>) {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!query.trim()) {
        setOptions([]);
        return;
      }
      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          setOptions(await onSearch(query));
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [onSearch],
  );

  // Build initial options if a value is pre-selected but options are empty
  const displayOptions =
    value != null && options.length === 0 && initialLabel
      ? [{ value: String(value), label: initialLabel }]
      : options;

  return (
    <Select
      showSearch={{ filterOption: false, onSearch: handleSearch }}
      loading={loading}
      value={value != null ? String(value) : undefined}
      onChange={(v) => onChange?.((v as T) ?? null)}
      allowClear
      placeholder={placeholder}
      options={displayOptions}
      disabled={disabled}
      notFoundContent={loading ? 'กำลังค้นหา…' : '—'}
      style={style}
    />
  );
}
