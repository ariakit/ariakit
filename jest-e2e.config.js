// @ts-check
/** @type {import("@jest/types").Config.GlobalConfig} */
module.exports = {
  rootDir: __dirname,
  preset: "jest-puppeteer",
  testEnvironment: "./jest-e2e-environment.js",
  projects: ["<rootDir>/packages/*/jest-e2e.config.js"],
};
