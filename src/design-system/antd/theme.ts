import { theme as antdAlgorithm } from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider/context';
import { globalTokens } from './tokens';
import { componentTokens } from './components';

export const lightAntdTheme: ThemeConfig = {
  algorithm: antdAlgorithm.defaultAlgorithm,
  token: globalTokens,
  components: componentTokens,
};
