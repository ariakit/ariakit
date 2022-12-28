import { LaunchOptions, PlaywrightTestConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const headed = process.env.PWHEADED === "true";
const launchOptions: LaunchOptions = headed ? { slowMo: 150 } : {};

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm start",
    reuseExistingServer: !process.env.CI,
    port: 3000,
  },
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: headed ? 1 : 0.05,
    },
  },
  use: {
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  reporter: process.env.CI ? [["github"], ["dot"]] : [["list"]],
  retries: 1,
  projects: [
    {
      name: "chrome",
      testMatch: [/\/test[^\/]*\-chrome/, /\/test[^\/]*\-browser/],
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "firefox",
      testMatch: [/\/test[^\/]*\-firefox/, /\/test[^\/]*\-browser/],
      retries: 2,
      use: { ...devices["Desktop Firefox"], launchOptions },
    },
    {
      name: "safari",
      testMatch: [/\/test[^\/]*\-safari/, /\/test[^\/]*\-browser/],
      use: { ...devices["Desktop Safari"], launchOptions },
    },
  ],
};

export default config;
