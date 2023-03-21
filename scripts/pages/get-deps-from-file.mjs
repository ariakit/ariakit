// @ts-check
import { dirname, resolve } from "path";
import { visit } from "unist-util-visit";
import { isPlaygroundNode } from "./ast.mjs";
import { getPageTreeFromFile } from "./get-page-tree.mjs";
import { parseDeps } from "./parse-deps.mjs";

/**
 * @param {string} filename
 */
export async function getDepsFromFile(filename) {
  const tree = getPageTreeFromFile(filename);

  /** @type {Record<string, string>} */
  let deps = {};

  /** @type {ReturnType<typeof parseDeps>[]} */
  const promises = [];

  visit(tree, "element", (node) => {
    if (!isPlaygroundNode(node)) return;
    const href = node.properties?.href;
    if (typeof href !== "string") return;
    const nextFilename = resolve(dirname(filename), href);
    promises.push(parseDeps(nextFilename));
    // const pageDeps = parseDeps(nextFilename);
    // deps = { ...deps, ...pageDeps.dependencies };
  });

  const allPageDeps = await Promise.all(promises);

  for (const pageDeps of allPageDeps) {
    deps = { ...deps, ...pageDeps.dependencies };
  }

  return deps;
}
