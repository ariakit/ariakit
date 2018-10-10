module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        modules: process.env.NODE_ENV === "test" ? "commonjs" : false,
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
    process.env.NODE_ENV !== "test" && "styled-components"
  ].filter(Boolean)
};
