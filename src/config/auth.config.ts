import { ENV } from './env';

export const AUTH_CONFIG = {
  /** Bypass PIN/login — enabled via VITE_BYPASS_AUTH=true in .env */
  bypassEnabled: ENV.BYPASS_AUTH,
} as const;
