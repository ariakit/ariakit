// @ts-check
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import { getPageName } from "./get-page-name.mjs";
import { getPageTreeFromFile } from "./get-page-tree.mjs";

/**
 * @param {string} filename
 * @param {import("./types.js").Page["getGroup"]} [getGroup]
 * @param {import("hast").Root} [tree]
 * @returns {import("./types.js").PageIndexDetail}
 */
export function getPageIndexDetail(filename, getGroup, tree) {
  tree = tree || getPageTreeFromFile(filename);
  const slug = getPageName(filename);
  let title = "";
  let content = "";
  visit(tree, "element", (node) => {
    if (node.tagName === "h1" && !title) {
      title = toString(node).trim();
    }
    if (node.tagName === "p" && !content) {
      content = toString(node).trim();
    }
  });
  const group = getGroup?.(filename) || null;
  return { group, slug, title, content };
}
