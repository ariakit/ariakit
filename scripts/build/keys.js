#!/usr/bin/env node
const { hasTSConfig, makeKeys } = require("./utils");

const cwd = process.cwd();

if (hasTSConfig(cwd)) {
  makeKeys(cwd);
}
