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

// sourcePlugin is typed against the app workspace's Vite copy, while Vitest
// consumes the root Vite types. The runtime plugin shape is compatible.
// TODO: Remove this cast when the app and root test stack resolve the same Vite
// peer-context type instance.
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
    // Every suite runs on happy-dom — it's ~2x faster than jsdom for the
    // @ariakit/test simulation layer and provides the DOM every suite needs,
    // including the React 18 suite (`test-react18`). happy-dom's spec
    // divergences from jsdom and real browsers are normalized by the shims in
    // `@ariakit/test` (see `packages/ariakit-test/src/shims.ts` and the
    // `window.event` shim in `dispatch.ts`, which restores React 18's
    // discrete-event priority). Individual tests can still opt into another
    // installed environment with a `// @vitest-environment <name>` comment.
    environment: "happy-dom",
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
