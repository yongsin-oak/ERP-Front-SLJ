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
        "peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-control bg-control text-primary-foreground transition-colors duration-(--duration-fast) ease-out outline-none",
        "hover:border-border-stronger",
        "focus-visible:border-border-stronger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-disabled-bg",
        "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        {props.checked === "indeterminate" ? (
          <IconMinus className="size-3" stroke={3} />
        ) : (
          <IconCheck className="size-3" stroke={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
