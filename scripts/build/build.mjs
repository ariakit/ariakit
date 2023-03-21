import { fileURLToPath } from "url";
import spawn from "cross-spawn";
import { makeGitignore, makeProxies } from "./utils.js";

import "./clean.mjs";

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();

makeGitignore(cwd);
makeProxies(cwd);

const configPath = fileURLToPath(new URL("rollup.config.mjs", import.meta.url));

spawn.sync("rollup", ["-c", configPath], { stdio: "inherit" });
