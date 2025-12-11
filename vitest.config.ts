import reactPlugin from "@vitejs/plugin-react";
import { version } from "react";
import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vitest/config";
import { configDefaults, defineConfig } from "vitest/config";
import "@waynevanson/vitest-benchmark/runner";

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

const benchrunner = CI
  ? {
      benchmark: {
        minCycles: 1,
        minMs: 27_000,
      },
      warmup: {
        minCycles: 0,
        minMs: 3_000,
      },
      results: {
        latency: {
          average: true,
          max: true,
          min: true,
          percentiles: [0.9, 0.5, 0.1],
        },
        throughput: {
          average: true,
          max: true,
          min: true,
          percentiles: [0.9, 0.5, 0.1],
        },
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
      results: {
        latency: {
          average: true,
          max: true,
          min: true,
          percentiles: [0.9, 0.5, 0.1],
        },
        throughput: {
          average: true,
          max: true,
          min: true,
          percentiles: [0.9, 0.5, 0.1],
        },
      },
    };

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

function createPrefix() {
  if (LOADER === "react") {
    if (isReact17) {
      return "react-17";
    } else if (!version.startsWith("18")) {
      return "react-next";
    } else {
      return "react";
    }
  } else {
    return "solid";
  }
}

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
      // Benchmark examples only
      ...(BENCH ? ["!/examples"] : []),
    ],
    css: {
      include: includeWithStyles,
    },
    coverage: {
      include: ["packages"],
    },
    runner: BENCH ? "@waynevanson/vitest-benchmark/runner" : undefined,
    provide: {
      benchrunner,
    },
    // use default reporters when not benchmarking
    reporters: BENCH
      ? undefined
      : [
          "default",
          [
            "@waynevanson/vitest-benchmark/reporter/bmf",
            { prefix: createPrefix() },
          ],
        ],
  },
});
