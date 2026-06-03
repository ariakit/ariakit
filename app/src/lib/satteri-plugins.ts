/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import GithubSlugger from "github-slugger";
import type { Element } from "hast";
import { defineHastPlugin } from "satteri";
import type { HastPluginDefinition } from "satteri";

// Sätteri exposes the code-fence info string on the `<code>` node's `data.meta`
// (and the language on `data.lang`), mirroring mdast-util-to-hast. The hast
// `ElementData` interface doesn't declare these, so we read them through a
// narrow local type instead of augmenting the global module.
interface CodeData {
  lang?: string;
  meta?: string;
}

function getCodeMeta(node: Readonly<Element>): string | undefined {
  const meta = (node.data as CodeData | undefined)?.meta;
  return typeof meta === "string" ? meta : undefined;
}

function findCodeChild(preNode: Readonly<Element>): Element | undefined {
  return preNode.children.find(
    (child): child is Element =>
      child.type === "element" && child.tagName === "code",
  );
}

/**
 * Mirrors `@astrojs/mdx`'s `rehype-meta-string`: copies the code fence's info
 * string (everything after the language) onto the `<code>` element as a
 * `metastring` attribute. `content-code-block.astro` parses this attribute to
 * resolve highlighted lines/tokens, `lineNumbers`, `maxLines`, etc. Sätteri does
 * not run this step, so we replicate it here.
 */
export function satteriMetaString(): HastPluginDefinition {
  return defineHastPlugin({
    name: "ariakit-meta-string",
    element: {
      filter: ["code"],
      visit(node, ctx) {
        const meta = getCodeMeta(node);
        if (meta) ctx.setProperty(node, "metastring", meta);
      },
    },
  });
}

function isMarkerParagraph(text: string, word: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === word || normalized === `${word}:`;
}

/**
 * Removes the preceding paragraph of the code block if it has the text "Before"
 * or "After", and stores the previous code block's content (base64-encoded) on
 * the following code block as a `previousCode` attribute so the renderer can
 * present a before/after diff.
 *
 * This is a factory so the per-document closure state (`pendingPreviousCode`,
 * `lastParagraph`) resets between files. Sätteri walks nodes in document order
 * and applies mutations from a command buffer, so removing the
 * already-visited "Before"/"After" paragraph works even though the visitor only
 * receives the current node.
 */
// Block-level tags that can sit between a marker paragraph and its code fence.
// The visitor exposes no siblings/positions, so we detect an intervening block
// by visiting these (plus `raw` HTML nodes) and clearing the tracked marker.
const PREVIOUS_CODE_SIBLING_TAGS = [
  "p",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "table",
];

export function satteriPreviousCode(): HastPluginDefinition {
  let pendingPreviousCode: string | null = null;
  let lastMarker: { node: Readonly<Element>; text: string } | null = null;

  // The original rehype plugin only removed a "Before"/"After" marker that was
  // the code block's immediate predecessor (skipping whitespace text nodes).
  // We replicate that adjacency: a marker paragraph sets `lastMarker`, and any
  // other block clears it, so a marker only survives when nothing but
  // whitespace separates it from the next `<pre>`. (Intervening whitespace text
  // nodes are left in place — they collapse in layout and aren't reachable.)
  const clearMarker = () => {
    lastMarker = null;
  };

  return defineHastPlugin({
    name: "ariakit-previous-code",
    // A raw HTML block, an MDX component/import/expression, or any of the block
    // elements below separating the marker from the fence clears the marker, so
    // it only survives across a pure-whitespace gap. (`mdxJsxFlowElement` with an
    // empty filter matches any component.)
    raw: clearMarker,
    mdxjsEsm: clearMarker,
    mdxFlowExpression: clearMarker,
    mdxJsxFlowElement: { filter: [], visit: clearMarker },
    element: {
      filter: PREVIOUS_CODE_SIBLING_TAGS,
      visit(node, ctx) {
        if (node.tagName === "p") {
          const text = ctx.textContent(node);
          lastMarker =
            isMarkerParagraph(text, "before") ||
            isMarkerParagraph(text, "after")
              ? { node, text }
              : null;
          return;
        }
        if (node.tagName !== "pre") {
          clearMarker();
          return;
        }

        const codeNode = findCodeChild(node);
        const meta = codeNode ? (getCodeMeta(codeNode) ?? "") : "";

        if (codeNode && meta.includes("previousCode")) {
          const code = ctx.textContent(codeNode).replace(/\n$/, "");
          // Match the original plugin, which left an empty `previousCode` fence
          // untouched (no state set, nothing removed).
          if (code) {
            pendingPreviousCode = code;
            if (lastMarker && isMarkerParagraph(lastMarker.text, "before")) {
              ctx.removeNode(lastMarker.node);
            }
            ctx.removeNode(node);
          }
        } else if (codeNode && pendingPreviousCode != null) {
          ctx.setProperty(codeNode, "previousCode", btoa(pendingPreviousCode));
          if (lastMarker && isMarkerParagraph(lastMarker.text, "after")) {
            ctx.removeNode(lastMarker.node);
          }
          pendingPreviousCode = null;
        }
        clearMarker();
      },
    },
  });
}

