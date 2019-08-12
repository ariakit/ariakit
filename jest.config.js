module.exports = {
  rootDir: __dirname,
  collectCoverageFrom: [
    "packages/reakit/src/**/*.{js,ts,tsx}",
    "!**/*-test.{js,ts,tsx}"
  ],
  projects: ["<rootDir>/packages/*/jest.config.js"],
  setupFilesAfterEnv: [
    "raf/polyfill",
    "@testing-library/jest-dom/extend-expect",
    "<rootDir>/jest.setup.js"
  ]
};
