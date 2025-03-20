import { version } from "react";
import solidPlugin from "vite-plugin-solid";
import { type Plugin, configDefaults, defineConfig } from "vitest/config";

const excludeFromReact17 = [
  "examples/form-callback-queue",
  "examples/*-framer-motion/**",
  "examples/dialog-animated-various",
  "examples/combobox-group",
  "examples/*-radix*/**",
  "examples/*react-router*/**",
];

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

const isReact17 = version.startsWith("17");

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];
const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;
if (!ALLOWED_TEST_LOADERS.includes(LOADER))
  throw new Error(`Invalid loader: ${LOADER}`);

const PLUGINS_BY_LOADER: Record<string, Array<Plugin> | undefined> = {
  solid: [solidPlugin()],
};

export default defineConfig({
  plugins: PLUGINS_BY_LOADER[LOADER],
  test: {
    globals: true,
    watch: false,
    testTimeout: 10_000,
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    include: ["**/*test.{ts,tsx}", `**/*test.${LOADER}.{ts,tsx}`],
    exclude: [
      ...configDefaults.exclude,
      ...(isReact17 ? excludeFromReact17 : []),
    ],
    browser: {
      name: "chromium",
    },
    css: {
      include: includeWithStyles,
    },
    coverage: {
      include: ["packages"],
    },
    benchmark: {
      include: ["**/*{test,perf}.{ts,tsx}", `**/*{test,perf}.${LOADER}.{ts,tsx}`],
    },
  },
});
