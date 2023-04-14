import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const rehypeCodeMeta: Plugin<any[], Root> = () => {
  return function (tree) {
    visit(tree, (node) => {
      if (node.type !== "element") return;
      if (node.tagName !== "code") return;
      if (typeof node.data?.meta !== "string") return;
      node.properties = {
        ...node.properties,
        meta: node.data.meta,
      };
    });
  };
};
