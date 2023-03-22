/** @type {import("@babel/core").ParserOptions} */
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        loose: true,
        targets: { browsers: "defaults, not IE 11" },
      },
    ],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
};
