import { LaunchOptions, PlaywrightTestConfig, devices } from "@playwright/test";

process.env.PLAYWRIGHT_EXPERIMENTAL_FEATURES = "1";

const headed = process.env.HEADED === "true";

const launchOptions: LaunchOptions = {
  headless: !headed,
  slowMo: headed ? 100 : undefined,
};

const config: PlaywrightTestConfig = {
  webServer: {
    command: "npm start",
    reuseExistingServer: !process.env.CI,
    port: 3000,
  },
  expect: {
    toMatchSnapshot: {
      maxDiffPixelRatio: headed ? 1 : 0.025,
    },
  },
  use: {
    screenshot: "only-on-failure",
  },
  reporter: process.env.CI ? [["github"], ["dot"]] : "list",
  projects: [
    {
      name: "chrome",
      testMatch: "test-chrome.ts",
      retries: 1,
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "safari",
      testMatch: "test-safari.ts",
      use: { ...devices["Desktop Safari"], launchOptions },
    },
  ],
};

export default config;
