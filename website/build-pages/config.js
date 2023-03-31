// @ts-check
import { readdirSync } from "fs";
import { basename, join, resolve } from "path";
import { camelCase, upperFirst } from "lodash-es";
import { getPageName } from "./get-page-name.js";

const root = resolve(process.cwd(), "..");

const componentsContext = join(root, "components");
const components = readdirSync(componentsContext).map((filename) =>
  basename(filename, ".md")
);

const buildDir = join(process.cwd(), ".pages");

/** @type {import("./types.js").Page[]} */
const pages = [
  {
    slug: "blog",
    title: "Blog",
    sourceContext: join(root, "blog"),
  },
  {
    slug: "components",
    title: "Components",
    sourceContext: componentsContext,
    getGroup: (filename) => {
      const component = getPageName(filename);
      const abstract = [
        "collection",
        "command",
        "composite",
        "focus-trap",
        "focusable",
        "portal",
        "role",
        "separator",
      ];
      if (abstract.includes(component)) {
        return "Abstract components";
      }
      return null;
    },
  },
  {
    slug: "examples",
    title: "Examples",
    sourceContext: join(root, "examples"),
    getGroup: (filename) => {
      const page = getPageName(filename);
      const component = [...components]
        .reverse()
        .find((c) => page.startsWith(c));
      if (!component) return null;
      return upperFirst(camelCase(component));
    },
  },
  {
    slug: "guide",
    title: "Guide",
    sourceContext: join(root, "guide"),
  },
];

export default { buildDir, pages };
