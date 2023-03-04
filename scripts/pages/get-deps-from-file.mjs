// @ts-check
import { dirname, resolve } from "path";
import { visit } from "unist-util-visit";
import { isPlaygroundNode } from "./ast.mjs";
import { getPageTreeFromFile } from "./get-page-tree.mjs";
import { parseDeps } from "./parse-deps.mjs";

/**
 * @param {string} filename
 */
export function getDepsFromFile(filename) {
  const tree = getPageTreeFromFile(filename);

  /** @type {Record<string, string>} */
  let deps = {};

  visit(tree, "element", (node) => {
    if (!isPlaygroundNode(node)) return;
    const href = node.properties?.href;
    if (typeof href !== "string") return;
    const nextFilename = resolve(dirname(filename), href);
    const pageDeps = parseDeps(nextFilename);
    deps = { ...deps, ...pageDeps.dependencies };
  });

  return deps;
}
