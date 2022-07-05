import { LaunchOptions, PlaywrightTestConfig, devices } from "@playwright/test";

process.env.PLAYWRIGHT_EXPERIMENTAL_FEATURES = "1";

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
      testMatch: ["test-chrome.ts", "test-browser.ts"],
      retries: 1,
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "firefox",
      testMatch: ["test-firefox.ts", "test-browser.ts"],
      retries: 1,
      use: { ...devices["Desktop Firefox"], launchOptions },
    },
    {
      name: "safari",
      testMatch: ["test-safari.ts", "test-browser.ts"],
      retries: 1,
      use: { ...devices["Desktop Safari"], launchOptions },
    },
  ],
};

export default config;
