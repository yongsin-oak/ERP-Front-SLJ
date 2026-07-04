import { useRef, useCallback, useEffect } from 'react';
import { Input } from '../Input';
import type { InputRef } from '../Input';
import { Text } from '../Typography';
import { AppIcons } from '../../icons';
import { cn } from '@/lib/utils';

export interface ScanInputProps {
  onScan: (value: string) => void | Promise<void>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
}

// Designed for barcode / QR scanner input:
// - Auto-clears + re-focuses after each scan (scanners send Enter)
// - Works with keyboard scanners (they type fast and press Enter)
export function ScanInput({
  onScan,
  placeholder = 'สแกนหรือพิมพ์รหัส…',
  label,
  disabled = false,
  loading = false,
  hint,
}: ScanInputProps) {
  const inputRef = useRef<InputRef | null>(null);

  const refocus = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // ยิงบาร์โค้ดต่อเนื่อง: พอ input หายจาก disabled/loading ต้องได้โฟกัสคืนเอง
  const wasBlockedRef = useRef(false);
  useEffect(() => {
    const blocked = disabled || loading;
    if (wasBlockedRef.current && !blocked) refocus();
    wasBlockedRef.current = blocked;
  }, [disabled, loading, refocus]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      const el = e.currentTarget;
      const value = el.value.trim();
      if (!value) return;

      el.value = '';
      try {
        await onScan(value);
      } finally {
        refocus(); // ต้องได้โฟกัสคืนแม้ onScan จะ throw — ไม่งั้นสแกนตัวถัดไปหาย
      }
    },
    [onScan, refocus],
  );

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Text size="xs" type="secondary">
          {label}
        </Text>
      )}
      <Input
        ref={inputRef}
        prefix={<AppIcons.barcode className={cn(loading ? 'text-primary' : 'text-foreground-subtle')} />}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        autoFocus
        autoComplete="off"
        className="font-mono tracking-wider"
      />
      {hint && (
        <Text size="xs" type="secondary">
          {hint}
        </Text>
      )}
    </div>
  );
}
