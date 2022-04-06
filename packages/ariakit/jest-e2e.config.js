// @ts-check
const { join } = require("path");
const config = require("../../jest-e2e.config");
const pkg = require("./package.json");

const { projects, ...baseConfig } = config;

/** @type {import("@jest/types").Config.ProjectConfig} */
module.exports = {
  ...baseConfig,
  preset: "jest-puppeteer",
  testMatch: [join(__dirname, "src/**/*e2e.{js,ts,tsx}")],
};
