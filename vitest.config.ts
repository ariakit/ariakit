import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { globSync } from "glob";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";

const rootDir = process.cwd();

const coreTestIncludes = ["**/*test.{ts,tsx}"];

const nodeTestIncludes = ["packages/ariakit-scripts/src/**/*test.{ts,tsx}"];

const coreTestExcludes = [
  ...nodeTestIncludes,
  "packages/ariakit-react*/src/**/*test.{ts,tsx}",
  "packages/ariakit-solid*/src/**/*test.{ts,tsx}",
  // Framework-specific tests run via test-react and test-solid. Their names
  // also match the generic *test.* include above, so keep them out of the core
  // project explicitly.
  "**/*react.test.{ts,tsx}",
  "**/*solid.test.{ts,tsx}",
  "app/src/{examples,sandbox}/**/test.{ts,tsx}",
];

type Framework = "react" | "solid";

function getFrameworkTestIncludes(framework: Framework) {
  const entryFiles = globSync(
    `app/src/{examples,sandbox}/**/index.${framework}.tsx`,
    { cwd: rootDir },
  );
  const exampleTests = entryFiles.flatMap((file) => {
    const dir = dirname(file);
    return [`${dir}/test.{ts,tsx}`, `${dir}/${framework}.test.{ts,tsx}`];
  });
  // The first glob covers the framework packages, whose tests are all
  // framework-specific. The second picks up framework-marked test files in
  // any other package, like ariakit-test.
  return [
    `packages/ariakit-${framework}*/src/**/*test.{ts,tsx}`,
    `packages/*/src/**/*${framework}.test.{ts,tsx}`,
    ...exampleTests,
  ];
}

const testExcludes = [...configDefaults.exclude, ".claude/**"];

const sourcePluginInstance = sourcePlugin(join(rootDir, "app/src/examples/"));

export default defineConfig({
  root: rootDir,
  plugins: [sourcePluginInstance],
  test: {
    watch: false,
    testTimeout: 10_000,
    setupFiles: [join(rootDir, "vitest.setup.ts")],
    sequence: {
      hooks: "parallel",
    },
    coverage: {
      include: ["packages"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          exclude: testExcludes,
          include: nodeTestIncludes,
        },
      },
      {
        extends: true,
        test: {
          name: "core",
          environment: "happy-dom",
          exclude: [...testExcludes, ...coreTestExcludes],
          include: coreTestIncludes,
        },
      },
      {
        extends: true,
        plugins: [reactPlugin()],
        test: {
          name: "react",
          environment: "happy-dom",
          exclude: testExcludes,
          include: getFrameworkTestIncludes("react"),
          setupFiles: [
            join(rootDir, "vitest.setup.ts"),
            join(rootDir, "vitest.react.setup.ts"),
          ],
        },
      },
      {
        extends: true,
        plugins: [solidPlugin()],
        test: {
          name: "solid",
          environment: "happy-dom",
          exclude: testExcludes,
          include: getFrameworkTestIncludes("solid"),
          setupFiles: [
            join(rootDir, "vitest.setup.ts"),
            join(rootDir, "vitest.solid.setup.ts"),
          ],
        },
      },
    ],
  },
});
