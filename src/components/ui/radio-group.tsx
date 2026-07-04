import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-2.5", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4.5 shrink-0 rounded-full border border-control-off bg-background shadow-xs transition-[color,border-color,box-shadow] duration-150 outline-none",
        "hover:border-primary",
        "focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:border-ring",
        "data-[state=checked]:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-disabled-bg",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex size-full items-center justify-center after:block after:size-2 after:rounded-full after:bg-primary after:content-['']"
      />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
