// TODO: Refactor
const path = require("path");

const cssFile = path.join(__dirname, "packages/website/styles/tokens.css");

module.exports = {
  plugins: [
    "postcss-import",
    // [
    //   path.join(
    //     __dirname,
    //     "scripts/pages/postcss-custom-properties-fallback.js"
    //   ),
    //   {
    //     file: cssFile,
    //   },
    // ],
  ],
};
