// vite.config.ts
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    // ...,
  ],
  base: command === "serve" ? "/" : "/personal-finance-app/",
  resolve: {
    alias: {
      "#frontend": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, "tests*/**"],
  },
}));
