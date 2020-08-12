#!/usr/bin/env node
const { hasTSConfig, injectPropTypes } = require("./utils");

const cwd = process.cwd();

if (hasTSConfig(cwd)) {
  injectPropTypes(cwd);
}
