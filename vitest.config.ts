import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import { globSync } from "glob";
import { version as reactVersion } from "react";
import reactForwardRef from "rolldown-plugin-react-forward-ref";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source.ts";

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
    `app/src/{recipes,component-docs,sandbox}/**/index.${framework}.tsx`,
    { cwd: rootDir },
  );
  const previewTests = entryFiles.flatMap((file) => {
    const dir = dirname(file);
    return [`${dir}/test.{ts,tsx}`, `${dir}/${framework}.test.{ts,tsx}`];
  });
  // The first glob covers framework packages except explicit DOM overrides. The
  // second picks up framework-marked test files in any other package, like
  // ariakit-test.
  return [
    `packages/ariakit-${framework}*/src/**/{test,!(*.dom).test}.{ts,tsx}`,
    `packages/*/src/**/*${framework}.test.{ts,tsx}`,
    ...previewTests,
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

const isReact18 = reactVersion.startsWith("18.");

// Tests of recipes that require React 19, such as through React Router 8. The
// React 18 suite skips them.
const react19Tests = ["app/src/recipes/navigation/**"];

function getReactTestPatterns() {
  const { include, exclude } = getProjectTestPatterns("react");
  if (!isReact18) return { include, exclude };
  return { include, exclude: [...exclude, ...react19Tests] };
}

export default defineConfig({
  root: rootDir,
  test: {
    watch: false,
    testTimeout: 10_000,
    environmentOptions: {
      happyDOM: {
        settings: {
          // Tests use same-origin frames; happy-dom v21 disables their loading.
          // https://github.com/capricorn86/happy-dom/releases/tag/v21.0.0
          enableIframePageLoading: true,
        },
      },
    },
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
        plugins: [
          sourcePlugin([
            join(rootDir, "app/src/recipes/"),
            join(rootDir, "app/src/component-docs/"),
          ]),
        ],
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
        plugins: [
          isReact18 &&
            reactForwardRef({
              include: "packages/ariakit-ui/src/components/**/*.react.tsx",
              elementFactories: [
                {
                  source: "../react-utils/create-render.react.ts",
                  imported: "createRender",
                },
                {
                  source: "../react-utils/create-render.react.ts",
                  imported: "createOptionalRender",
                },
              ],
            }),
          reactPlugin(),
        ],
        test: {
          name: "react",
          environment: "happy-dom",
          ...getReactTestPatterns(),
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
