import spawn from "cross-spawn";

spawn.sync("npx", ["changeset", "version"], { stdio: "inherit" });

spawn.sync("pnpm", ["install", "--lockfile-only", "--no-optional"], {
  stdio: "inherit",
});
