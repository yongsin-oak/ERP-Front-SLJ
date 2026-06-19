import styled from '@emotion/styled';
import { colors , AppIcons } from '@design-system';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
`;

const Key = styled.button<{ variant?: 'danger' | 'muted' }>`
  height: 56px;
  border: 1.5px solid ${colors.border.strong};
  border-radius: 10px;
  background: ${({ variant }) =>
    variant === 'danger' ? colors.semantic.errorBg :
    variant === 'muted'  ? colors.bg.hover :
    colors.bg.base};
  color: ${({ variant }) =>
    variant === 'danger' ? colors.semantic.error : colors.text.primary};
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, transform 0.08s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover  { background: ${colors.bg.hover}; }
  &:active { transform: scale(0.94); background: ${colors.bg.active}; }
  &:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
`;

interface Props {
  onKey: (key: string) => void;
  disabled?: boolean;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','clear','0','backspace'];

export function PinPad({ onKey, disabled }: Props) {
  return (
    <Grid>
      {KEYS.map((k) => (
        <Key
          key={k}
          type="button"
          disabled={disabled}
          variant={k === 'clear' ? 'danger' : k === 'backspace' ? 'muted' : undefined}
          onClick={() => onKey(k)}
          aria-label={k}
        >
          {k === 'backspace' ? <AppIcons.delete style={{ fontSize: 18 }} /> :
           k === 'clear'     ? 'C' : k}
        </Key>
      ))}
    </Grid>
  );
}
