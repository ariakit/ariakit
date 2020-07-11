#!/usr/bin/env node
const { join } = require("path");
const spawn = require("cross-spawn");
const {
  hasTSConfig,
  makeProxies,
  makeGitignore,
  makePlaygroundDeps,
} = require("./utils");

require("./clean");
require("./docs");
require("./keys");

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();

makeGitignore(cwd);
makePlaygroundDeps(cwd);
makeProxies(cwd);

if (hasTSConfig(cwd)) {
  spawn.sync("tsc", ["--emitDeclarationOnly"], { stdio: "inherit" });
}

spawn.sync("rollup", ["-c", join(__dirname, "rollup.config.js")], {
  stdio: "inherit",
});
