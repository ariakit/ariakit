import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { projects } from "./identity.mjs";
import { createPlan } from "./plan.mjs";

if (process.env.CI !== "true" || process.env.GITHUB_ACTIONS !== "true") {
  throw new Error("Ariviso diagnostic captures run only in GitHub Actions");
}
const repositoryRoot =
  process.env.GITHUB_WORKSPACE ?? path.resolve(import.meta.dirname, "../..");
const app = path.join(repositoryRoot, "app");
const browser = process.env.ARIVISO_BROWSER;
const project = projects[browser];
if (!project) throw new Error("Unknown Ariviso browser shard");
const { plan, planDigest, settings } = await createPlan();
const shard = plan.shards.find((entry) => entry.key === browser);
const environment = JSON.parse(
  await readFile(
    path.join(app, `.ariviso-results/environment-${browser}.json`),
    "utf8",
  ),
);
const context = JSON.parse(
  await readFile(path.join(app, ".ariviso-results/context.json"), "utf8"),
);
if (
  environment.environmentProfiles.some(
    (entry) => !shard.environmentProfileDigests.includes(entry.digest),
  )
) {
  throw new Error(
    "This runner's measured environment is not registered in the trusted capture plan",
  );
}
process.env.VISUAL_TEST = "true";
process.env.ARIVISO_CAPTURE = "true";

export default defineConfig({
  tsconfig: path.join(import.meta.dirname, "tsconfig.json"),
  forbidOnly: true,
  fullyParallel: true,
  workers: "100%",
  reportSlowTests: null,
  testDir: path.join(app, "src"),
  testMatch: shard.collection.testMatch,
  testIgnore: [],
  grep: /@visual/,
  grepInvert: [],
  repeatEach: 1,
  retries: browser === "webkit" ? 3 : browser === "firefox" ? 2 : 1,
  outputDir: path.join(app, ".ariviso-test-results"),
  reporter: [
    ["github"],
    ["dot"],
    [
      path.join(
        import.meta.dirname,
        "node_modules/@ariviso/playwright/dist/reporter.js",
      ),
      {
        outputFile: path.join(app, ".ariviso-results/manifest.json"),
        repositoryRoot,
        plan,
        run: {
          repository: settings.repository,
          repositoryId: settings.repositoryId,
          workflowRunId: context.workflowRunId,
          workflowAttempt: context.workflowAttempt,
          testedSha: context.testedSha,
          planDigest,
        },
        shard: {
          key: browser,
          jobId: context.jobId,
          sourceAttempt: context.workflowAttempt,
        },
      },
    ],
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
