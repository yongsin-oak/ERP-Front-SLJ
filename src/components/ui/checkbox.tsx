import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { IconCheck, IconMinus } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border border-control-off bg-background text-primary-foreground shadow-xs transition-[color,background-color,border-color,box-shadow] duration-150 outline-none",
        "hover:border-primary",
        "focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:border-ring",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-disabled-bg",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {props.checked === "indeterminate" ? (
          <IconMinus className="size-3.5" stroke={3} />
        ) : (
          <IconCheck className="size-3.5" stroke={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
