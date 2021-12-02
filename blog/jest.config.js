// @ts-check
const { join, basename } = require("path");
const config = require("../jest.config");

const { projects, ...baseConfig } = config;

/** @type {import("@jest/types").Config.ProjectConfig} */
module.exports = {
  ...baseConfig,
  displayName: basename(__dirname),
  testMatch: [join(__dirname, "**/*test.{js,ts,tsx}")],
};
