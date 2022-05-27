// @ts-check
/** @type {import("@jest/types").Config.GlobalConfig} */
module.exports = {
  rootDir: __dirname,
  testTimeout: process.env.CI ? 10000 : 5000,
  testEnvironment: "jsdom",
  reporters: ["default", "github-actions"],
  projects: [
    "<rootDir>/packages/*/jest.config.js",
    "<rootDir>/blog/jest.config.js",
    "<rootDir>/docs/jest.config.js",
  ],
  collectCoverageFrom: [
    "packages/ariakit/src/**/*.{js,ts,tsx}",
    "packages/ariakit-utils/src/**/*.{js,ts,tsx}",
    "!**/__examples__/**",
    "!**/*test.{js,ts,tsx}",
    "!**/test-*.{js,ts}",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.mock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
