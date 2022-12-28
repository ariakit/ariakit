const { join } = require("path");
const spawn = require("cross-spawn");
const {
  hasTSConfig,
  makeTSConfigProd,
  makeProxies,
  makeGitignore,
  onExit,
} = require("./utils");

require("./clean");

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();

makeGitignore(cwd);
makeProxies(cwd);

if (hasTSConfig(cwd)) {
  onExit(makeTSConfigProd(cwd));
  spawn.sync("tsc", ["--emitDeclarationOnly"], { stdio: "inherit" });
}

spawn.sync(
  "rollup",
  ["-c", join(__dirname, "rollup.config.js"), "--bundleConfigAsCjs"],
  {
    stdio: "inherit",
  }
);
