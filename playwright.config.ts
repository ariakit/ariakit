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
      retries: 2,
      use: devices["Desktop Firefox"],
    },
    {
      name: "safari",
      testMatch: [/\/test[^\/]*\-safari/, /\/test[^\/]*\-browser/],
      use: devices["Desktop Safari"],
    },
  ],
});
