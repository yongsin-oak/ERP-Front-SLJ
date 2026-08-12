import { InputNumber } from '../InputNumber';
import { AppIcons } from '../../icons';
import { cn } from '@/lib/utils';

type StepperSize = 'middle' | 'large';

/**
 * ความสูงของปุ่มและ field ใช้ geometry contract เดียวกับ control อื่น
 */
const SIZE: Record<StepperSize, { btn: string; field: string; input: 'middle' | 'large' }> = {
  middle: { btn: 'size-8.5', field: 'h-8.5 w-14', input: 'middle' },
  large: { btn: 'size-9.5', field: 'h-9.5 w-16', input: 'large' },
};

export interface QuantityStepperProps {
  value?: number | null;
  onChange?: (value: number) => void;
  /** ค่าต่ำสุด — ค่าเริ่มต้น 0 (กด − ต่ำกว่านี้ไม่ได้) */
  min?: number;
  max?: number;
  /** จำนวนที่เพิ่ม/ลดต่อการกด 1 ครั้ง */
  step?: number;
  disabled?: boolean;
  size?: StepperSize;
  /** อ่านให้ screen reader รู้ว่าสเต็ปเปอร์นี้คุมจำนวนอะไร เช่น "จำนวนแพ็ค" */
  label?: string;
  className?: string;
}

/**
 * ช่องกรอกจำนวนพร้อมปุ่ม − / + — พิมพ์เองก็ได้ กดปุ่มก็ได้
 * ต่างจาก `QuantityInput` ที่เป็นช่องจำนวน + ตัวเลือกหน่วย (ชิ้น/กล่อง/แพ็ค)
 */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled,
  size = 'middle',
  label,
  className,
}: QuantityStepperProps) {
  const s = SIZE[size];
  const current = value ?? 0;
  const atMin = current <= min;
  const atMax = max != null && current >= max;

  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min, n));
  const commit = (n: number | null) => onChange?.(clamp(n ?? min));

  const btn = cn(
    'flex shrink-0 items-center justify-center border border-border-control bg-control text-foreground',
    'transition-colors duration-(--duration-fast) ease-out outline-none hover:bg-surface-100 active:bg-surface-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger',
    'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled',
    s.btn,
  );

  return (
    <div className={cn('inline-flex w-fit self-start items-stretch', className)}>
      <button
        type="button"
        aria-label={label ? `ลด${label}` : 'ลดจำนวน'}
        disabled={disabled || atMin}
        onClick={() => commit(current - step)}
        className={cn(btn, 'rounded-l-md border-r-0')}
      >
        <AppIcons.minus size={size === 'large' ? 16 : 14} />
      </button>

      <InputNumber
        value={current}
        onChange={commit}
        min={min}
        max={max}
        precision={0}
        size={s.input}
        disabled={disabled}
        className={cn('rounded-none px-2', s.field)}
      />

      <button
        type="button"
        aria-label={label ? `เพิ่ม${label}` : 'เพิ่มจำนวน'}
        disabled={disabled || atMax}
        onClick={() => commit(current + step)}
        className={cn(btn, 'rounded-r-md border-l-0')}
      >
        <AppIcons.add size={size === 'large' ? 16 : 14} />
      </button>
    </div>
  );
}
