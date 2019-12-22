const { join } = require("path");
const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  displayName: `${baseConfig.displayName}@safari`,
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    join(__dirname, "jest.safari.setup.js")
  ]
};
