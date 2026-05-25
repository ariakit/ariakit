import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const rehypeCodeMeta: Plugin<any[], Root> = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "element") return;
      if (node.tagName !== "code") return;
      const meta = node.data && "meta" in node.data ? node.data.meta : null;
      if (typeof meta !== "string") return;
      node.properties = {
        ...node.properties,
        meta,
      };
    });
  };
};
