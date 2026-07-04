import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Stripe-style toast surface — white card, colored type icon, subtle border + elevation.
 * สีทั้งหมดผูกกับ semantic token (--popover / --border / status) ไม่มี hex ตรงๆ
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      offset={16}
      gap={10}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group rounded-lg border border-border bg-popover text-popover-foreground shadow-lg",
          title: "text-sm font-medium text-foreground",
          description: "!text-muted-foreground text-[13px] leading-snug",
          closeButton:
            "!bg-popover !border-border !text-muted-foreground hover:!text-foreground",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
          success: "[&_[data-icon]]:text-success",
          error: "[&_[data-icon]]:text-error",
          warning: "[&_[data-icon]]:text-warning",
          info: "[&_[data-icon]]:text-info",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
