import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { globSync } from "glob";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";

const rootDir = process.cwd();

const testIncludes = ["**/*test.{ts,tsx}"];

const frameworks = ["react", "solid"] as const;

type Framework = (typeof frameworks)[number];

const nonDomPackages = [
  "scripts",
  ...frameworks.map((framework) => `${framework}*`),
];

function getFrameworkTestIncludes(framework: Framework) {
  const entryFiles = globSync(
    `app/src/{examples,sandbox}/**/index.${framework}.tsx`,
    { cwd: rootDir },
  );
  const exampleTests = entryFiles.flatMap((file) => {
    const dir = dirname(file);
    return [`${dir}/test.{ts,tsx}`, `${dir}/${framework}.test.{ts,tsx}`];
  });
  // The first glob covers framework packages except explicit DOM overrides.
  // The second picks up framework-marked test files in any other package,
  // like ariakit-test.
  return [
    `packages/ariakit-${framework}*/src/**/{test,!(*.dom).test}.{ts,tsx}`,
    `packages/*/src/**/*${framework}.test.{ts,tsx}`,
    ...exampleTests,
  ];
}

const domTestOverrides = ["**/*.dom.test.{ts,tsx}"];

const projectTestClaims = {
  dom: [
    ...domTestOverrides,
    `packages/ariakit-!(${nonDomPackages.join("|")})/src/**/*test.{ts,tsx}`,
  ],
  react: getFrameworkTestIncludes("react"),
  solid: getFrameworkTestIncludes("solid"),
};

type TestProject = "node" | keyof typeof projectTestClaims;

function getProjectTestExcludes(project: TestProject) {
  if (project === "node") {
    return Object.values(projectTestClaims).flat();
  }
  if (project === "dom") {
    return frameworks.flatMap((framework) => projectTestClaims[framework]);
  }
  return domTestOverrides;
}

function getProjectTestPatterns(project: TestProject) {
  const include =
    project === "node" ? testIncludes : projectTestClaims[project];
  const exclude = getProjectTestExcludes(project);
  return { exclude, include };
}

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
          ...getProjectTestPatterns("node"),
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "happy-dom",
          ...getProjectTestPatterns("dom"),
        },
      },
      {
        extends: true,
        plugins: [reactPlugin()],
        test: {
          name: "react",
          environment: "happy-dom",
          ...getProjectTestPatterns("react"),
          setupFiles: [join(rootDir, "vitest.setup.react.ts")],
        },
      },
      {
        extends: true,
        plugins: [solidPlugin()],
        test: {
          name: "solid",
          environment: "happy-dom",
          ...getProjectTestPatterns("solid"),
          setupFiles: [join(rootDir, "vitest.setup.solid.ts")],
        },
      },
    ],
  },
});
