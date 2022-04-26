import { PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testMatch: "e2e*.ts",
  webServer: {
    command: "npm run dev",
    reuseExistingServer: true,
    port: 3000,
  },
  projects: [
    {
      name: "chrome",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
};

export default config;