const ADMONITION_REGEX = /^\[!(\w+)\]\s*(.*)?$/;

/**
 * Transforms GitHub-style admonition blockquotes (`> [!NOTE]`) into
 * `<admonition>` elements carrying `type` and an optional `title` attribute,
 * dropping the marker paragraph. Non-admonition blockquotes are left untouched.
 */
export function satteriAdmonitions(): HastPluginDefinition {
  return defineHastPlugin({
    name: "ariakit-admonitions",
    element: {
      filter: ["blockquote"],
      visit(node, ctx) {
        const firstParagraph = node.children.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "p",
        );
        if (!firstParagraph) return;

        const match = ctx
          .textContent(firstParagraph)
          .trim()
          .match(ADMONITION_REGEX);
        if (!match) return;

        const type = match[1]?.toLowerCase();
        const title = match[2]?.trim();

        const properties: Element["properties"] = { ...node.properties };
        if (type) properties.type = type;
        if (title) properties.title = title;

        const children = node.children.filter(
          (child) => child !== firstParagraph,
        );

        ctx.replaceNode(node, {
          type: "element",
          tagName: "admonition",
          properties,
          children,
        });
      },
    },
  });
}

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * Replaces `rehype-autolink-headings` with `behavior: "wrap"`: wraps each
 * heading's content in an anchor that links to the heading's own id.
 *
 * Sätteri's built-in heading-id plugin (which also feeds `getHeadings()` for the
 * table of contents) runs *after* user plugins, so we compute the slug here with
 * the same `github-slugger` it uses and set the `id` ourselves. The built-in
 * plugin then reuses our id instead of generating its own, keeping anchors and
 * the table of contents in sync. Factory so the slugger resets per document.
 */
export function satteriAutolinkHeadings(): HastPluginDefinition {
  const slugger = new GithubSlugger();

  return defineHastPlugin({
    name: "ariakit-autolink-headings",
    element: {
      filter: HEADING_TAGS,
      visit(node, ctx) {
        const existingId =
          typeof node.properties?.id === "string"
            ? node.properties.id
            : undefined;
        const slug = existingId ?? slugger.slug(ctx.textContent(node));
        // Mirror rehype-autolink-headings: only headings that resolve to a
        // non-empty id are wrapped (an empty heading keeps its falsy id).
        if (!slug) return;

        const anchor: Element = {
          type: "element",
          tagName: "a",
          properties: { href: `#${slug}` },
          children: [...node.children],
        };

        ctx.replaceNode(node, {
          type: "element",
          tagName: node.tagName,
          properties: { ...node.properties, id: slug },
          children: [anchor],
        });
      },
    },
  });
}

interface SatteriAsTagNameOptions {
  tags: string[];
}

/**
 * Adds an `as` property mirroring the element's tag name so the polymorphic
 * content components (headings, lists) render the correct element. Stateless, so
 * a single definition is reused across documents.
 */
export function satteriAsTagName({
  tags,
}: SatteriAsTagNameOptions): HastPluginDefinition {
  return defineHastPlugin({
    name: "ariakit-as-tag-name",
    element: {
      filter: tags,
      visit(node, ctx) {
        ctx.setProperty(node, "as", node.tagName);
      },
    },
  });
}
