import reactPlugin from "@vitejs/plugin-react";
import { version } from "react";
import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vitest/config";
import { configDefaults, defineConfig } from "vitest/config";

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

const BENCH = process.env.ARIAKIT_BENCH === "1";
const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;
const CI = process.env.CI;

if (BENCH) {
  const config = CI
    ? {
        benchmark: {
          minCycles: 1,
          minMs: 27_000,
        },
        warmup: {
          minCycles: 0,
          minMs: 3_000,
        },
      }
    : {
        // 1 cycle of warmup and benchmark respectively is enough to catch errors.
        benchmark: {
          minCycles: 2,
          minMs: 0,
        },
        warmup: {
          minCycles: 1,
          minMs: 0,
        },
      };

  process.env.VITEST_RUNNER_BENCHMARK_OPTIONS = JSON.stringify(config);
}

const isReact17 = version.startsWith("17");

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];
if (!ALLOWED_TEST_LOADERS.includes(LOADER))
  throw new Error(`Invalid loader: ${LOADER}`);

const PLUGINS_BY_LOADER: Record<string, Array<Plugin> | undefined> = {
  // @ts-expect-error I believe this error will go away when we regenerate
  // package-lock.json
  react: [reactPlugin()],
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
    css: {
      include: includeWithStyles,
    },
    coverage: {
      include: ["packages"],
    },
    runner: BENCH ? "./node_modules/vitest-runner-benchmark/runner" : undefined,
  },
});
