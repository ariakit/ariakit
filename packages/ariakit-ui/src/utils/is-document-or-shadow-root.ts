/**
 * Whether a node is a document or a shadow root, the roots that `getRootNode()`
 * returns for a node in a document or a shadow tree.
 */
export function isDocumentOrShadowRoot(
  node: Node,
): node is Document | ShadowRoot {
  return "activeElement" in node;
}
