// @ts-check
const path = require("path");
const { camelCase, upperFirst } = require("lodash");

const componentPath = path.join(__dirname, "components/markdown-page");
const metaPath = path.join(__dirname, "meta.js");

module.exports = [
  {
    name: "guide",
    sourceContext: path.resolve(__dirname, "../../docs"),
    sourceRegExp: /\.md$/,
    componentPath,
    metaPath,
  },
  {
    name: "components",
    sourceContext: path.resolve(__dirname, "../ariakit/src"),
    sourceRegExp: /src\/[^\/]+\/[^\/]+\.md$/,
    componentPath,
    metaPath,
    /**
     * @param {string} filename
     */
    getGroup: (filename) => {
      const component = path.basename(path.dirname(filename));
      if (["command", "composite", "focus-trap"].includes(component)) {
        return "Abstract components";
      }
      return null;
    },
  },
  {
    name: "examples",
    sourceContext: path.resolve(__dirname, ".."),
    sourceRegExp: /__examples__\/[^\/]+\/(index\.[tj]sx?|readme\.md)$/,
    componentPath,
    metaPath,
    /**
     * @param {string} filename
     */
    getGroup: (filename) => {
      if (!filename.includes("ariakit/src")) return null;
      const group = path.basename(path.resolve(filename, "../../../"));
      return upperFirst(camelCase(group));
    },
  },
  {
    name: "blog",
    sourceContext: path.resolve(__dirname, "../../blog"),
    sourceRegExp: /\.md$/,
    componentPath,
    metaPath,
  },
];
