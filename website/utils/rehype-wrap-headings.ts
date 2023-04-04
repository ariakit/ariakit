import type { Element, Root, RootContent } from "hast";
import { h } from "hastscript";
import type { Plugin } from "unified";

function isValidHeading(node: RootContent): node is Element {
  if (node.type !== "element") return false;
  return ["h1", "h2", "h3"].includes(node.tagName);
}

export const rehypeWrapHeadings: Plugin<any[], Root> = () => {
  return (tree) => {
    const groups: Element[] = [];
    for (const node of tree.children) {
      if (node.type === "doctype") continue;
      if (isValidHeading(node)) {
        const props = {
          id: node.properties?.id,
          "data-level": node.tagName.replace("h", ""),
        };
        const wrapper = h("div", props, [node]);
        groups.push(wrapper);
      } else if (!groups.length) {
        const wrapper = h("div", [node]);
        groups.push(wrapper);
      } else {
        const previousGroup = groups[groups.length - 1];
        previousGroup?.children.push(node);
      }
    }
    tree.children = groups;
  };
};
