/** @type {import("@jest/types").Config.ProjectConfig} */
module.exports = {
  rootDir: __dirname,
  testEnvironment: "jsdom",
  projects: [
    "<rootDir>/packages/*/jest.config.js",
    "<rootDir>/blog/jest.config.js",
    "<rootDir>/docs/jest.config.js",
  ],
  collectCoverageFrom: [
    "packages/ariakit/src/**/*.{js,ts,tsx}",
    "!**/*test.{js,ts,tsx}",
  ],
  moduleNameMapper: {
    "\\.css$": "<rootDir>/jest.mock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
