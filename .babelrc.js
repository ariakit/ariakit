module.exports = {
  presets: [
    [
      "env",
      {
        modules: false,
        loose: true
      }
    ],
    "stage-1",
    "flow",
    "react"
  ],
  plugins: ["styled-components"],
  env: {
    test: {
      plugins: ["transform-es2015-modules-commonjs"]
    }
  }
};
