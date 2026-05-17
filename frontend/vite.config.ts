// vite.config.ts
import fs from "fs";
import path from "path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      // ...,
    ],
    server: {
      https: {
        key: fs.readFileSync("./certs/localhost+1-key.pem"),
        cert: fs.readFileSync("./certs/localhost+1.pem"),
      },
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    base: "/",
    resolve: {
      alias: {
        "#frontend": path.resolve(__dirname, "src"),
      },
    },
    test: {
      globals: true,
      exclude: [...configDefaults.exclude, "tests*/**"],
    },
  };
});
