/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_BASE_URL: string;
  readonly VITE_DEV_SERVER_URL: string;
  readonly VITE_IS_E2E: string;
  readonly VITE_GOOGLE_LOGIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
