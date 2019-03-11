module.exports = {
  rootDir: __dirname,
  testEnvironment: "jest-environment-jsdom-thirteen",
  collectCoverageFrom: [
    "packages/reakit/src/**/*.{js,ts,tsx}",
    "!**/*-test.{js,ts,tsx}"
  ],
  projects: ["<rootDir>/packages/*/jest.config.js"],
  setupFilesAfterEnv: [
    "jest-dom/extend-expect",
    "react-testing-library/cleanup-after-each",
    "raf/polyfill",
    "<rootDir>/jest.setup.js"
  ]
};
