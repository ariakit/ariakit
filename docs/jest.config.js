const { join, basename } = require("path");
const { projects, ...baseConfig } = require("../jest.config");

module.exports = {
  ...baseConfig,
  displayName: basename(__dirname),
  testMatch: [join(__dirname, "**/*test.{js,ts,tsx}")],
};
