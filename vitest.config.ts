import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { globSync } from "glob";
import type { PluginOption } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";
import { getTestLoader } from "./test-loader.ts";
import type { AllowedTestLoader } from "./test-loader.ts";

const rootDir = process.cwd();

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
  // Loader-specific tests (`*react.test.*`/`*solid.test.*`) run via test-react
  // and test-solid. Their names also match the generic `*test.*` include above,
  // so keep them out of the default (no-loader) suite explicitly.
  "**/*react.test.{ts,tsx}",
  "**/*solid.test.{ts,tsx}",
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
    return [`${dir}/test.{ts,tsx}`, `${dir}/${loader}.test.{ts,tsx}`];
  });
  // The first glob covers the ariakit-${loader}* packages, whose tests are
  // all loader-specific. The second picks up loader-marked
  // `*${loader}.test.{ts,tsx}` files in any other package, like ariakit-test.
  return [
    `packages/ariakit-${loader}*/src/**/*test.{ts,tsx}`,
    `packages/*/src/**/*${loader}.test.{ts,tsx}`,
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

// All suites default to happy-dom — it's ~2x faster than jsdom for the
// @ariakit/test simulation layer and provides the DOM every suite needs.
// Individual tests that hit a deterministic happy-dom divergence opt into jsdom
// with a `// @vitest-environment jsdom` comment. test-react18 opts the whole
// suite out via ARIAKIT_TEST_ENV=jsdom: React 18's scheduler is more sensitive
// to happy-dom's faster timer cadence and flakes some dialog-dismissal tests.
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
  test: {
    watch: false,
    testTimeout: 10_000,
    environment,
    // happy-dom's faster timer cadence occasionally starves React's settle
    // window between simulated interactions on slow CI, causing rare,
    // non-deterministic failures. A single retry — scoped to the framework
    // render suites, where the @ariakit/test simulation runs — absorbs the
    // occasional one-off; a test that fails twice still fails, so a genuine
    // regression isn't masked. The core and jsdom suites don't retry.
    retry: testLoader && environment === "happy-dom" ? 1 : 0,
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
