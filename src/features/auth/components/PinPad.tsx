import { AppIcons } from '@design-system';
import { cn } from '@/lib/utils';

interface Props {
  onKey: (key: string) => void;
  disabled?: boolean;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','clear','0','backspace'];

const KEY_BASE =
  'flex h-14 select-none items-center justify-center rounded-[10px] border-[1.5px] border-border-strong text-xl font-semibold outline-none transition-[background,transform] duration-100 [-webkit-tap-highlight-color:transparent] hover:bg-accent active:scale-[0.94] active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-35 disabled:transform-none';

const KEY_VARIANT: Record<'danger' | 'muted' | 'default', string> = {
  danger: 'bg-error-bg text-error',
  muted: 'bg-accent text-foreground',
  default: 'bg-card text-foreground',
};

export function PinPad({ onKey, disabled }: Props) {
  return (
    <div className="grid w-full grid-cols-3 gap-2.5">
      {KEYS.map((k) => {
        const variant = k === 'clear' ? 'danger' : k === 'backspace' ? 'muted' : 'default';
        return (
          <button
            key={k}
            type="button"
            disabled={disabled}
            className={cn(KEY_BASE, KEY_VARIANT[variant])}
            onClick={() => onKey(k)}
            aria-label={k}
          >
            {k === 'backspace' ? <AppIcons.delete className="size-4.5" /> :
             k === 'clear'     ? 'C' : k}
          </button>
        );
      })}
    </div>
  );
}
