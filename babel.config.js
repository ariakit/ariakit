const test = process.env.NODE_ENV === "test";
const prod = process.env.NODE_ENV === "production";

const { warn } = console;

// Prevents resolution warnings from babel-plugin-module-resolver
// See https://github.com/tleunen/babel-plugin-module-resolver/issues/315
// eslint-disable-next-line no-console
console.warn = (...args) => {
  for (const arg of args) {
    if (arg.startsWith("Could not resolve") && /src/.test(arg)) {
      return;
    }
  }
  warn(...args);
};

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: test ? "commonjs" : false,
        loose: true,
        targets: test
          ? { node: "current" }
          : {
              browsers: "defaults"
            }
      }
    ],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  plugins: [
    "babel-plugin-dev-expression",
    "babel-plugin-macros",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    !prod && [
      "babel-plugin-module-resolver",
      {
        alias: {
          "^reakit([^/]*)(.*)$": "reakit\\1/src\\2"
        }
      }
    ]
  ].filter(Boolean)
};
