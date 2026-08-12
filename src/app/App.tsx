import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { IS_DEV } from '@config/env';
import { DevTools } from '@dev';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider, ThemeProvider } from './providers';
import { router } from './router';

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
        <Toaster />
        {IS_DEV && <DevTools />}
      </ThemeProvider>
    </QueryProvider>
  );
}
