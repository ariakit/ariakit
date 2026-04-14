import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";
const PERF = process.env.PERF_TEST === "true";
const port = Number(process.env.SITE_PORT) || 4321;
const nextjsPort = Number(process.env.NEXTJS_PORT) || 3000;

function testMatchersFor(...kinds: string[]): RegExp[] {
  return kinds.flatMap((kind) => [
    new RegExp(`\\/test[^/]*-${kind}`),
    new RegExp(`\\/tests\\/[^/]*-${kind}`),
  ]);
}

export default defineConfig({
  fullyParallel: !HEADED,
  workers: HEADED ? 1 : CI ? "100%" : "80%",
  forbidOnly: CI,
  reportSlowTests: null,
  reporter: CI ? [["github"], ["dot"]] : [["list"]],
  retries: 1,
  testDir: "src",
  webServer: [
    {
      command: `pnpm run preview-lite --log-level warn --port ${port} --var NEXTJS_PORT:${nextjsPort}`,
      reuseExistingServer: !CI,
      stdout: CI ? "pipe" : "ignore",
      port,
    },
    {
      command: `pnpm -F nextjs exec opennextjs-cloudflare preview --port ${nextjsPort}`,
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
          },
          retries: 0,
          timeout: 120_000,
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
          use: devices["Desktop Safari"],
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
