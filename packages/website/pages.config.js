// @ts-check
const { readdirSync } = require("fs");
const { basename, dirname, resolve } = require("path");
const { camelCase, upperFirst } = require("lodash");

const components = readdirSync(resolve(process.cwd(), "../../components")).map(
  (filename) => basename(filename, ".md")
);

const buildDir = resolve(process.cwd(), ".pages");

/** @type {import("../../scripts/pages/types").Page[]} */
const pages = [
  {
    sourceContext: resolve(process.cwd(), "../../blog"),
  },
  {
    sourceContext: resolve(process.cwd(), "../../components"),
    getGroup: (filename) => {
      const component = basename(filename, ".md");
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
    sourceContext: resolve(process.cwd(), "../../examples"),
    getGroup: (filename) => {
      const component = components.find((c) =>
        basename(dirname(filename)).startsWith(c)
      );
      if (!component) return null;
      return upperFirst(camelCase(component));
    },
  },
  {
    sourceContext: resolve(process.cwd(), "../../guide"),
  },
];

module.exports = { buildDir, pages };
