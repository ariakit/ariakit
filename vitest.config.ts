import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vitest/config";
import { defineConfig } from "vitest/config";
import { sourcePlugin } from "./site/src/lib/source-plugin.ts";

// In a pnpm monorepo, each workspace package may resolve its own copy of
// react from its node_modules. We pin all imports to a single copy via
// resolve.alias to prevent "multiple React instances" errors in tests.
const require = createRequire(import.meta.url);

function resolvePkg(pkg: string) {
  return dirname(require.resolve(`${pkg}/package.json`));
}

const reactDir = resolvePkg("react");
const reactDomDir = resolvePkg("react-dom");

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

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
