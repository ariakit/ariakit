import { version } from "react";
import { configDefaults, defineConfig } from "vitest/config";

const excludeFromReact17 = [
  "examples/form-callback-queue",
  "examples/*-framer-motion/**",
  "examples/dialog-animated-various",
];

const includeWithStyles = [/dialog-animated-various/];

const isReact17 = version.startsWith("17");

export default defineConfig({
  test: {
    globals: true,
    watch: false,
    environment: "jsdom",
    include: ["**/*test.{ts,tsx}"],
    exclude: [
      ...configDefaults.exclude,
      ...(isReact17 ? excludeFromReact17 : []),
    ],
    css: {
      include: includeWithStyles,
    },
    setupFiles: ["vitest.setup.ts"],
    coverage: {
      include: ["packages"],
    },
  },
});
