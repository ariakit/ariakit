// @ts-check
const istanbul = process.env.USE_BABEL_PLUGIN_ISTANBUL === "true";

/** @type {import("@babel/core").ParserOptions} */
module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          targets: {
            browsers: "defaults, not IE 11",
          },
        },
      },
    ],
  ],
  plugins: [istanbul && "babel-plugin-istanbul"].filter(Boolean),
};
