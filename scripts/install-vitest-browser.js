import { spawnSync } from "node:child_process";

if (!process.env.CI) {
  process.exit(0);
}

const result = spawnSync(
  "pnpm",
  ["exec", "playwright", "install", "--with-deps", "chromium"],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
