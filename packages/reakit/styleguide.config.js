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
  components: "src/components/**/*.js",
  webpackConfig,
  skipComponentsWithoutExample,
  logger,
  compilerConfig,
  updateExample
};
