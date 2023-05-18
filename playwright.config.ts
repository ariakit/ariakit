import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";

export default defineConfig({
  fullyParallel: !HEADED,
  ignoreSnapshots: HEADED,
  workers: HEADED ? 1 : CI ? "100%" : "80%",
  forbidOnly: CI,
  reportSlowTests: null,
  reporter: CI ? [["github"], ["dot"]] : [["list"]],
  retries: 1,
  webServer: {
    command: "npm start",
    reuseExistingServer: !CI,
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
      testMatch: [/\/test[^\/]*\-chrome/, /\/test[^\/]*\-browser/],
      use: devices["Desktop Chrome"],
    },
    {
      name: "firefox",
      testMatch: [/\/test[^\/]*\-firefox/, /\/test[^\/]*\-browser/],
      retries: CI ? 2 : 1,
      use: devices["Desktop Firefox"],
    },
    {
      name: "safari",
      testMatch: [/\/test[^\/]*\-safari/, /\/test[^\/]*\-browser/],
      use: devices["Desktop Safari"],
    },
    {
      name: "ios",
      testMatch: [/\/test[^\/]*\-ios/, /\/test[^\/]*\-mobile/],
      use: devices["iPhone 13 Pro Max"],
    },
    {
      name: "android",
      testMatch: [/\/test[^\/]*\-android/, /\/test[^\/]*\-mobile/],
      use: devices["Pixel 5"],
    },
    {
      name: "vo",
      testMatch: [/\/test[^\/]*\-vo/],
      retries: CI ? 1 : 0,
      timeout: 3 * 60 * 1000, // 3 minutes
      use: { ...devices["Desktop Safari"], headless: false },
    },
  ],
});
