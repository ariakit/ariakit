// @ts-check
/** @type {import("@jest/types").Config.GlobalConfig} */
module.exports = {
  rootDir: __dirname,
  preset: "jest-puppeteer",
  projects: ["<rootDir>/packages/*/jest-e2e.config.js"],
  setupFilesAfterEnv: ["expect-puppeteer"],
};
