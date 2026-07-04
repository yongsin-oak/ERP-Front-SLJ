import * as React from 'react';
import {
  Tooltip as UITooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export type TooltipPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'left'
  | 'right';

const PLACEMENT: Record<
  TooltipPlacement,
  { side: 'top' | 'bottom' | 'left' | 'right'; align: 'start' | 'center' | 'end' }
> = {
  top: { side: 'top', align: 'center' },
  topLeft: { side: 'top', align: 'start' },
  topRight: { side: 'top', align: 'end' },
  bottom: { side: 'bottom', align: 'center' },
  bottomLeft: { side: 'bottom', align: 'start' },
  bottomRight: { side: 'bottom', align: 'end' },
  left: { side: 'left', align: 'center' },
  right: { side: 'right', align: 'center' },
};

export interface TooltipProps {
  title?: React.ReactNode;
  placement?: TooltipPlacement;
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Tooltip({
  title,
  placement = 'top',
  children,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) {
  if (title == null || title === '') return <>{children}</>;
  const p = PLACEMENT[placement] ?? PLACEMENT.top;

  return (
    <UITooltip open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <TooltipTrigger asChild>
        <span className="inline-flex">{children}</span>
      </TooltipTrigger>
      <TooltipContent side={p.side} align={p.align}>
        {title}
      </TooltipContent>
    </UITooltip>
  );
}
