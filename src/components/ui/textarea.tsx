import * as React from "react"

import { cn } from "@/lib/utils"
import { FIELD_BORDER } from "@/lib/fieldStyles"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md bg-control px-3 py-2 text-sm text-foreground ease-out",
        "placeholder:text-foreground-muted selection:bg-primary selection:text-primary-foreground",
        FIELD_BORDER,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
