// @ts-check
import { readdirSync } from "fs";
import { basename, dirname, resolve } from "path";
import { camelCase, upperFirst } from "lodash-es";

const components = readdirSync(resolve(process.cwd(), "../../components")).map(
  (filename) => basename(filename, ".md")
);

const buildDir = resolve(process.cwd(), ".pages");

/** @type {import("../../scripts/pages/types.js").Page[]} */
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

export default { buildDir, pages };
