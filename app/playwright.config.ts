import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";
const PERF = process.env.PERF_TEST === "true";
const port = Number(process.env.APP_PORT) || 4321;
const nextjsPort = Number(process.env.NEXTJS_PORT) || 3000;
// Pin the workerd inspector ports outside the OS ephemeral range in CI.
// When unset, the preview server preselects a random free high port and workerd binds
// it later, so another process (such as a browser connection claiming it as
// an outbound source port) can take it in between, which kills the server
// with a fatal "Address already in use" on startup. Only pin by default in
// CI, where each job owns the runner: fixed local defaults would make
// concurrent sessions (such as per-worktree servers on overridden app ports)
// collide deterministically. Zero means "let the preview server pick".
const inspectorPort = Number(process.env.APP_INSPECTOR_PORT) || (CI ? 9339 : 0);
const nextjsInspectorPort =
  Number(process.env.NEXTJS_INSPECTOR_PORT) || (CI ? 9340 : 0);

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
  reporter: CI ? [["github"], ["dot"]] : [["list"]],
  retries: 1,
  testDir: "src",
  snapshotPathTemplate: "{testDir}/{testFileDir}/__snapshots__/{arg}{ext}",
  webServer: [
    {
      command: `pnpm run preview-lite --port ${port}`,
      env: {
        APP_INSPECTOR_PORT: String(inspectorPort),
        CLOUDFLARE_INCLUDE_PROCESS_ENV: "true",
        NEXTJS_PORT: String(nextjsPort),
      },
      reuseExistingServer: !CI,
      stdout: CI ? "pipe" : "ignore",
      port,
    },
    {
      command: `pnpm -F nextjs exec opennextjs-cloudflare preview --port ${nextjsPort}${inspectorPortArg(nextjsInspectorPort)}`,
      reuseExistingServer: !CI,
      stdout: CI ? "pipe" : "ignore",
      port: nextjsPort,
    },
  ],
  use: {
    baseURL: `http://localhost:${port}`,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    launchOptions: {
      slowMo: HEADED ? 150 : undefined,
    },
  },
  expect: {
    toHaveScreenshot: {
      threshold: 0,
      maxDiffPixelRatio: 0.0005,
      pathTemplate: "{testDir}/{testFileDir}/__screenshots__/{arg}{ext}",
    },
  },
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
            // Fail a wedged navigation fast instead of letting it consume
            // the whole test budget; healthy CI page loads finish in a few
            // seconds. Iteration contexts bound their navigations the same
            // way in ariakit-scripts perf.ts.
            navigationTimeout: 30_000,
            // Tracing a retried attempt would add overhead to the retried
            // measurement and distort its metrics.
            trace: "off",
          },
          // Failed attempts record no results (the perf fixture only
          // appends results for passing attempts) and results land in
          // per-worker files, so retrying in a fresh worker (new browser)
          // cannot double-count. It recovers the run when the previous
          // worker's browser wedged mid-file. Same value as the root
          // retries, but kept explicit: perf previously opted out and the
          // retry safety argument lives here.
          retries: 1,
          // Script-profile tests do over 100s of real work on slow runners.
          // This is headroom over observed durations, not a hang allowance:
          // navigations are bounded above. CI perf runs pass the same value
          // via --timeout in perf.yml (PLAYWRIGHT_TEST_TIMEOUT), which takes
          // precedence, so keep the two in sync.
          timeout: 180_000,
        },
      ]
    : [
        {
          name: "chrome",
          testMatch: testMatchersFor("chrome", "browser"),
          use: devices["Desktop Chrome"],
        },
        {
          name: "firefox",
          testMatch: testMatchersFor("firefox", "browser"),
          retries: CI ? 2 : 1,
          use: devices["Desktop Firefox"],
        },
        {
          name: "safari",
          testMatch: testMatchersFor("safari", "browser"),
          use: {
            ...devices["Desktop Safari"],
            launchOptions: {
              slowMo: HEADED ? 150 : undefined,
              // Healthy macOS CI launches complete initial page setup within
              // 24 seconds; fail a wedged WebKit process without waiting for
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
      ],
});
