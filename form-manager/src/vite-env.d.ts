/// <reference types="vite/client" />

// Para archivos de imagen
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // otras variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
