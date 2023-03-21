const { join } = require("path");
const spawn = require("cross-spawn");
const { makeProxies, makeGitignore } = require("./utils");

require("./clean.mjs");

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();

makeGitignore(cwd);
makeProxies(cwd);

spawn.sync(
  "rollup",
  ["-c", join(__dirname, "rollup.config.js"), "--bundleConfigAsCjs"],
  {
    stdio: "inherit",
  }
);
