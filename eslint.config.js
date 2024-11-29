import js from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended, // Built-in recommended ESLint rules
  {
    files: ["**/*.{ts,tsx}"], // Apply to TypeScript files
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ["./frontend/tsconfig.json", "./backend/tsconfig.json"],
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    rules: {
      // TypeScript-specific rules
      "no-unused-vars": "off", // Disable base rule
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ], // Enable TS-specific rule
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // Apply to all JS/TS files
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser, // Add browser globals
        ...globals.node, // Add Node.js globals
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // React-specific rules
      "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }], // Allow JSX in .jsx and .tsx files
      "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
      "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
      "prettier/prettier": ["error"], // Enforce Prettier formatting
      ...prettierConfig.rules, // Disable rules that conflict with Prettier
    },
  },
];
