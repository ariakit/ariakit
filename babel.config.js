const test = process.env.NODE_ENV === "test";

/** @type {import("@babel/core").ParserOptions} */
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        loose: true,
        targets: test
          ? { node: "current" }
          : {
              browsers: "defaults, not IE 11",
            },
      },
    ],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
};
