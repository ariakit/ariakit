#!/usr/bin/env node
const { join } = require("path");
const spawn = require("cross-spawn");
const {
  makeProxies,
  makeGitignore,
  cleanBuild,
  hasTSConfig
} = require("./utils");

const cwd = process.cwd();

cleanBuild(cwd);
makeGitignore(cwd);
makeProxies(cwd);

if (hasTSConfig(cwd)) {
  spawn.sync("yarn", ["tsc", "--emitDeclarationOnly"], { stdio: "inherit" });
}

spawn.sync("yarn", ["rollup", "-c", join(__dirname, "rollup.config.js")], {
  stdio: "inherit"
});
