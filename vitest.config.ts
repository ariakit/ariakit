import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vitest/config";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./site/src/lib/source-plugin.ts";

// REACT_VERSION selects which React copy to test against:
//   - unset: default react/react-dom (currently v18)
//   - "17":  react-17/react-dom-17 aliases (npm:react@17, npm:react-dom@17)
//   - "next": react-next/react-dom-next aliases (updated by `pnpm run reactnext`)
// The aliased packages are installed alongside the defaults, so switching
// is non-destructive — no pnpm add/restore needed, no lockfile mutations.
// Module redirection is handled by vitest.react-version.ts (patches
// Node.js Module._resolveFilename) and Vite resolve.alias (for ESM).
const REACT_VERSION = process.env.REACT_VERSION;
const isReact17 = REACT_VERSION === "17";

// In a pnpm monorepo, each workspace package may resolve its own copy of
// react from its node_modules. We pin all imports to a single copy via
// resolve.alias to prevent "multiple React instances" errors in tests.
const require = createRequire(import.meta.url);

function resolvePkg(pkg: string) {
  return dirname(require.resolve(`${pkg}/package.json`));
}

const reactSuffix = REACT_VERSION ? `-${REACT_VERSION}` : "";
const reactDir = resolvePkg(`react${reactSuffix}`);
const reactDomDir = resolvePkg(`react-dom${reactSuffix}`);

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
      ...(isReact17
        ? [
            {
              find: /^@testing-library\/react($|\/)/,
              replacement: `${resolvePkg("testing-library-react-12")}$1`,
            },
            {
              find: /^@testing-library\/dom($|\/)/,
              replacement: `${resolvePkg("testing-library-dom-8")}$1`,
            },
          ]
        : []),
    ],
    dedupe: ["react", "react-dom"],
  },
  test: {
    globals: true,
    watch: false,
    testTimeout: 10_000,
    environment: "jsdom",
    // vitest.react-version.ts patches Module._resolveFilename to redirect
    // CJS require('react-dom') calls that bypass Vite's resolve.alias.
    setupFiles: ["vitest.react-version.ts", "vitest.setup.ts"],
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
