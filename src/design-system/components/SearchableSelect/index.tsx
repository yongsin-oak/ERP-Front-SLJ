import { useState, useCallback, useRef } from 'react';
import { Select } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';

const DEBOUNCE_MS = 300;

export interface SearchableSelectProps<T = string> {
  value?: T | null;
  onChange?: (value: T | null) => void;
  /** Called with current search text; must return options */
  onSearch: (query: string) => Promise<DefaultOptionType[]> | DefaultOptionType[];
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
  const [options, setOptions] = useState<DefaultOptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!query.trim()) { setOptions([]); return; }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const result = await onSearch(query);
          setOptions(result);
        } finally {
          setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [onSearch],
  );

  const handleChange = (val: unknown) => {
    onChange?.((val as T) ?? null);
  };

  // Build initial options if a value is pre-selected but options are empty
  const displayOptions =
    value != null && options.length === 0 && initialLabel
      ? [{ value: value as unknown as string, label: initialLabel }]
      : options;

  return (
    <Select
      showSearch
      filterOption={false}
      loading={loading}
      value={value ?? undefined}
      onChange={handleChange}
      onSearch={handleSearch}
      onClear={() => onChange?.(null)}
      allowClear
      placeholder={placeholder}
      options={displayOptions}
      disabled={disabled}
      notFoundContent={loading ? null : '—'}
      style={{ width: '100%', ...style }}
    />
  );
}
