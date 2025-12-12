import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:5096/openapi/v1.json",
  output: "src/shared/client",
  plugins: ["zod", "@tanstack/react-query"],
});
