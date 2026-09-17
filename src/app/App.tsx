import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuth } from '@features/auth';
import { IS_DEV } from '@config/env';
import { DevTools } from '@dev';
import { QueryProvider, ThemeProvider } from './providers';
import { router } from './router';

/**
 * Supabase-style toast surface — พื้น overlay + เส้นขอบ, เงาเฉพาะเพราะมันลอยเหนือหน้า,
 * สีบอกชนิดอยู่ที่ "ไอคอน" อย่างเดียว ไม่ย้อมพื้นทั้งใบ
 * สีทั้งหมดผูกกับ semantic token (--overlay / --border-overlay / status) ไม่มี hex ตรงๆ
 */
const TOAST_CLASSNAMES = {
  toast:
    'group rounded-xl border border-overlay border-l-[4px] bg-overlay text-popover-foreground shadow-overlay',
  title: 'text-sm font-semibold text-foreground',
  description: '!text-foreground-light text-xs leading-relaxed',
  closeButton: '!bg-overlay !border-border !text-foreground-lighter hover:!text-foreground',
  actionButton: '!bg-primary !text-primary-foreground !rounded-md',
  cancelButton: '!bg-surface-200 !text-foreground-light !rounded-md',
  success: '!border-l-success [&_[data-icon]]:text-success',
  error: '!border-l-error [&_[data-icon]]:text-error',
  warning: '!border-l-warning [&_[data-icon]]:text-warning',
  info: '!border-l-info [&_[data-icon]]:text-info',
  loading: '!border-l-primary [&_[data-icon]]:text-primary',
} as const;

const TOAST_STYLE = {
  '--normal-bg': 'var(--overlay)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border-overlay)',
  '--border-radius': 'var(--radius)',
} as CSSProperties;

function AppInit() {
  // selector ทีละค่า — subscribe แค่ action ไม่ใช่ทั้ง store (ดูเหตุผลใน PrivateRoute)
  const getMe = useAuth((s) => s.getMe);
  useEffect(() => {
    getMe();
  }, [getMe]);
  return null;
}

export default function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppInit />
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          offset={16}
          gap={8}
          closeButton
          toastOptions={{ classNames: TOAST_CLASSNAMES }}
          style={TOAST_STYLE}
        />
        {IS_DEV && <DevTools />}
      </ThemeProvider>
    </QueryProvider>
  );
}
