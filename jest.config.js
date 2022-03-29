// @ts-check
/** @type {import("@jest/types").Config.GlobalConfig} */
module.exports = {
  rootDir: __dirname,
  testEnvironment: "jsdom",
  cacheDirectory: "<rootDir>/.jest-cache",
  projects: [
    "<rootDir>/packages/*/jest.config.js",
    "<rootDir>/blog/jest.config.js",
    "<rootDir>/docs/jest.config.js",
  ],
  collectCoverageFrom: [
    "packages/ariakit/src/**/*.{js,ts,tsx}",
    "packages/ariakit-utils/src/**/*.{js,ts,tsx}",
    "!**/*test.{js,ts,tsx}",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.mock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
