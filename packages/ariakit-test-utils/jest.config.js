// @ts-check
const { join } = require("path");
const config = require("../../jest.config");
const pkg = require("./package.json");

const { projects, ...baseConfig } = config;

/** @type {import("@jest/types").Config.ProjectConfig} */
module.exports = {
  ...baseConfig,
  displayName: pkg.name,
  testMatch: [join(__dirname, "src/**/*test.{js,ts,tsx}")],
};
