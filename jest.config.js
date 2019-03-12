module.exports = {
  rootDir: __dirname,
  collectCoverageFrom: [
    "packages/reakit/src/**/*.{js,ts,tsx}",
    "!**/*-test.{js,ts,tsx}"
  ],
  projects: ["<rootDir>/packages/*/jest.config.js"],
  setupFilesAfterEnv: [
    "raf/polyfill",
    "jest-dom/extend-expect",
    "react-testing-library/cleanup-after-each",
    "<rootDir>/jest.setup.js"
  ]
};
