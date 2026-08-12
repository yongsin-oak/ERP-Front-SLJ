import * as React from "react"

import { cn } from "@/lib/utils"
import { FIELD_BORDER } from "@/lib/fieldStyles"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-8.5 w-full min-w-0 rounded-md bg-control px-3 py-1 text-sm text-foreground ease-out",
        "placeholder:text-foreground-muted selection:bg-primary selection:text-primary-foreground",
        FIELD_BORDER,
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
