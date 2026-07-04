import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-[color,border-color,box-shadow] duration-150 outline-none",
        "placeholder:text-foreground-subtle selection:bg-primary selection:text-primary-foreground",
        "hover:border-border-strong",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
