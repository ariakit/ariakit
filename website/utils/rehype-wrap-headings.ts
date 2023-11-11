import type { Element, Root, RootContent } from "hast";
import { h } from "hastscript";
import type { Plugin } from "unified";

function isElement(node?: RootContent): node is Element {
  return node?.type === "element";
}

function isHeading(node: RootContent) {
  if (!isElement(node)) return false;
  return ["h1", "h2", "h3"].includes(node.tagName);
}

function getHeadingNode(node: RootContent) {
  if (!isElement(node)) return;
  if (isHeading(node)) return node;
  const heading = node.children.find(isHeading);
  if (!isElement(heading)) return;
  return heading;
}

export const rehypeWrapHeadings: Plugin<any[], Root> = () => {
  return (tree) => {
    const groups: Element[] = [];
    for (const node of tree.children) {
      if (!isElement(node)) continue;
      const heading = getHeadingNode(node);
      if (heading) {
        const props = {
          id: heading.properties?.id,
          "data-level": heading.tagName.replace("h", ""),
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
