import { IS_DEV } from './env';

export const APP_CONFIG = {
  name: 'SLJ Supply Center',
  version: '1.0.0',
  isDev: IS_DEV,
} as const;
