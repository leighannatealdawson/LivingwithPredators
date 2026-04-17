/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUBMIT_URL?: string;
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
