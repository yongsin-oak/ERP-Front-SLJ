import { ENV } from './env';

export const API_CONFIG = {
  baseURL: ENV.API_URL,
  timeout: 30000,
  withCredentials: true,
} as const;
