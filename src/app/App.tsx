import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { IS_DEV } from '@config/env';
import { DevTools } from '@dev';
import { QueryProvider, ThemeProvider } from './providers';
import { router } from './router';

function AppInit() {
  const { getMe } = useAuth();
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
        {IS_DEV && <DevTools />}
      </ThemeProvider>
    </QueryProvider>
  );
}
