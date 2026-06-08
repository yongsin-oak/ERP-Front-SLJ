export const ENV = {
  API_URL: import.meta.env.VITE_BACKEND_API_URL,
  MODE: import.meta.env.VITE_ENV_MODE,
  BYPASS_AUTH: import.meta.env.VITE_BYPASS_AUTH === true,
} as const;

export const IS_DEV = ENV.MODE === 'development';
