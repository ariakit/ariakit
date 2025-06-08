import type { Root } from "hast";
import { visit } from "unist-util-visit";

interface RehypeAsTagNameOptions {
  tags: string[];
}

export function rehypeAsTagName({ tags }: RehypeAsTagNameOptions) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (!node.tagName) return;
      if (!tags.includes(node.tagName)) return;
      if (!node.properties) {
        node.properties = {};
      }
      node.properties.as = node.tagName;
    });
  };
}
