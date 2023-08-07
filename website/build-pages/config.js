import { readdirSync } from "fs";
import { basename, dirname, join, resolve } from "path";
import { camelCase, upperFirst } from "lodash-es";
import { getPageName } from "./get-page-name.js";
import { getPageTitle } from "./get-page-title.js";

const root = resolve(process.cwd(), "..");

const componentsContext = join(root, "components");
const components = readdirSync(componentsContext).map((filename) =>
  basename(filename, ".md"),
);

const buildDir = join(process.cwd(), ".pages");

/** @type {import("./types.js").Page[]} */
const pages = [
  {
    slug: "guide",
    title: getPageTitle("guide"),
    sourceContext: join(root, "guide"),
    getGroup(filename) {
      if (typeof filename !== "string") return null;
      const match = basename(dirname(filename)).match(/^\d+/);
      if (!match) return null;
      const number = parseInt(match[0]);
      if (number >= 900) return "Other";
      return null;
    },
  },
  {
    slug: "components",
    title: getPageTitle("components"),
    sourceContext: componentsContext,
    getGroup(filename) {
      const component = getPageName(filename);
      const abstract = [
        "collection",
        "command",
        "composite",
        "focus-trap",
        "focusable",
        "group",
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
    title: getPageTitle("examples"),
    sourceContext: [
      join(root, "examples"),
      join(process.cwd(), "app/(examples)/previews"),
    ],
    getGroup(filename) {
      const page = getPageName(filename);
      const component = [...components]
        .reverse()
        .find((c) => page.startsWith(c));
      if (!component) return null;
      return upperFirst(camelCase(component));
    },
  },
  {
    slug: "reference",
    title: getPageTitle("reference"),
    reference: true,
    sourceContext: join(root, "packages/ariakit-react/src"),
    pageFileRegex: /^((?!index).)*\.tsx?$/,
    getGroup(reference) {
      if (typeof reference === "string") return null;
      return upperFirst(camelCase(getPageName(reference.filename)));
    },
  },
];

export default { buildDir, pages };
