const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  displayName: `${baseConfig.displayName}-safari`,
  testEnvironmentOptions: {
    ...baseConfig.testEnvironmentOptions,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9"
  }
};
