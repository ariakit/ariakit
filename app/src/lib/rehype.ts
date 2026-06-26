/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Element, ElementContent, Root, RootContent, Text } from "hast";
import { toText } from "hast-util-to-text";
import { visit } from "unist-util-visit";
import { encodeBase64 } from "./base64.ts";

interface RehypeAsTagNameOptions {
  tags: string[];
}

/**
 * This plugin adds the `as` property to the code block's properties. It's used
 * to determine the tag name of the code block.
 */
export function rehypeAsTagName({ tags }: RehypeAsTagNameOptions) {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (!node.tagName) return;
      if (!tags.includes(node.tagName)) return;
      node.properties.as = node.tagName;
    });
  };
}

function isParagraphWithText(
  node: RootContent | undefined,
  text: string,
): node is Element {
  if (!node || node.type !== "element") return false;
  if (node.tagName !== "p") return false;
  const content = toText(node).trim().toLowerCase();
  const lowerText = text.toLowerCase();
  return content === lowerText || content === `${lowerText}:`;
}

function getCodeNode(preNode: Element): Element | undefined {
  return preNode.children.find(
    (child): child is Element =>
      child.type === "element" && child.tagName === "code",
  );
}

function getCodeText(codeNode: Element): string | null {
  const textNode = codeNode.children.find(
    (child): child is Text => child.type === "text",
  );
  return textNode?.value ?? null;
}

function queuePrecedingParagraphForRemoval(
  parent: Element | Root,
  preNodeIndex: number,
  text: string,
  nodesToRemove: { parent: Element | Root; node: RootContent }[],
) {
  let prevIndex = preNodeIndex - 1;
  let prevNode = parent.children[prevIndex];
  const intermediateNodesToRemove: {
    parent: Element | Root;
    node: RootContent;
  }[] = [];

  while (prevNode?.type === "text") {
    intermediateNodesToRemove.push({ parent, node: prevNode });
    prevIndex--;
    prevNode = parent.children[prevIndex];
  }

  if (isParagraphWithText(prevNode, text)) {
    nodesToRemove.push({ parent, node: prevNode });
    nodesToRemove.push(...intermediateNodesToRemove);
  }
}

/**
 * This plugin removes the preceding paragraph of the code block if it has the
 * text "Before" or "After". It also adds the previous code to the code block's
 * metastring.
 */
export function rehypePreviousCode() {
  return (tree: Root) => {
    let previousCode: string | null = null;
    const nodesToRemove: { parent: Element | Root; node: RootContent }[] = [];

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre") return;
      if (!parent || typeof index !== "number") return;

      const codeNode = getCodeNode(node);
      if (!codeNode) return;

      const { metastring } = codeNode.properties;
      const isPreviousCode =
        typeof metastring === "string" && metastring.includes("previousCode");

      if (isPreviousCode) {
        const text = getCodeText(codeNode);
        if (!text) return;
        previousCode = text;
        codeNode.properties.metastring = metastring
          .replace("previousCode", "")
          .trim();
        queuePrecedingParagraphForRemoval(
          parent,
          index,
          "Before",
          nodesToRemove,
        );
        nodesToRemove.push({ parent, node });
      } else if (previousCode) {
        codeNode.properties.previousCode = encodeBase64(previousCode);
        queuePrecedingParagraphForRemoval(
          parent,
          index,
          "After",
          nodesToRemove,
        );
        previousCode = null;
      }
    });

    if (!nodesToRemove.length) return;

    // Group nodes to be removed by their parent. This is necessary because a
    // single parent might have multiple children that need to be removed.
    const toRemoveByParent = new Map<Element | Root, Set<RootContent>>();

    for (const { parent, node } of nodesToRemove) {
      if (!toRemoveByParent.has(parent)) {
        toRemoveByParent.set(parent, new Set());
      }
      toRemoveByParent.get(parent)!.add(node);
    }

    // For each parent, remove all the marked children in a single, efficient
    // operation.
    for (const [parent, nodes] of toRemoveByParent.entries()) {
      parent.children = parent.children.filter((child) => !nodes.has(child));
    }
  };
}

function removeLeadingTextWhitespace(children: ElementContent[]) {
  while (children.length) {
    const child = children[0];
    if (!child) break;
    if (child.type !== "text") break;

    const value = child.value.replace(/^\s+/, "");
    if (value) {
      children[0] = { ...child, value };
      break;
    }
    children.shift();
  }
}

function splitParagraphAtFirstLineBreak(paragraph: Element) {
  const firstLine: ElementContent[] = [];
  const rest = [...paragraph.children];

  while (rest.length) {
    const child = rest[0];
    if (!child) break;

    if (child.type === "element" && child.tagName === "br") {
      rest.shift();
      removeLeadingTextWhitespace(rest);
      break;
    }

    if (child.type === "text") {
      const newlineIndex = child.value.indexOf("\n");
      if (newlineIndex !== -1) {
        const value = child.value.slice(newlineIndex + 1);
        firstLine.push({
          type: "text",
          value: child.value.slice(0, newlineIndex),
        });
        if (value) {
          rest[0] = { ...child, value };
        } else {
          rest.shift();
        }
        removeLeadingTextWhitespace(rest);
        break;
      }
    }

    firstLine.push(child);
    rest.shift();
  }

  return { firstLine, rest };
}

/**
 * This plugin transforms GitHub-style admonition blockquotes. It adds
 * `data-admonition`, `data-type`, and an optional `data-title` attribute to the
 * blockquote element.
 */
export function rehypeAdmonitions() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "blockquote") return;
      if (!node.children) return;

      const { children } = node;

      const firstParagraph = children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "p",
      );

      if (!firstParagraph) return;

      const { firstLine, rest } =
        splitParagraphAtFirstLineBreak(firstParagraph);
      const firstLineParagraph: Element = {
        type: "element",
        tagName: "p",
        properties: {},
        children: firstLine,
      };
      const text = toText(firstLineParagraph).trim();
      const match = text.match(/^\[!(\w+)\]\s*(.*)$/);

      if (!match) return;

      const type = match[1]?.toLowerCase();
      if (!type) return;
      const title = match[2]?.trim();

      node.properties.type = type;
      if (title) {
        node.properties.title = title;
      }

      if (rest.length) {
        firstParagraph.children = rest;
      } else {
        const pIndex = children.indexOf(firstParagraph);
        if (pIndex > -1) {
          children.splice(pIndex, 1);
        }
      }
      node.tagName = "admonition";
    });
  };
}
