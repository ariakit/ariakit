import { dirname, join } from "node:path";
import { ariakitBrowserCommands } from "@ariakit/test/vitest-config";
import tailwindcss from "@tailwindcss/vite";
import reactPlugin from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { globSync } from "glob";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";

const rootDir = process.cwd();

const testIncludes = ["**/*test.{ts,tsx}"];

const frameworks = ["react", "solid"] as const;

type Framework = (typeof frameworks)[number];

function getFrameworkExampleTestIncludes(framework: Framework) {
  const entryFiles = globSync(
    `app/src/{examples,sandbox}/**/index.${framework}.tsx`,
  );
  return entryFiles.flatMap((file) => {
    const dir = dirname(file);
    return [`${dir}/test.{ts,tsx}`, `${dir}/${framework}.test.{ts,tsx}`];
  });
}

const nonDomPackages = [
  "scripts",
  ...frameworks.map((framework) => `${framework}*`),
];

function getFrameworkTestIncludes(framework: Framework) {
  const exampleTests = getFrameworkExampleTestIncludes(framework);
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

function getProjectTestExcludes(project: TestProject, browser = false) {
  if (project === "node") {
    return Object.values(projectTestClaims).flat();
  }
  if (project === "dom") {
    return [
      ...frameworks.flatMap((framework) => projectTestClaims[framework]),
      "packages/ariakit-test/src/vitest.ts",
      ...(browser ? [] : ["packages/ariakit-test/src/vitest.browser.test.ts"]),
    ];
  }
  return domTestOverrides;
}

function getProjectTestPatterns(project: TestProject, browser = false) {
  const include =
    project === "node" ? testIncludes : projectTestClaims[project];
  const exclude = getProjectTestExcludes(project, browser);
  return { exclude, include };
}

const testExcludes = [...configDefaults.exclude, ".claude/**"];

const defaultSetupFile = join(rootDir, "vitest.setup.ts");
const browserSetupFile = join(rootDir, "vitest.setup.browser.ts");

const browserTargets = {
  chrome: {
    browser: "chromium" as const,
    provider: playwright({ launchOptions: { channel: "chromium" } }),
  },
  firefox: {
    browser: "firefox" as const,
    provider: playwright(),
  },
  safari: {
    browser: "webkit" as const,
    provider: playwright(),
  },
};

type BrowserName = keyof typeof browserTargets;

function getBrowserConfig(browserName: BrowserName) {
  const { browser, provider } = browserTargets[browserName];
  return {
    enabled: true as const,
    headless: true as const,
    provider,
    instances: [{ browser }],
    screenshotDirectory: "./test-results/vitest-browser",
    viewport: { width: 1280, height: 720 },
    commands: ariakitBrowserCommands,
  };
}

function getBrowserProjects(browserName: BrowserName) {
  const commonSetupFiles = [defaultSetupFile, browserSetupFile];
  return [
    {
      extends: true as const,
      plugins: [tailwindcss()],
      test: {
        name: `dom-${browserName}`,
        fileParallelism: false,
        retry: process.env.CI ? 2 : 0,
        sequence: { hooks: "list" as const },
        ...getProjectTestPatterns("dom", true),
        setupFiles: commonSetupFiles,
        browser: getBrowserConfig(browserName),
      },
    },
    {
      extends: true as const,
      plugins: [tailwindcss(), reactPlugin()],
      test: {
        name: `react-${browserName}`,
        fileParallelism: false,
        retry: process.env.CI ? 2 : 0,
        sequence: { hooks: "list" as const },
        ...getProjectTestPatterns("react", true),
        setupFiles: [
          ...commonSetupFiles,
          join(rootDir, "vitest.setup.react.ts"),
        ],
        browser: getBrowserConfig(browserName),
      },
    },
    {
      extends: true as const,
      plugins: [tailwindcss(), solidPlugin()],
      test: {
        name: `solid-${browserName}`,
        fileParallelism: false,
        retry: process.env.CI ? 2 : 0,
        sequence: { hooks: "list" as const },
        ...getProjectTestPatterns("solid", true),
        setupFiles: [
          ...commonSetupFiles,
          join(rootDir, "vitest.setup.solid.ts"),
        ],
        browser: getBrowserConfig(browserName),
      },
    },
  ];
}

export default defineConfig({
  root: rootDir,
  oxc: { target: "es2022" },
  optimizeDeps: {
    entries: ["app/src/{examples,sandbox}/**/index.{react,solid}.tsx"],
    exclude: ["vitest-fail-on-console"],
    include: [
      "@testing-library/jest-dom/matchers",
      "@testing-library/jest-dom/vitest",
    ],
  },
  test: {
    attachmentsDir: "./test-results/vitest-attachments",
    watch: false,
    testTimeout: 10_000,
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
          setupFiles: [defaultSetupFile],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "happy-dom",
          ...getProjectTestPatterns("dom"),
          setupFiles: [defaultSetupFile],
        },
      },
      {
        extends: true,
        plugins: [reactPlugin()],
        test: {
          name: "react",
          environment: "happy-dom",
          ...getProjectTestPatterns("react"),
          setupFiles: [
            defaultSetupFile,
            join(rootDir, "vitest.setup.react.ts"),
          ],
        },
      },
      {
        extends: true,
        plugins: [solidPlugin()],
        test: {
          name: "solid",
          environment: "happy-dom",
          ...getProjectTestPatterns("solid"),
          setupFiles: [
            defaultSetupFile,
            join(rootDir, "vitest.setup.solid.ts"),
          ],
        },
      },
      ...getBrowserProjects("chrome"),
      ...getBrowserProjects("firefox"),
      ...getBrowserProjects("safari"),
    ],
  },
});
