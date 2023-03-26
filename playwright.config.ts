import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const headed = process.env.PWHEADED === "true";
const ci = process.env.CI;

export default defineConfig({
  fullyParallel: !headed,
  ignoreSnapshots: headed,
  workers: headed ? 1 : "50%",
  forbidOnly: !!ci,
  reportSlowTests: null,
  reporter: ci ? [["github"], ["dot"]] : [["list"]],
  timeout: ci ? 30000 : 8000,
  retries: 1,
  webServer: {
    command: "npm start",
    reuseExistingServer: !ci,
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
      slowMo: headed ? 150 : undefined,
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
