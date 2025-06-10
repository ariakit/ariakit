import type { Element, Root, RootContent, Text } from "hast";
import { toText } from "hast-util-to-text";
import { visit } from "unist-util-visit";

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
): boolean {
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

function markPrecedingParagraphForRemoval(
  nodes: RootContent[],
  preNodeIndex: number,
  text: string,
  indicesToRemove: number[],
) {
  let prevIndex = preNodeIndex - 1;
  let prevNode = nodes[prevIndex];

  // Skip over text nodes (like newlines) between the paragraph and the code
  // block
  while (prevNode?.type === "text") {
    indicesToRemove.push(prevIndex);
    prevIndex--;
    prevNode = nodes[prevIndex];
  }

  if (isParagraphWithText(prevNode, text)) {
    indicesToRemove.push(prevIndex);
  }
}

/**
 * This plugin removes the preceding paragraph of the code block if it has the
 * text "Before" or "After". It also adds the previous code to the code block's
 * metastring.
 */
export function rehypePreviousCode() {
  return (tree: Root) => {
    visit(tree, "root", (root) => {
      if (root.type !== "root") return;

      const indicesToRemove: number[] = [];
      let previousCode: string | null = null;
      const { children } = root;

      for (const [i, node] of children.entries()) {
        if (node.type !== "element") continue;
        if (node.tagName !== "pre") continue;

        const codeNode = getCodeNode(node);
        if (!codeNode) continue;

        const { metastring } = codeNode.properties;

        if (
          typeof metastring === "string" &&
          metastring.includes("previousCode")
        ) {
          const text = getCodeText(codeNode);
          if (text) {
            previousCode = text;
            codeNode.properties.metastring = metastring
              .replace("previousCode", "")
              .trim();
            markPrecedingParagraphForRemoval(
              children,
              i,
              "Before",
              indicesToRemove,
            );
            indicesToRemove.push(i);
          }
        } else if (previousCode) {
          codeNode.properties.previousCode = btoa(previousCode);
          markPrecedingParagraphForRemoval(
            children,
            i,
            "After",
            indicesToRemove,
          );
          previousCode = null;
        }
      }

      const uniqueIndices = [...new Set(indicesToRemove)];
      uniqueIndices.sort((a, b) => b - a);

      for (const index of uniqueIndices) {
        children.splice(index, 1);
      }
    });
  };
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

      const text = toText(firstParagraph).trim();
      const match = text.match(/^\[!(\w+)\]\s*(.*)?$/);

      if (!match) return;

      const type = match[1]?.toLowerCase();
      const title = match[2]?.trim();

      node.properties.type = type;
      if (title) {
        node.properties.title = title;
      }

      // Remove the paragraph with the admonition type and title
      const pIndex = children.indexOf(firstParagraph);
      if (pIndex > -1) {
        children.splice(pIndex, 1);
      }
      node.tagName = "admonition";
    });
  };
}
