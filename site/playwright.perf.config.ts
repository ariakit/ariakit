import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";
const port = Number(process.env.SITE_PORT) || 4321;

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  forbidOnly: CI,
  reportSlowTests: null,
  reporter: CI ? [["github"], ["dot"]] : [["list"]],
  retries: 0,
  testDir: "src",
  testMatch: "**/perf-chrome.ts",
  webServer: {
    command: `pnpm run preview-lite --log-level warn --port ${port}`,
    reuseExistingServer: !CI,
    stdout: CI ? "pipe" : "ignore",
    port,
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
      use: devices["Desktop Chrome"],
    },
  ],
});
