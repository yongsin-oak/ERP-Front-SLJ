import { ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';
import { lightAntdTheme } from '@design-system/antd/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={lightAntdTheme} locale={thTH}>
      {children}
    </ConfigProvider>
  );
}
