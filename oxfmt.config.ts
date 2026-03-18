import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  sortImports: { newlinesBetween: false },
  ignorePatterns: [
    "*.css",
    "worker-configuration.d.ts",
    "packages/ariakit-*/package.json",
  ],
});
