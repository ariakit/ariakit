import { defineConfig, devices } from "@playwright/test";

if (process.argv.includes("--headed")) {
  process.env.PWHEADED = "true";
}

const CI = !!process.env.CI;
const HEADED = process.env.PWHEADED === "true";

// Workaround: Playwright 1.59 syncs navigator.platform with the user agent,
// causing "Win32" on macOS (since Desktop Chrome has a Windows UA). This breaks
// modifier-key detection (Meta vs Control). Remove once resolved upstream.
// https://github.com/microsoft/playwright/issues/40009
process.env.PLAYWRIGHT_NO_UA_PLATFORM = "1";

export default defineConfig({
  fullyParallel: !HEADED,
  ignoreSnapshots: HEADED,
  workers: HEADED ? 1 : CI ? "100%" : "80%",
  forbidOnly: CI,
  reportSlowTests: null,
  reporter: CI ? [["github"], ["dot"]] : [["list"]],
  retries: 1,
  testDir: "tests",
  webServer: {
    command: "pnpm start",
    reuseExistingServer: !CI,
    stdout: "ignore",
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
      name: "mobile",
      testMatch: /header/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: "plus",
      testMatch: /ariakit-plus/,
      retries: CI ? 3 : 1,
      use: devices["Desktop Chrome"],
    },
  ],
});
