import * as hast from "hast";

/**
 * Determines if a node is a playground node.
 */
export function isPlaygroundNode(
  node: hast.Element | hast.ElementContent
): node is hast.Element {
  if (!("tagName" in node)) return false;
  if (node.tagName !== "a") return false;
  if (!node.properties) return false;
  return "dataPlayground" in node.properties;
}

/**
 * Determines if a node is a playground paragraph node.
 */
export function isPlaygroundParagraphNode(node: hast.Element) {
  if (node.tagName !== "p") return false;
  const [child] = node.children;
  if (!child) return false;
  return isPlaygroundNode(child);
}
