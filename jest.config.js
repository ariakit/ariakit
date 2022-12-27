// @ts-check
/** @type {import("@jest/types").Config.GlobalConfig} */
module.exports = {
  rootDir: __dirname,
  testTimeout: process.env.CI ? 10000 : 5000,
  testEnvironment: "jsdom",
  reporters: ["default", "github-actions"],
  snapshotFormat: {
    printBasicPrototype: false,
  },
  projects: [
    "<rootDir>/blog/jest.config.js",
    "<rootDir>/examples/jest.config.js",
    "<rootDir>/guide/jest.config.js",
    "<rootDir>/packages/*/jest.config.js",
  ],
  collectCoverageFrom: [
    "packages/@ariakit/core/src/**/*.{js,ts,tsx}",
    "packages/@ariakit/react-core/src/**/*.{js,ts,tsx}",
    "!**/*test.{js,ts,tsx}",
    "!**/test-*.{js,ts}",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.mock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
