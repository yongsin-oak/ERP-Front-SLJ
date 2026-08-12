import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/**
 * Supabase-style toast surface — พื้น overlay + เส้นขอบ, เงาเฉพาะเพราะมันลอยเหนือหน้า,
 * สีบอกชนิดอยู่ที่ "ไอคอน" อย่างเดียว ไม่ย้อมพื้นทั้งใบ
 * สีทั้งหมดผูกกับ semantic token (--overlay / --border-overlay / status) ไม่มี hex ตรงๆ
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      offset={16}
      gap={8}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group rounded-md border border-overlay bg-overlay text-popover-foreground shadow-overlay",
          title: "text-sm font-medium text-foreground",
          description: "!text-foreground-light text-xs leading-snug",
          closeButton:
            "!bg-overlay !border-border !text-foreground-lighter hover:!text-foreground",
          actionButton: "!bg-primary !text-primary-foreground !rounded-md",
          cancelButton: "!bg-surface-200 !text-foreground-light !rounded-md",
          success: "[&_[data-icon]]:text-success",
          error: "[&_[data-icon]]:text-error",
          warning: "[&_[data-icon]]:text-warning",
          info: "[&_[data-icon]]:text-info",
        },
      }}
      style={
        {
          "--normal-bg": "var(--overlay)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border-overlay)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
