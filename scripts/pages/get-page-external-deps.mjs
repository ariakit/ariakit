// @ts-check
import { dirname, resolve } from "path";
import { visit } from "unist-util-visit";
import { isPlaygroundNode } from "./ast.mjs";
import { getExampleDeps } from "./get-example-deps.mjs";
import { getPageTreeFromFile } from "./get-page-tree.mjs";

/**
 * @param {string} filename
 */
export function getPageExternalDeps(filename) {
  const tree = getPageTreeFromFile(filename);

  /** @type {Record<string, string>} */
  let deps = {};

  visit(tree, "element", (node) => {
    if (!isPlaygroundNode(node)) return;
    const href = node.properties?.href;
    if (typeof href !== "string") return;
    const nextFilename = resolve(dirname(filename), href);
    const pageDeps = getExampleDeps(nextFilename);
    deps = { ...deps, ...pageDeps.dependencies };
  });

  return deps;
}
