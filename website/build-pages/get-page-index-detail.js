// @ts-check
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";
import { getPageName } from "./get-page-name.js";
import { getPageTreeFromFile } from "./get-page-tree.js";

/**
 * @param {string} filename
 * @param {import("./types.js").Page["getGroup"]} [getGroup]
 * @param {import("hast").Root} [tree]
 * TODO: Fix return type (PageIndexDetail) or update the function name
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
