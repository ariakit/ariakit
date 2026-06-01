import { join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";

const rootDir = process.cwd();

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

const allowedTestLoaders = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof allowedTestLoaders)[number];
const loader = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;
if (!allowedTestLoaders.includes(loader)) {
  throw new Error(`Invalid loader: ${loader}`);
}

const allowedTestSuites = ["all", "react"] as const;
type AllowedTestSuite = (typeof allowedTestSuites)[number];
const suite = (process.env.ARIAKIT_TEST_SUITE ?? "all") as AllowedTestSuite;
if (!allowedTestSuites.includes(suite)) {
  throw new Error(`Invalid test suite: ${suite}`);
}

const testIncludesBySuite: Record<AllowedTestSuite, string[]> = {
  all: ["**/*test.{ts,tsx}", `**/*test.${loader}.{ts,tsx}`],
  react: [
    "packages/ariakit-react*/src/**/*test.{ts,tsx}",
    "packages/ariakit-react*/src/**/*test.react.{ts,tsx}",
    "packages/ariakit-test/src/**/*test.react.{ts,tsx}",
    "examples/**/test.{ts,tsx}",
    "examples/**/test.react.{ts,tsx}",
    "app/src/{examples,sandbox}/**/test.{ts,tsx}",
    "app/src/{examples,sandbox}/**/test.react.{ts,tsx}",
  ],
};

// sourcePlugin is typed against the app workspace's Vite copy, while Vitest
// consumes the root Vite types. The runtime plugin shape is compatible.
// TODO: Remove this cast when Astro and the root test stack use the same Vite
// major again; this may happen with Astro 7 and Vite 8.
const sourcePluginInstance = sourcePlugin(
  join(rootDir, "app/src/examples/"),
) as unknown as PluginOption;

const pluginsByLoader: Record<AllowedTestLoader, Array<PluginOption>> = {
  react: [reactPlugin(), sourcePluginInstance],
  solid: [solidPlugin(), sourcePluginInstance],
};

export default defineConfig({
  root: rootDir,
  plugins: pluginsByLoader[loader],
  test: {
    watch: false,
    testTimeout: 10_000,
    environment: "jsdom",
    setupFiles: [join(rootDir, "vitest.setup.ts")],
    exclude: [...configDefaults.exclude, ".claude/**"],
    include: testIncludesBySuite[suite],
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
