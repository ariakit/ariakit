const { defaults } = require("jest-config");

module.exports = {
  setupFiles: ["<rootDir>/test.config.js"],
  snapshotSerializers: ["enzyme-to-json/serializer", "jest-serializer-html"],
  coveragePathIgnorePatterns: ["/node_modules/", "<rootDir>/website"],
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  transform: {
    // (.js, .ts, .jsx, .tsx) files
    "^.+\\.(j|t)sx?$": "babel-jest"
  }
};
