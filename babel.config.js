const test = process.env.NODE_ENV === "test";
const prod = process.env.NODE_ENV === "production";

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      // TODO: Test removing this.
      {
        modules: test ? "commonjs" : false,
        loose: true,
        targets: test
          ? { node: "current" }
          : {
              browsers: "defaults",
            },
      },
    ],
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    !prod && [
      "babel-plugin-module-resolver",
      {
        alias: {
          "^ariakit([^/]*)(.*)$": "ariakit\\1/src\\2",
        },
      },
    ],
  ].filter(Boolean),
};
