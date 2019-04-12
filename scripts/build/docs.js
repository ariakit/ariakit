#!/usr/bin/env node
const { injectPropTypes } = require("./utils");

injectPropTypes(process.cwd());
