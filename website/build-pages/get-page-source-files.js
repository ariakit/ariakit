// @ts-check
import { dirname, extname, resolve } from "path";
import { visit } from "unist-util-visit";
import { isPlaygroundNode } from "./ast.js";
import { getPageTreeFromFile } from "./get-page-tree.js";

/**
 * Returns all source files for a page.
 * @param {string} filename
 */
export function getPageSourceFiles(filename) {
  if (extname(filename) !== ".md") return [filename];

  /** @type {string[]} */
  const sourceFiles = [];

  const tree = getPageTreeFromFile(filename);

  visit(tree, "element", (node) => {
    if (!isPlaygroundNode(node)) return;
    const href = node.properties?.href;
    if (typeof href !== "string") return;
    const nextFilename = resolve(dirname(filename), href);
    sourceFiles.push(nextFilename);
  });

  return sourceFiles;
}
