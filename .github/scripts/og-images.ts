import { request } from "node:http";

import { getRepositoryRoot, sleep, spawnDetached } from "./lib/workflow.ts";

function getNpmCommand(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

async function canReachOgImageApi(): Promise<boolean> {
  return await new Promise((resolve) => {
    const req = request("http://localhost:4321/og-image/api", (response) => {
      response.resume();
      resolve((response.statusCode ?? 500) < 400);
    });
    req.on("error", () => {
      resolve(false);
    });
    req.end();
  });
}

async function runDevServer(): Promise<void> {
  spawnDetached(getNpmCommand(), ["run", "dev", "-w", "site"], {
    cwd: getRepositoryRoot(),
    env: process.env,
  });
  console.log("Waiting for dev server (http://localhost:4321)...");

  for (let index = 1; index <= 90; index += 1) {
    if (await canReachOgImageApi()) {
      console.log("Dev server is up.");
      return;
    }
    console.log(`Waiting... (${index})`);
    await sleep(2_000);
  }

  throw new Error("Dev server failed to start in time.");
}

const command = process.argv[2];

if (command === "run-dev-server") {
  await runDevServer();
} else {
  throw new Error(`Unknown command: ${command}`);
}
