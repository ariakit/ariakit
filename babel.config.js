const test = process.env.NODE_ENV === "test";
const prod = process.env.NODE_ENV === "production";

const { warn } = console;

/** @type {import("@babel/core").ParserOptions} */
module.exports = {
  presets: [
    [
      require("@babel/preset-env"),
      {
        loose: true,
        targets: test
          ? { node: "current" }
          : {
              browsers: "defaults, not IE 11",
            },
      },
    ],
    [require("@babel/preset-react"), { runtime: "automatic" }],
    require("@babel/preset-typescript"),
  ],
};
