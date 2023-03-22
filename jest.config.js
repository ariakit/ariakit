// @ts-check
/** @type {import("@jest/types").Config.GlobalConfig} */
module.exports = {
  rootDir: __dirname,
  testTimeout: process.env.CI ? 10000 : 5000,
  testEnvironment: "jsdom",
  reporters: ["default", "github-actions"],
  // transform: {
  //   "\\.[jt]sx?$": ["es-jest", { jsx: "automatic" }],
  // },
  // extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
  snapshotFormat: {
    printBasicPrototype: false,
  },
  projects: [
    // "<rootDir>/blog/jest.config.js",
    "<rootDir>/examples/jest.config.cjs",
    // "<rootDir>/guide/jest.config.js",
    "<rootDir>/packages/*/jest.config.cjs",
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
  // setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
