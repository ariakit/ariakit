const {
  webpackConfig,
  updateExample,
  logger,
  skipComponentsWithoutExample,
  compilerConfig
} = require("../website/styleguide.config");

module.exports = {
  title: "Dev Styleguide",
  serverPort: 6061,
  pagePerSection: true,
  components: "src/[A-Z]*/*.{js,ts,jsx,tsx}",
  webpackConfig,
  skipComponentsWithoutExample,
  logger,
  compilerConfig,
  updateExample
};
