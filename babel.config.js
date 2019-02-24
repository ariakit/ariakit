const test = process.env.NODE_ENV === "test";
const prod = process.env.NODE_ENV === "production";

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
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    !prod && [
      "babel-plugin-module-resolver",
      {
        alias: {
          "^reakit/(.+)": "reakit/src/\\1",
          "^reakit([^/]*)/(.+)": "reakit\\1/src/\\2"
        }
      }
    ]
  ].filter(Boolean)
};
