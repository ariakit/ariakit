// @ts-check
const { readdirSync } = require("fs");
const path = require("path");
const { camelCase, upperFirst } = require("lodash");

const pageComponentPath = path.join(__dirname, "components/markdown-page");
const playgroundComponentPath = path.join(__dirname, "components/playground");
const metaPath = path.join(__dirname, "meta.js");

const components = readdirSync(path.join(__dirname, "../../components")).map(
  (filename) => path.basename(filename, ".md")
);

/** @type {import("../../scripts/pages/types").Pages} */
module.exports = [
  {
    name: "guide",
    sourceContext: path.resolve(__dirname, "../../guide"),
    sourceRegExp: /\.md$/,
    pageComponentPath,
    playgroundComponentPath,
    metaPath,
  },
  {
    name: "components",
    sourceContext: path.resolve(__dirname, "../../components"),
    sourceRegExp: /\.md$/,
    pageComponentPath,
    playgroundComponentPath,
    metaPath,
    getGroup: (filename) => {
      const component = path.basename(filename, ".md");
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
    sourceContext: path.resolve(__dirname, "../../examples"),
    sourceRegExp: /examples\/[^\/]+\/(index\.[tj]sx?|readme\.md)$/,
    pageComponentPath,
    playgroundComponentPath,
    metaPath,
    getGroup: (filename) => {
      const component = components.find((c) =>
        path.basename(path.dirname(filename)).startsWith(c)
      );
      if (!component) return null;
      return upperFirst(camelCase(component));
    },
  },
  {
    name: "blog",
    sourceContext: path.resolve(__dirname, "../../blog"),
    sourceRegExp: /\.md$/,
    pageComponentPath,
    playgroundComponentPath,
    metaPath,
  },
];
