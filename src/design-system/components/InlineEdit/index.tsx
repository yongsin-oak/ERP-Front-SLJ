import { useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { Flex } from 'antd';
import { colors, spacing, radius } from '../../tokens';
import { AppIcons } from '../../icons';

// ── Styled ────────────────────────────────────────────────────────────────────

const DisplayWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[1]};
  cursor: pointer;
  border-radius: ${radius.sm};
  padding: 2px ${spacing[1]};
  min-width: 40px;

  .edit-icon {
    opacity: 0;
    font-size: 12px;
    color: ${colors.text.tertiary};
    transition: opacity 0.1s;
  }

  &:hover .edit-icon {
    opacity: 1;
  }

  &:hover {
    background: ${colors.bg.hover};
  }
`;

const StyledInput = styled.input`
  border: 1px solid ${colors.brand.primary};
  border-radius: ${radius.sm};
  padding: 2px ${spacing[2]};
  font-size: inherit;
  font-family: inherit;
  color: ${colors.text.primary};
  background: ${colors.bg.base};
  outline: none;
  box-shadow: 0 0 0 3px ${colors.brand.primary}22;
  min-width: 80px;
`;

const ActionBtn = styled.button<{ $confirm?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: ${radius.sm};
  cursor: pointer;
  font-size: 11px;
  background: ${({ $confirm }) => ($confirm ? colors.semantic.successBg : colors.semantic.errorBg)};
  color: ${({ $confirm }) => ($confirm ? colors.semantic.successText : colors.semantic.errorText)};

  &:hover {
    opacity: 0.8;
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

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
    if (trimmed === value) { cancel(); return; }
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
      if (e.key === 'Enter') { e.preventDefault(); confirm(); }
      if (e.key === 'Escape') cancel();
    },
    [confirm, cancel],
  );

  if (editing) {
    return (
      <Flex align="center" gap={spacing[1]}>
        <StyledInput
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (!saving) cancel(); }}
          disabled={saving}
          autoFocus
        />
        <ActionBtn $confirm onMouseDown={e => { e.preventDefault(); confirm(); }}>
          <AppIcons.check />
        </ActionBtn>
        <ActionBtn onMouseDown={e => { e.preventDefault(); cancel(); }}>
          <AppIcons.close />
        </ActionBtn>
      </Flex>
    );
  }

  return (
    <DisplayWrap onClick={startEdit} title={disabled ? undefined : 'คลิกเพื่อแก้ไข'}>
      <span style={{ color: value ? colors.text.primary : colors.text.tertiary }}>
        {renderDisplay ? renderDisplay(value) : (value || placeholder)}
      </span>
      {!disabled && <AppIcons.edit className="edit-icon" />}
    </DisplayWrap>
  );
}
