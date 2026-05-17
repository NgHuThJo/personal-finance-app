/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_FRONTEND_URL: string;
  readonly VITE_IS_E2E: string;
  readonly VITE_GOOGLE_LOGIN_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
