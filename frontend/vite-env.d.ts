/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_WEBSOCKET_URL: string;
  readonly VITE_TEST_SEED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
