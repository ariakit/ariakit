import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { globSync } from "glob";
import type { PluginOption } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";
import { getTestLoader } from "./test-loader.ts";
import type { AllowedTestLoader } from "./test-loader.ts";

const rootDir = process.cwd();

// Workaround: Playwright 1.59 syncs navigator.platform with the user agent,
// causing "Win32" on macOS (since Desktop Chrome has a Windows UA). This breaks
// modifier-key detection (Meta vs Control). Remove once resolved upstream.
// https://github.com/microsoft/playwright/issues/40009
process.env.PLAYWRIGHT_NO_UA_PLATFORM = "1";

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

const testLoader = getTestLoader();

const defaultTestIncludes = ["**/*test.{ts,tsx}"];

const defaultTestExcludes = [
  "packages/ariakit-react*/src/**/*test.{ts,tsx}",
  "packages/ariakit-solid*/src/**/*test.{ts,tsx}",
  "examples/**/test.{ts,tsx}",
  "app/src/{examples,sandbox}/**/test.{ts,tsx}",
];

function getFrameworkTestIncludes(loader: AllowedTestLoader) {
  const entryFiles = globSync(
    `{examples,app/src/{examples,sandbox}}/**/index.${loader}.tsx`,
    { cwd: rootDir },
  );
  const exampleTests = entryFiles.flatMap((file) => {
    const dir = dirname(file);
    return [`${dir}/test.{ts,tsx}`, `${dir}/test.${loader}.{ts,tsx}`];
  });
  return [
    `packages/ariakit-${loader}*/src/**/*test.{ts,tsx}`,
    `packages/ariakit-${loader}*/src/**/*test.${loader}.{ts,tsx}`,
    `packages/ariakit-test/src/**/*test.${loader}.{ts,tsx}`,
    ...exampleTests,
  ];
}

const testIncludes = testLoader
  ? getFrameworkTestIncludes(testLoader)
  : defaultTestIncludes;

const testExcludes = [
  ...configDefaults.exclude,
  ".claude/**",
  ...(testLoader ? [] : defaultTestExcludes),
];

// Framework render suites run in Vitest Browser Mode so example and sandbox
// tests using @ariakit/test execute in Chromium instead of a simulated DOM.
// Non-framework suites keep happy-dom because it provides the DOM they need
// without paying the Browser Mode cost for pure package tests.
const environment = process.env.ARIAKIT_TEST_ENV ?? "happy-dom";

// sourcePlugin is typed against the app workspace's Vite copy, while Vitest
// consumes the root Vite types. The runtime plugin shape is compatible.
// TODO: Remove this cast when Astro and the root test stack use the same Vite
// major again; this may happen with Astro 7 and Vite 8.
const sourcePluginInstance = sourcePlugin(
  join(rootDir, "app/src/examples/"),
) as unknown as PluginOption;

const plugins = [sourcePluginInstance];
if (testLoader === "react") {
  plugins.unshift(reactPlugin());
} else if (testLoader === "solid") {
  plugins.unshift(solidPlugin());
}

export default defineConfig({
  root: rootDir,
  plugins,
  ...(testLoader
    ? {
        define: {
          "process.env.ARIAKIT_TEST_LOADER": JSON.stringify(testLoader),
        },
      }
    : {}),
  test: {
    watch: false,
    testTimeout: 10_000,
    ...(testLoader
      ? {
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        }
      : { environment }),
    setupFiles: [join(rootDir, "vitest.setup.ts")],
    exclude: testExcludes,
    include: testIncludes,
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
