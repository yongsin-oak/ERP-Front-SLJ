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
        "aspect-square size-4 shrink-0 rounded-full border border-border-control bg-control transition-colors duration-(--duration-fast) ease-out outline-none",
        "hover:border-border-stronger",
        "focus-visible:border-border-stronger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-border-stronger",
        "data-[state=checked]:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-disabled-bg",
        "aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
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
