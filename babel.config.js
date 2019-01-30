const testing = process.env.NODE_ENV === "test";

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: testing ? "commonjs" : false,
        loose: true,
        targets: testing
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
    "@babel/plugin-proposal-object-rest-spread"
  ].filter(Boolean)
};
