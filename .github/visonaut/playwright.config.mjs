import { readFile } from "node:fs/promises";
import path from "node:path";
import { createTrustedPlaywrightConfig } from "@visonaut/playwright/ci";
import { projects } from "./executor.mjs";

const directory = import.meta.dirname;
const repositoryRoot = process.env.GITHUB_WORKSPACE;
const planFile = process.env.VISONAUT_TRUSTED_PLAN;
const browserName = process.env.VISONAUT_BROWSER;
const project = projects[browserName];
if (!repositoryRoot || !planFile || !project) {
  throw new Error(
    "A GitHub workspace, trusted plan, and fixed browser shard are required",
  );
}
const settings = JSON.parse(
  await readFile(new URL("settings.json", import.meta.url), "utf8"),
);
const app = path.join(repositoryRoot, "app");

export default await createTrustedPlaywrightConfig({
  directory,
  planFile,
  repositoryRoot,
  browserName,
  project,
  settings,
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
});
