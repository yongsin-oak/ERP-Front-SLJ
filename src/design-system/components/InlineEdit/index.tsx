import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AppIcons } from '../../icons';

export interface InlineEditProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  /** Display render — defaults to the raw value string */
  renderDisplay?: (value: string) => React.ReactNode;
}

export function InlineEdit({
  value,
  onSave,
  placeholder = '—',
  disabled = false,
  renderDisplay,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [disabled, value]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  const confirm = useCallback(async () => {
    const trimmed = draft.trim();
    if (trimmed === value) {
      cancel();
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }, [draft, value, onSave, cancel]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirm();
      }
      if (e.key === 'Escape') cancel();
    },
    [confirm, cancel],
  );

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!saving) cancel();
          }}
          disabled={saving}
          autoFocus
          className="min-w-20 rounded-sm border border-primary bg-background px-2 py-0.5 font-[inherit] text-[length:inherit] text-foreground outline-none ring-[3px] ring-ring/20"
        />
        <button
          type="button"
          aria-label="บันทึก"
          onMouseDown={(e) => {
            e.preventDefault();
            confirm();
          }}
          className="inline-flex size-5.5 items-center justify-center rounded-sm bg-success-bg text-success-text transition-opacity hover:opacity-80"
        >
          <AppIcons.check className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label="ยกเลิก"
          onMouseDown={(e) => {
            e.preventDefault();
            cancel();
          }}
          className="inline-flex size-5.5 items-center justify-center rounded-sm bg-error-bg text-error-text transition-opacity hover:opacity-80"
        >
          <AppIcons.close className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={startEdit}
      title={disabled ? undefined : 'คลิกเพื่อแก้ไข'}
      className={cn(
        'group inline-flex min-w-10 items-center gap-1 rounded-sm px-1 py-0.5',
        !disabled && 'cursor-pointer hover:bg-accent',
      )}
    >
      <span className={cn(value ? 'text-foreground' : 'text-foreground-subtle')}>
        {renderDisplay ? renderDisplay(value) : value || placeholder}
      </span>
      {!disabled && (
        <AppIcons.edit className="size-3.5 text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );
}
