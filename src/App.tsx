import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from '@routes/index';
import { useAuth } from '@features/auth/hooks';
import { lightAntdTheme } from '@lib/theme/antdTheme/light';
import { queryClient } from '@lib/queryClient';
import { DevTools } from '@dev';

const IS_DEV = import.meta.env.VITE_ENV_MODE === 'development';

function AppInit() {
  const { getMe } = useAuth();
  useEffect(() => {
    getMe();
  }, [getMe]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={lightAntdTheme} locale={thTH}>
        <AppInit />
        <RouterProvider router={router} />
        {IS_DEV && <DevTools />}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
