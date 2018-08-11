module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        loose: true,
        targets: {
          browsers: "defaults"
        }
      }
    ],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "styled-components"
  ],
  env: {
    test: {
      plugins: ["transform-es2015-modules-commonjs"]
    }
  }
};
