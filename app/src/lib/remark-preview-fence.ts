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
import { tokenizeCodeFenceMeta } from "./code-fence.ts";

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

/** The lines that the code of a card shows before its expand button. */
const MAX_LINES = 12;

// Returns the meta of an html preview fence without the preview word, or
// undefined for any other fence. The code fence tokenizer keeps quoted text
// whole, so a title such as "A preview card" keeps its word. The code sits
// under the example, so long code collapses unless the fence sets its own
// maxLines, and the card stays short.
function getPreviewMeta(node: CodeNode) {
  if (node.lang !== "html") return;
  const tokens = tokenizeCodeFenceMeta(node.meta ?? "");
  const isName = (token: (typeof tokens)[number], name: string) =>
    token.type === "name" && token.raw === name;
  if (!tokens.some((token) => isName(token, PREVIEW_WORD))) return;
  const words = tokens
    .filter((token) => !isName(token, PREVIEW_WORD))
    .map((token) => token.raw);
  const hasMaxLines = tokens.some(
    (token) => token.type === "pair" && token.key === "maxLines",
  );
  if (!hasMaxLines) {
    words.push(`maxLines=${MAX_LINES}`);
  }
  return words.join(" ");
}

/**
 * Renders each `html preview` code fence in an MDX file as an `ExampleCard`,
 * which shows the markup live above its code. The fence keeps its code, so
 * readers and agents see the same markup that the page renders. Code longer
 * than 12 lines collapses. This plugin runs before `remarkCodeFences`, which
 * renders the fence in the card as a code block and would report the preview
 * word as an unknown option.
 *
 * ````md
 * ```html preview
 * <div class="ak-layer ak-frame ak-frame-2xl/4">Card</div>
 * ```
 * ````
 */
export function remarkPreviewFences() {
  return (tree: ParentNode, file: FenceFile) => {
    // Plain Markdown has no components, so only MDX files get the card.
    if (!file.path?.endsWith(".mdx")) return;
    visit(tree, "code", (node: CodeNode, index, parent?: ParentNode) => {
      if (!parent || index == null) return;
      const meta = getPreviewMeta(node);
      if (meta === undefined) return;
      const code = { ...node, meta };
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
