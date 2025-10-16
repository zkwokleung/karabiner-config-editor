import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

const reactRecommended = pluginReact.configs.flat.recommended;
const reactJsxRuntime = pluginReact.configs.flat["jsx-runtime"];
const jsRecommended = js.configs.recommended;
const tsRecommended = tseslint.configs.recommended.map((config) =>
  config.files ? config : { ...config, files: ["**/*.{ts,mts,cts,tsx}"] },
);

const jsConfig = {
  ...jsRecommended,
  files: ["**/*.{js,mjs,cjs,jsx}"],
  languageOptions: {
    ...(jsRecommended.languageOptions ?? {}),
    globals: { ...(jsRecommended.languageOptions?.globals ?? {}), ...globals.browser },
  },
};

export default defineConfig([
  { ignores: ["**/.next/**", "**/node_modules/**"] },
  jsConfig,
  ...tsRecommended,
  { files: ["**/*.{ts,mts,cts,tsx}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      ...(reactRecommended?.plugins ?? {}),
      ...(reactJsxRuntime?.plugins ?? {}),
      react: pluginReact,
    },
    languageOptions: {
      ...(reactRecommended?.languageOptions ?? {}),
      ...(reactJsxRuntime?.languageOptions ?? {}),
    },
    rules: {
      ...(reactRecommended?.rules ?? {}),
      ...(reactJsxRuntime?.rules ?? {}),
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
    settings: {
      ...(reactRecommended?.settings ?? {}),
      react: {
        ...(reactRecommended?.settings?.react ?? {}),
        version: "detect",
      },
    },
  },
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.jsonc"], plugins: { json }, language: "json/jsonc", extends: ["json/recommended"] },
]);
