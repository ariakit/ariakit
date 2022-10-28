// @ts-check
const path = require("path");
const { camelCase, upperFirst } = require("lodash");

const componentPath = path.join(__dirname, "components/markdown-page");

/**
 * @type {import("../../scripts/pages/types").Pages}
 */
module.exports = [
  {
    name: "guide",
    sourceContext: path.resolve(__dirname, "../../docs"),
    sourceRegExp: /\.md$/,
    componentPath,
  },
  {
    name: "components",
    sourceContext: path.resolve(__dirname, "../ariakit/src"),
    sourceRegExp: /src\/[^\/]+\/[^\/]+\.md$/,
    componentPath,
    getGroup: (filename) => {
      const component = path.basename(path.dirname(filename));
      if (
        [
          "collection",
          "command",
          "composite",
          "focus-trap",
          "focusable",
          "portal",
          "role",
          "separator",
        ].includes(component)
      ) {
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
  },
  {
    name: "apis",
    type: "api",
    sourceContext: path.resolve(__dirname, "../ariakit/src"),
    sourceRegExp: /src\/[^\/]+\/(?!__|index).+\.tsx?$/,
    componentPath,
  },
];
