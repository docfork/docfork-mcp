import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  // Global ignores
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "**/build/",
      "**/*.d.ts",
      "**/coverage/",
      "**/.nyc_output/",
    ],
  },

  // Base ESLint recommended rules for all files
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
      languageOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        globals: {
          ...globals.node,
          ...globals.es2021,
          NodeJS: "readonly",
        },
      },
    rules: {
      // Include TypeScript recommended rules
      ...typescriptEslint.configs.recommended.rules,

      // Custom TypeScript rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-inferrable-types": "off",

      // General JavaScript/TypeScript rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "off", // mcp servers need console logging
      "no-debugger": "error",
    },
  },

  // JavaScript files configuration (if any)
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "off", // mcp servers need console logging
      "no-debugger": "error",
    },
  },
];
