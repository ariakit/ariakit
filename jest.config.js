module.exports = {
  testEnvironment: "jest-environment-jsdom-fifteen",
  rootDir: __dirname,
  collectCoverageFrom: [
    "packages/reakit/src/**/*.{js,ts,tsx}",
    "!**/*-test.{js,ts,tsx}"
  ],
  projects: ["<rootDir>/packages/*/jest.config.js"],
  setupFilesAfterEnv: [
    "raf/polyfill",
    "@testing-library/jest-dom/extend-expect",
    "@wordpress/jest-console",
    "<rootDir>/jest.setup.js"
  ]
};
