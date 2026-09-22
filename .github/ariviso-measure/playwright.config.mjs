import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { projects, collectionFor } from "../ariviso/identity.mjs";

const executor = path.resolve(import.meta.dirname, "../ariviso");
const require = createRequire(path.join(executor, "package.json"));
const { defineConfig, devices } = require("@playwright/test");
if (process.env.CI !== "true" || process.env.GITHUB_ACTIONS !== "true") {
  throw new Error("Capture measurements run only in GitHub Actions");
}
const browser = process.env.ARIVISO_BROWSER;
if (!Object.hasOwn(projects, browser)) {
  throw new Error("Unknown measurement browser");
}
const project = projects[browser];
const app = path.join(process.env.GITHUB_WORKSPACE, "app");
const output = process.env.ARIVISO_MEASUREMENT_OUTPUT;
if (!output || !path.isAbsolute(output)) {
  throw new Error("An absolute private measurement directory is required");
}
const environment = JSON.parse(
  await readFile(
    path.join(app, `.ariviso-results/environment-${browser}.json`),
    "utf8",
  ),
);
const allowed = JSON.parse(
  await readFile(path.join(executor, "environments.json"), "utf8"),
)[browser];
if (
  !environment.environmentProfiles.length ||
  environment.environmentProfiles.some(
    (entry) => !allowed.includes(entry.digest),
  )
) {
  throw new Error(
    "The measured runner profile is outside the existing allowlist",
  );
}
process.env.VISUAL_TEST = "true";
process.env.ARIVISO_CAPTURE = "true";

export default defineConfig({
  tsconfig: path.join(executor, "tsconfig.json"),
  forbidOnly: true,
  fullyParallel: true,
  workers: "100%",
  reportSlowTests: null,
  testDir: path.join(app, "src"),
  testMatch: collectionFor(browser).testMatch,
  testIgnore: [],
  grep: /@visual/,
  grepInvert: [],
  repeatEach: 1,
  retries: browser === "webkit" ? 3 : browser === "firefox" ? 2 : 1,
  outputDir: path.join(output, "test-results"),
  reporter: [
    ["blob", { outputFile: path.join(output, "all-attempts.zip") }],
    [path.join(import.meta.dirname, "reporter.mjs"), { output }],
  ],
  webServer: [
    {
      command: "pnpm run preview --port 4321",
      cwd: app,
      env: {
        APP_INSPECTOR_PORT: "9339",
        CLOUDFLARE_INCLUDE_PROCESS_ENV: "true",
        NEXTJS_PORT: "3000",
      },
      reuseExistingServer: false,
      stdout: "ignore",
      port: 4321,
    },
    {
      command:
        "pnpm -F nextjs exec opennextjs-cloudflare preview --port 3000 --inspector-port 9340",
      cwd: app,
      reuseExistingServer: false,
      stdout: "ignore",
      port: 3000,
    },
  ],
  projects: [
    {
      name: project.name,
      metadata: { ariviso: { profile: environment.profile } },
      use: {
        ...devices[project.device],
        viewport: { width: 1280, height: 800 },
        baseURL: "http://localhost:4321",
        locale: "en-US",
        timezoneId: "UTC",
        reducedMotion: "reduce",
        screenshot: "only-on-failure",
        trace: "on-first-retry",
        ...(browser === "chromium" ? { channel: "chromium" } : {}),
        launchOptions: { timeout: 45_000 },
      },
    },
  ],
});
