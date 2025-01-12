import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "#frontend": path.resolve(__dirname, "src"),
      "#backend": path.resolve(__dirname, "../backend/src"),
      "#publicAssets": path.resolve(__dirname, "public"),
    },
  },
  test: {
    pool: "threads",
    isolate: false,
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
  },
});
