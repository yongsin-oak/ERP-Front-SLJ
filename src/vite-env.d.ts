/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend API — required in all environments */
  readonly VITE_BACKEND_API_URL: string;
  /** Runtime environment: 'development' | 'production' | 'test' */
  readonly VITE_ENV_MODE: 'development' | 'production' | 'test';
  /** Skip PIN/auth gates in dev — set to 'true' to enable bypass */
  readonly VITE_BYPASS_AUTH: boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}