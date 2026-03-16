import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,
  sortImports: { newlinesBetween: false },
  ignorePatterns: ["*.css", "packages/ariakit-*/package.json"],
});
