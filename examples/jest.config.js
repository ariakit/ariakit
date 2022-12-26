// @ts-check
const { join } = require("path");
const React = require("react");
const config = require("../jest.config");
const pkg = require("./package.json");

const { projects, collectCoverageFrom, reporters, testTimeout, ...baseConfig } =
  config;

const react18OnlyTests = [];

const notReact18 = /^(16|17)/.test(React.version);
const testPathIgnorePatterns = notReact18 ? react18OnlyTests : [];

/** @type {import("@jest/types").Config.ProjectConfig} */
module.exports = {
  ...baseConfig,
  testPathIgnorePatterns,
  displayName: pkg.name,
  testMatch: [join(__dirname, "*/**/*test.{js,ts,tsx}")],
};
