/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_METEO_FORECAST_BASE_URL: string;
  readonly VITE_METEO_GEOCODING_BASE_URL: string;
  readonly VITE_BASE_LATITUDE: string;
  readonly VITE_BASE_LONGITUDE: string;
  readonly VITE_GEOAPIFY_API_KEY: string;
  readonly VITE_GEOAPIFY_REVERSE_GEOCODING_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
