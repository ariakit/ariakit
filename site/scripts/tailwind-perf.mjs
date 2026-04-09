import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const browserCachePath = fileURLToPath(
  new URL("../../.playwright-browsers", import.meta.url),
);
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function getPlaywrightArgs(mode) {
  if (mode === "install") {
    return ["exec", "playwright", "install", "chromium"];
  }
  if (mode === "test") {
    return [
      "exec",
      "playwright",
      "test",
      "--config=playwright.perf.config.ts",
      "--project=chrome",
      "--workers=1",
      "--retries=0",
      "--reporter=html",
    ];
  }
  throw new Error(`Unknown tailwind perf mode: ${mode}`);
}

async function main() {
  const mode = process.argv[2];
  if (mode !== "install" && mode !== "test") {
    throw new Error("Usage: node scripts/tailwind-perf.mjs <install|test>");
  }

  const child = spawn(pnpmCommand, getPlaywrightArgs(mode), {
    cwd: siteRoot,
    env: {
      ...process.env,
      PLAYWRIGHT_BROWSERS_PATH: browserCachePath,
    },
    stdio: "inherit",
  });

  const exitCode = await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => {
      resolve(code ?? 1);
    });
  });

  process.exit(exitCode);
}

await main();
