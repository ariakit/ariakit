const { defaults } = require("jest-config");

module.exports = {
  rootDir: __dirname,
  snapshotSerializers: ["enzyme-to-json/serializer", "jest-serializer-html"],
  collectCoverageFrom: [
    "packages/reakit/src/**/*.{js,ts,tsx}",
    "!**/*-test.{js,ts,tsx}"
  ],
  projects: ["<rootDir>/packages/*/jest.config.js"],
  setupTestFrameworkScriptFile: "<rootDir>/jest.setup.js",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  transform: {
    "^.+\\.(j|t)sx?$": "babel-jest"
  }
};
