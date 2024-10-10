import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  workers: "80%",
  retries: 1,
  reportSlowTests: null,
  webServer: {
    command: "npm start",
    reuseExistingServer: true,
    stdout: "ignore",
    port: 3000,
  },
  projects: [
    {
      name: "generate-images",
      testMatch: [/\/generate-images/],
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 2,
      },
    },
  ],
});
