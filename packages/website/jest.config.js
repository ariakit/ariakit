const { join } = require("path");
const { projects, ...baseConfig } = require("../../jest.config");
const pkg = require("./package.json");

module.exports = {
  ...baseConfig,
  displayName: pkg.name,
  transform: {
    "^.+\\.(j|t)sx?$": join(__dirname, "jest.transform.js")
  },
  transformIgnorePatterns: [
    join(__dirname, "../../node_modules/(?!(gatsby)/)")
  ],
  testMatch: [join(__dirname, "src/**/*-test.{js,ts,tsx}")],
  moduleNameMapper: {
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": join(
      __dirname,
      "__mocks__/file-mock.js"
    )
  },
  globals: {
    __PATH_PREFIX__: ""
  },
  setupFiles: [join(__dirname, "loadershim.js")]
};
