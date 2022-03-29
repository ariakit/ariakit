// @ts-check
const { join } = require("path");
const { version: reactVersion } = require("react");
const config = require("../../jest.config");
const pkg = require("./package.json");

const { projects, ...baseConfig } = config;

const react18OnlyTests = [];

/** @type {import("@jest/types").Config.ProjectConfig} */
module.exports = {
  ...baseConfig,
  displayName: pkg.name,
  testMatch: [join(__dirname, "src/**/*test.{js,ts,tsx}")],
  testPathIgnorePatterns: reactVersion.startsWith("17") ? react18OnlyTests : [],
};
