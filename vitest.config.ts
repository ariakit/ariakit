import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { version } from "react";
import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vitest/config";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./site/src/lib/source-plugin.ts";

const require = createRequire(import.meta.url);
const reactDir = dirname(require.resolve("react/package.json"));
const reactDomDir = dirname(require.resolve("react-dom/package.json"));

const excludeFromReact17 = [
  "examples/form-callback-queue",
  "examples/*-framer-motion/**",
  "examples/dialog-animated-various",
  "examples/combobox-group",
  "site/src/examples/combobox-group",
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

const sourcePluginInstance = sourcePlugin(
  join(import.meta.dirname, "site/src/examples/"),
);

const PLUGINS_BY_LOADER: Record<string, Array<Plugin> | undefined> = {
  // @ts-expect-error Plugin type mismatch between vite and vitest
  react: [reactPlugin(), sourcePluginInstance],
  solid: [solidPlugin(), sourcePluginInstance],
};

export default defineConfig({
  plugins: PLUGINS_BY_LOADER[LOADER],
  resolve: {
    alias: [
      { find: /^react-dom($|\/)/, replacement: `${reactDomDir}$1` },
      { find: /^react($|\/)/, replacement: `${reactDir}$1` },
    ],
    dedupe: ["react", "react-dom"],
  },
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
    css: {
      include: includeWithStyles,
    },
    sequence: {
      hooks: "parallel",
    },
    coverage: {
      include: ["packages"],
    },
  },
});
