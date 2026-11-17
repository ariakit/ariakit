/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { visit } from "unist-util-visit";

interface CodeNode {
  type: "code";
  lang?: string | null;
  meta?: string | null;
  value: string;
}

interface ParentNode {
  type: string;
  children: unknown[];
}

interface FenceFile {
  path?: string;
}

/** The info string word that turns an HTML code fence into a live example. */
const PREVIEW_WORD = "preview";

function isPreviewFence(node: CodeNode) {
  if (node.lang !== "html") return false;
  const words = node.meta?.split(/\s+/) ?? [];
  return words.includes(PREVIEW_WORD);
}

function getMetaWithoutPreview(meta?: string | null) {
  const words = meta?.split(/\s+/).filter((word) => {
    return word && word !== PREVIEW_WORD;
  });
  return words?.length ? words.join(" ") : null;
}

/**
 * Renders each `html preview` code fence in an MDX file as an `ExampleCard`,
 * which shows the markup live next to its code. The fence keeps its code, so
 * readers and agents see the same markup that the page renders.
 *
 * ````md
 * ```html preview
 * <div class="ak-layer ak-frame-card/card">Card</div>
 * ```
 * ````
 */
export function remarkPreviewFences() {
  return (tree: ParentNode, file: FenceFile) => {
    // Plain Markdown has no components, so only MDX files get the card.
    if (!file.path?.endsWith(".mdx")) return;
    visit(tree, "code", (node: CodeNode, index, parent?: ParentNode) => {
      if (!parent || index == null) return;
      if (!isPreviewFence(node)) return;
      const code = { ...node, meta: getMetaWithoutPreview(node.meta) };
      parent.children[index] = {
        type: "mdxJsxFlowElement",
        name: "ExampleCard",
        attributes: [
          { type: "mdxJsxAttribute", name: "html", value: node.value },
        ],
        children: [code],
      };
    });
  };
}
