import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";

function testMatchersFor(...kinds: string[]): RegExp[] {
  return kinds.flatMap((kind) => [
    new RegExp(`\\/test[^/]*-${kind}`),
    new RegExp(`\\/tests\\/[^/]*-${kind}`),
  ]);
}

export default defineConfig({
  fullyParallel: !HEADED,
  ignoreSnapshots: HEADED,
  workers: HEADED ? 1 : CI ? "100%" : "80%",
  forbidOnly: CI,
  reportSlowTests: null,
  reporter: CI ? [["github"], ["dot"]] : [["list"]],
  retries: 1,
  testIgnore: ["site/**"],
  webServer: {
    command: "npm start",
    reuseExistingServer: !CI,
    stdout: CI ? "pipe" : "ignore",
    port: 3000,
  },
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },
  use: {
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    launchOptions: {
      slowMo: HEADED ? 150 : undefined,
    },
  },
  projects: [
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
    {
      name: "plus",
      testMatch: [/website\/tests\/ariakit-plus/],
      retries: CI ? 3 : 1,
      use: devices["Desktop Chrome"],
    },
  ],
});
