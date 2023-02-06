const test = process.env.NODE_ENV === "test";
const prod = process.env.NODE_ENV === "production";

const { warn } = console;

// TODO: Prevents resolution warnings from babel-plugin-module-resolver
// See https://github.com/tleunen/babel-plugin-module-resolver/issues/315
// eslint-disable-next-line no-console
// console.warn = (...args) => {
//   for (const arg of args) {
//     if (arg.startsWith("Could not resolve") && /src/.test(arg)) {
//       return;
//     }
//   }
//   warn(...args);
// };

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
  plugins: [
    !prod && [
      require("babel-plugin-module-resolver"),
      {
        // See https://github.com/tleunen/babel-plugin-module-resolver/issues/315
        extensions: [".js", ".jsx", ".es", ".es6", ".mjs", ".ts", ".tsx"],
        alias: {
          "^ariakit([^/]*)(.*)$": "ariakit\\1/src\\2",
          "^@ariakit/([^/]*)(.*)$": "@ariakit/\\1/src\\2",
        },
      },
    ],
  ].filter(Boolean),
};
