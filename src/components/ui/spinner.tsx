import * as React from "react"
import { IconLoader2 } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const SIZE = {
  sm: "size-3",
  md: "size-3.5",
  lg: "size-4",
} as const

function Spinner({
  className,
  size = "md",
  ...props
}: React.ComponentProps<"svg"> & { size?: keyof typeof SIZE }) {
  return (
    <IconLoader2
      role="status"
      aria-label="loading"
      className={cn("animate-spin text-foreground-lighter", SIZE[size], className)}
      {...props}
    />
  )
}

export { Spinner }
