// @ts-check
const path = require("path");

const componentPath = path.join(__dirname, "components/markdown-page");
const cssTokensPath = path.join(__dirname, "styles/tokens.css");

module.exports = [
  {
    name: "guide",
    sourceContext: path.resolve(__dirname, "../../docs"),
    sourceRegExp: /\.md$/,
    componentPath,
    cssTokensPath,
  },
  {
    name: "components",
    sourceContext: path.resolve(__dirname, "../ariakit/src"),
    sourceRegExp: /src\/[^\/]+\/[^\/]+\.md$/,
    componentPath,
    cssTokensPath,
  },
  {
    name: "examples",
    sourceContext: path.resolve(__dirname, ".."),
    sourceRegExp: /__examples__\/[^\/]+\/(index\.[tj]sx?|readme\.md)$/,
    componentPath,
    cssTokensPath,
  },
  {
    name: "blog",
    sourceContext: path.resolve(__dirname, "../../blog"),
    sourceRegExp: /\.md$/,
    componentPath,
    cssTokensPath,
  },
];
