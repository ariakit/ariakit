import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { globSync } from "glob";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";

const rootDir = process.cwd();

const testIncludes = ["**/*test.{ts,tsx}"];

const domTestIncludes = [
  "app/src/lib/stackblitz.test.{ts,tsx}",
  "packages/ariakit-components/src/{collection,combobox,form,popover,select,tab}/**/*test.{ts,tsx}",
  "packages/ariakit-test/src/**/*test.{ts,tsx}",
  "packages/ariakit-utils/src/{dom,events,focus}.test.{ts,tsx}",
];

const frameworks = ["react", "solid"] as const;

type Framework = (typeof frameworks)[number];

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

const frameworkTestExcludes = frameworks.flatMap((framework) => [
  `packages/ariakit-${framework}*/src/**/*test.{ts,tsx}`,
  `**/*${framework}.test.{ts,tsx}`,
]);

const nodeTestExcludes = [
  ...domTestIncludes,
  ...frameworkTestExcludes,
  "app/src/{examples,sandbox}/**/test.{ts,tsx}",
];

const testExcludes = [...configDefaults.exclude, ".claude/**"];

export default defineConfig({
  root: rootDir,
  test: {
    watch: false,
    testTimeout: 10_000,
    setupFiles: [join(rootDir, "vitest.setup.ts")],
    exclude: testExcludes,
    sequence: {
      hooks: "parallel",
    },
    coverage: {
      include: ["packages"],
    },
    // The DOM projects run on happy-dom because it is ~2x faster than jsdom
    // for the @ariakit/test simulation layer. The shims in @ariakit/test
    // normalize its spec divergences, including React 18 event priority (see
    // packages/ariakit-test/src/shims.ts and the window.event shim in
    // dispatch.ts). Individual tests can still opt into another installed
    // environment with a `// @vitest-environment <name>` file comment.
    projects: [
      {
        extends: true,
        plugins: [sourcePlugin(join(rootDir, "app/src/examples/"))],
        test: {
          name: "node",
          environment: "node",
          exclude: nodeTestExcludes,
          include: testIncludes,
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "happy-dom",
          exclude: frameworkTestExcludes,
          include: domTestIncludes,
        },
      },
      {
        extends: true,
        plugins: [reactPlugin()],
        test: {
          name: "react",
          environment: "happy-dom",
          include: getFrameworkTestIncludes("react"),
          setupFiles: [join(rootDir, "vitest.setup.react.ts")],
        },
      },
      {
        extends: true,
        plugins: [solidPlugin()],
        test: {
          name: "solid",
          environment: "happy-dom",
          include: getFrameworkTestIncludes("solid"),
          setupFiles: [join(rootDir, "vitest.setup.solid.ts")],
        },
      },
    ],
  },
});
