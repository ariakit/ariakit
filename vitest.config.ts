import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vitest/config";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./site/src/lib/source-plugin.ts";

// REACT_VERSION selects which React copy vitest uses via resolve aliases:
//   - unset: default react/react-dom (currently v18)
//   - "17":  react-17/react-dom-17 aliases (npm:react@17, npm:react-dom@17)
//   - "next": react-next/react-dom-next aliases (installed by `pnpm run reactnext`)
// The "17" aliases are installed alongside the defaults, so switching is
// non-destructive — no pnpm add/restore needed, no lockfile mutations.
const REACT_VERSION = process.env.REACT_VERSION;
const isReact17 = REACT_VERSION === "17";
const isReactNext = REACT_VERSION === "next";

// In a pnpm monorepo, each workspace package resolves its own copy of react
// from its node_modules. We use createRequire to find the exact react and
// react-dom directories installed at the root, then alias all imports to them.
// This ensures vitest always uses a single React copy.
const require = createRequire(import.meta.url);
const reactPkg = isReact17 ? "react-17" : isReactNext ? "react-next" : "react";
const reactDomPkg = isReact17
  ? "react-dom-17"
  : isReactNext
    ? "react-dom-next"
    : "react-dom";
const reactDir = dirname(require.resolve(`${reactPkg}/package.json`));
const reactDomDir = dirname(require.resolve(`${reactDomPkg}/package.json`));

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
    // Redirect all react/react-dom imports to the root-resolved versions.
    // Without this, workspace packages may each resolve their own copy of
    // react, causing "multiple React instances" errors in tests.
    alias: [
      { find: /^react-dom($|\/)/, replacement: `${reactDomDir}$1` },
      { find: /^react($|\/)/, replacement: `${reactDir}$1` },
      // When testing with React 17, also redirect @testing-library/react to
      // v12 and @testing-library/dom to v8, which are compatible with React 17.
      ...(isReact17
        ? [
            {
              find: /^@testing-library\/react($|\/)/,
              replacement: `${dirname(require.resolve("testing-library-react-12/package.json"))}$1`,
            },
            {
              find: /^@testing-library\/dom($|\/)/,
              replacement: `${dirname(require.resolve("testing-library-dom-8/package.json"))}$1`,
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
