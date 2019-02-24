const { plugins } = require("../../babel.config");

module.exports = {
  presets: [
    [
      "babel-preset-gatsby",
      {
        targets: {
          browsers: [">0.25%", "not dead"]
        }
      }
    ]
  ],
  plugins
};
