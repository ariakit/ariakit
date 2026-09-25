import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { measureEnvironment } from "@visonaut/playwright/ci";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

// Playwright waits for document.fonts.ready before each screenshot, and Firefox
// can leave that promise pending after a navigation. visual() waits for the
// font faces themselves instead.
// https://github.com/microsoft/playwright/issues/35200#issuecomment-2726751684
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY = "1";

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";
const slowMo = HEADED ? 150 : undefined;
const PERF = process.env.PERF_TEST === "true";
const port = Number(process.env.APP_PORT) || 4321;
const nextjsPort = Number(process.env.NEXTJS_PORT) || 3000;
// In CI, pin workerd inspectors outside the ephemeral port range so another
// process cannot claim a preselected port before workerd binds it. Keep local
// ports dynamic so concurrent worktrees do not collide.
const inspectorPort = Number(process.env.APP_INSPECTOR_PORT) || (CI ? 9339 : 0);
const nextjsInspectorPort =
  Number(process.env.NEXTJS_INSPECTOR_PORT) || (CI ? 9340 : 0);
const visualShard = CI ? process.env.VISONAUT_SHARD : undefined;
if (visualShard && visualShard !== "linux" && visualShard !== "safari") {
  throw new Error(`Unknown Visonaut shard: ${visualShard}`);
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for Visonaut capture`);
  return value;
}

const visualProjects =
  visualShard === "linux" ? ["chrome", "firefox"] : ["safari"];
const captureDirectory = visualShard
  ? path.join(requiredEnv("RUNNER_TEMP"), `visonaut-${visualShard}`)
  : undefined;
const captureEnvironment = captureDirectory
  ? await measureEnvironment({
      appPackageFile: path.join(process.cwd(), "package.json"),
      applicationFontPackage: "@fontsource-variable/inter",
      comparisonPolicyDigest: requiredEnv("VISONAUT_COMPARISON_POLICY_DIGEST"),
      comparisonEngineVersion: "rgba-visible-1",
      outputDirectory: captureDirectory,
    })
  : undefined;
const visualMetadata = captureEnvironment
  ? { visonaut: { profile: captureEnvironment.profile } }
  : undefined;

function inspectorPortArg(port: number) {
  if (!port) return "";
  return ` --inspector-port ${port}`;
}

function testMatchersFor(...kinds: string[]): RegExp[] {
  return kinds.flatMap((kind) => [
    new RegExp(`\\/test[^/]*-${kind}`),
    new RegExp(`\\/tests\\/[^/]*-${kind}`),
  ]);
}

export default defineConfig({
  fullyParallel: !HEADED && !PERF,
  workers: HEADED || PERF ? 1 : CI ? "100%" : "80%",
  forbidOnly: CI,
  reportSlowTests: null,
  reporter: visualShard
    ? [
        ["github"],
        ["dot"],
        [
          "@visonaut/playwright/reporter",
          {
            outputFile: path.join(captureDirectory!, "manifest.json"),
            run: {
              repository: requiredEnv("GITHUB_REPOSITORY"),
              repositoryId: requiredEnv("GITHUB_REPOSITORY_ID"),
              workflowRunId: requiredEnv("GITHUB_RUN_ID"),
              workflowAttempt: Number(requiredEnv("GITHUB_RUN_ATTEMPT")),
              testedSha: requiredEnv("GITHUB_SHA"),
              planDigest: requiredEnv("VISONAUT_PACKAGE_SHA256"),
            },
            shard: {
              key: visualShard,
              jobId: "1",
              sourceAttempt: Number(requiredEnv("GITHUB_RUN_ATTEMPT")),
            },
            discovery: {
              executorDigest: requiredEnv("VISONAUT_PACKAGE_SHA256"),
              repositoryRoot: path.resolve(process.cwd(), ".."),
              expectedProjects: visualProjects,
              expectedInvocation: [
                "--project",
                ...visualProjects,
                "--grep",
                "@visual",
                "--output",
                "test-results/test-visual",
              ],
            },
          },
        ],
      ]
    : CI
      ? [["github"], ["dot"]]
      : [["list"]],
  retries: 1,
  testDir: "src",
  snapshotPathTemplate: "{testDir}/{testFileDir}/__snapshots__/{arg}{ext}",
  webServer: [
    {
      command: `pnpm run preview --port ${port}`,
      env: {
        APP_INSPECTOR_PORT: String(inspectorPort),
        CLOUDFLARE_INCLUDE_PROCESS_ENV: "true",
        NEXTJS_PORT: String(nextjsPort),
      },
      reuseExistingServer: !CI,
      stdout: "ignore",
      port,
    },
    {
      command: `pnpm -F nextjs exec opennextjs-cloudflare preview --port ${nextjsPort}${inspectorPortArg(nextjsInspectorPort)}`,
      reuseExistingServer: !CI,
      stdout: "ignore",
      port: nextjsPort,
    },
  ],
  use: {
    baseURL: `http://localhost:${port}`,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    launchOptions: {
      slowMo,
    },
  },
  // The trusted reporter checks the configured project list, not only the
  // projects selected by Playwright's command-line flags.
  projects: PERF
    ? [
        {
          name: "perf",
          testMatch: [/\/perf[^/]*-chrome/, /\/perfs\/[^/]*-chrome/],
          use: {
            ...devices["Desktop Chrome"],
            launchOptions: {
              args: ["--enable-precise-memory-info"],
            },
            // Fail a wedged navigation fast instead of letting it consume the
            // whole test budget; healthy CI page loads finish in a few seconds.
            // Iteration contexts bound their navigations the same way in
            // ariakit-scripts perf.ts.
            navigationTimeout: 30_000,
            // Tracing a retried attempt would add overhead to the retried
            // measurement and distort its metrics.
            trace: "off",
          },
          // One fresh-worker retry recovers a wedged browser. Failed attempts
          // write no results, so partial measurements cannot be double-counted.
          retries: 1,
          // Script-profile tests do over 100s of real work on slow runners.
          // This is headroom over observed durations, not a hang allowance:
          // navigations are bounded above. CI perf runs pass the same value via
          // --timeout in perf.yml (PLAYWRIGHT_TEST_TIMEOUT), which takes
          // precedence, so keep the two in sync.
          timeout: 180_000,
        },
      ]
    : [
        {
          name: "chrome",
          metadata: visualMetadata,
          testMatch: testMatchersFor("chrome", "browser"),
          use: {
            ...devices["Desktop Chrome"],
            // Headless Shell can complete a browser-created new-tab navigation
            // without Playwright initializing its Page.
            channel: "chromium",
          },
        },
        {
          name: "firefox",
          metadata: visualMetadata,
          testMatch: testMatchersFor("firefox", "browser"),
          retries: CI ? 2 : 1,
          use: devices["Desktop Firefox"],
        },
        {
          name: "safari",
          metadata: visualMetadata,
          testMatch: testMatchersFor("safari", "browser"),
          use: {
            ...devices["Desktop Safari"],
            launchOptions: {
              slowMo,
              // Healthy macOS CI launches complete initial page setup within 24
              // seconds; fail a wedged WebKit process without waiting for
              // Playwright's three-minute default.
              timeout: CI ? 45_000 : undefined,
            },
          },
          retries: CI ? 3 : 1,
        },
        {
          name: "ios",
          testMatch: testMatchersFor("ios", "mobile"),
          use: devices["iPhone 13 Pro Max"],
        },
        {
          name: "android",
          testMatch: testMatchersFor("android", "mobile"),
          use: devices["Pixel 5"],
        },
      ].filter(
        (project) => !visualShard || visualProjects.includes(project.name),
      ),
});
