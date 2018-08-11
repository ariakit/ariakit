const { defaults } = require("jest-config");

module.exports = {
  rootDir: __dirname,
  snapshotSerializers: ["enzyme-to-json/serializer", "jest-serializer-html"],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/packages/website"],
  projects: ["<rootDir>/packages/*"],
  setupFiles: ["<rootDir>/test.config.js"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  transform: {
    // (.js, .ts, .jsx, .tsx) files
    "^.+\\.(j|t)sx?$": "babel-jest"
  }
};
