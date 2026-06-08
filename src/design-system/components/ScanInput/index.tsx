import { useRef, useCallback } from 'react';
import { Flex } from 'antd';
import { BarcodeOutlined } from '@ant-design/icons';
import { Input } from '../Input';
import { colors, spacing } from '../../tokens';
import { Text } from '../Typography';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScanInputProps {
  onScan: (value: string) => void | Promise<void>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
//
// Designed for barcode / QR scanner input:
// - Auto-clears + re-focuses after each scan (scanners send Enter)
// - Works with keyboard scanners (they type fast and press Enter)
// - Call focus() via ref if you need to programmatically focus

export function ScanInput({
  onScan,
  placeholder = 'สแกนหรือพิมพ์รหัส…',
  label,
  disabled = false,
  loading = false,
  hint,
}: ScanInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refocus = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      const el = e.currentTarget;
      const value = el.value.trim();
      if (!value) return;

      el.value = '';
      await onScan(value);
      refocus();
    },
    [onScan, refocus],
  );

  return (
    <Flex vertical gap={spacing[1]}>
      {label && <Text size="xs" type="secondary">{label}</Text>}
      <Input
        ref={inputRef}
        prefix={
          <BarcodeOutlined
            style={{ color: loading ? colors.brand.primary : colors.text.tertiary }}
          />
        }
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        autoFocus
        autoComplete="off"
        style={{ fontFamily: 'monospace', letterSpacing: 1 }}
      />
      {hint && <Text size="xs" type="secondary">{hint}</Text>}
    </Flex>
  );
}
