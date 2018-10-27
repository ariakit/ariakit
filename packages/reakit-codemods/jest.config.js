const { join } = require("path");
const { projects, ...baseConfig } = require("../../jest.config");
const pkg = require("./package.json");

module.exports = {
  ...baseConfig,
  displayName: pkg.name,
  testMatch: [join(__dirname, "__tests__/**/*-test.{js,ts,tsx}")]
};
