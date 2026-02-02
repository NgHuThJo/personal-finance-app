import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://localhost:7111/openapi/v1.json",
  output: "src/shared/client",
  plugins: ["zod", "@tanstack/react-query"],
});
