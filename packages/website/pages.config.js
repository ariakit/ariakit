// @ts-check
const path = require("path");

module.exports = [
  {
    name: "guide",
    sourceContext: path.resolve(__dirname, "../../docs"),
    sourceRegExp: /\.md$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  },
  {
    name: "components",
    sourceContext: path.resolve(__dirname, "../ariakit/src"),
    sourceRegExp: /src\/[^\/]+\/[^\/]+\.md$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  },
  {
    name: "examples",
    sourceContext: path.resolve(__dirname, ".."),
    sourceRegExp: /__examples__\/[^\/]+\/(index\.[tj]sx?|readme\.md)$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  },
  {
    name: "blog",
    sourceContext: path.resolve(__dirname, "../../blog"),
    sourceRegExp: /\.md$/,
    componentPath: path.join(__dirname, "components/markdown-page"),
  },
];
