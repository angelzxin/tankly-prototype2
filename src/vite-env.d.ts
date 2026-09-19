/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FUEL_PRICE_API_KEY: string;
  readonly VITE_FUEL_PRICE_API_BASE_URL: string;
  readonly VITE_MAPS_API_KEY: string;
  readonly VITE_MAPS_API_BASE_URL: string;
  readonly VITE_DATA_SOURCE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
