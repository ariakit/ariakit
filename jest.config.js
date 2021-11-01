const { join } = require("path");

module.exports = {
  rootDir: __dirname,
  testEnvironment: "jsdom",
  projects: ["<rootDir>/packages/*/jest.config.js"],
  collectCoverageFrom: [
    "packages/ariakit/src/**/*.{js,ts,tsx}",
    "!**/*test.{js,ts,tsx}",
  ],
  testMatch: [join(__dirname, "**/*test.{js,ts,tsx}")],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.mock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
