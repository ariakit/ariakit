import spawn from "cross-spawn";

spawn.sync("pnpm", ["run", "build"], { stdio: "inherit" });
spawn.sync("npx", ["changeset", "publish"], { stdio: "inherit" });
