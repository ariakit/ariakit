/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";
import GithubSlugger from "github-slugger";
import { encodeBase64 } from "./base64.ts";

type MdastPlugin = NonNullable<SatteriProcessorOptions["mdastPlugins"]>[number];

type HastPlugin = NonNullable<SatteriProcessorOptions["hastPlugins"]>[number];

type MdastPluginInput = MdastPlugin | (() => MdastPlugin);

type HastPluginInput = HastPlugin | (() => HastPlugin);

interface SatteriAsTagNamePluginOptions {
  tags: string[];
}

function isParagraphWithText(
  node: Parameters<NonNullable<MdastPlugin["paragraph"]>>[0] | null,
  ctx: Parameters<NonNullable<MdastPlugin["paragraph"]>>[1],
  text: string,
) {
  if (!node) return false;
  const content = ctx.textContent(node).trim().toLowerCase();
  const lowerText = text.toLowerCase();
  return content === lowerText || content === `${lowerText}:`;
}

function isAdjacentInSource(
  source: string,
  previous: { position?: { end: { offset?: number } } },
  next: { position?: { start: { offset?: number } } },
) {
  const start = previous.position?.end.offset;
  const end = next.position?.start.offset;
  if (start == null || end == null) return false;
  const bytes = new TextEncoder().encode(source);
  if (start < 0 || end < start || end > bytes.length) return false;
  const text = new TextDecoder().decode(bytes.subarray(start, end));
  return /^\s*$/.test(text);
}

function getData(node: { data?: unknown }) {
  if (!node.data || typeof node.data !== "object") {
    return {};
  }
  return node.data;
}

function getHProperties(data: { hProperties?: unknown }) {
  if (!data.hProperties || typeof data.hProperties !== "object") {
    return {};
  }
  return data.hProperties;
}

export function satteriCodeBlockMdastPlugin() {
  const factory = () => {
    let previousCode: string | null = null;
    let lastParagraph:
      | Parameters<NonNullable<MdastPlugin["paragraph"]>>[0]
      | null = null;

    return {
      name: "ariakit-code-block-mdast",
      paragraph(node) {
        lastParagraph = node;
      },
      code(node, ctx) {
        const metastring = node.meta ?? "";
        const isPreviousCode = metastring.includes("previousCode");

        if (isPreviousCode) {
          previousCode = node.value;
          const nextMetastring = metastring.replace("previousCode", "").trim();
          ctx.setProperty(node, "meta", nextMetastring || null);
          if (
            lastParagraph &&
            isParagraphWithText(lastParagraph, ctx, "Before") &&
            isAdjacentInSource(ctx.source, lastParagraph, node)
          ) {
            ctx.removeNode(lastParagraph);
          }
          ctx.removeNode(node);
          lastParagraph = null;
          return;
        }

        if (previousCode) {
          const data = getData(node);
          const hProperties = getHProperties(data);
          ctx.setProperty(node, "data", {
            ...data,
            hProperties: {
              ...hProperties,
              previousCode: encodeBase64(previousCode),
            },
          });
          if (
            lastParagraph &&
            isParagraphWithText(lastParagraph, ctx, "After") &&
            isAdjacentInSource(ctx.source, lastParagraph, node)
          ) {
            ctx.removeNode(lastParagraph);
          }
          previousCode = null;
        }

        lastParagraph = null;
      },
    } satisfies MdastPlugin;
  };
  return factory as MdastPluginInput as MdastPlugin;
}

export function satteriCodeBlockHastPlugin() {
  return {
    name: "ariakit-code-block-hast",
    element: {
      filter: ["pre"],
      visit(node, ctx) {
        const codeNode = node.children?.find((child) => {
          return child.type === "element" && child.tagName === "code";
        });
        if (!codeNode || codeNode.type !== "element") return;

        const meta = (codeNode.data as { meta?: unknown } | undefined)?.meta;
        if (typeof meta === "string" && meta.trim()) {
          ctx.setProperty(codeNode, "metastring", meta);
        }

        const previousCode = node.properties?.previousCode;
        if (typeof previousCode === "string") {
          ctx.setProperty(codeNode, "previousCode", previousCode);
          ctx.setProperty(node, "previousCode", null);
        }
      },
    },
  } satisfies HastPlugin;
}

export function satteriAsTagNamePlugin({
  tags,
}: SatteriAsTagNamePluginOptions) {
  return {
    name: "ariakit-as-tag-name",
    element: {
      filter: tags,
      visit(node, ctx) {
        ctx.setProperty(node, "as", node.tagName);
      },
    },
  } satisfies HastPlugin;
}

export function satteriAutolinkHeadingsPlugin() {
  return {
    name: "ariakit-autolink-headings",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        const id = node.properties?.id;
        if (typeof id !== "string") return;
        ctx.replaceNode(node, {
          ...node,
          children: [
            {
              type: "element",
              tagName: "a",
              properties: { href: `#${id}` },
              children: node.children ?? [],
            },
          ],
        });
      },
    },
  } satisfies HastPlugin;
}

export function satteriHeadingIdsPlugin() {
  const factory = () => {
    const slugger = new GithubSlugger();
    return {
      name: "ariakit-heading-ids",
      element: {
        filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
        visit(node, ctx) {
          const existingId = node.properties?.id;
          if (typeof existingId === "string") return;
          ctx.setProperty(node, "id", slugger.slug(ctx.textContent(node)));
        },
      },
    } satisfies HastPlugin;
  };
  return factory as HastPluginInput as HastPlugin;
}

export function satteriAdmonitionsPlugin() {
  return {
    name: "ariakit-admonitions",
    element: {
      filter: ["blockquote"],
      visit(node, ctx) {
        const children = node.children ?? [];
        const firstParagraph = children.find((child) => {
          return child.type === "element" && child.tagName === "p";
        });
        if (!firstParagraph || firstParagraph.type !== "element") return;

        const text = ctx.textContent(firstParagraph).trim();
        const match = text.match(/^\[!(\w+)\]\s*(.*)?$/);
        if (!match) return;

        const type = match[1]?.toLowerCase();
        const title = match[2]?.trim();
        if (!type) return;

        ctx.replaceNode(node, {
          ...node,
          tagName: "admonition",
          properties: {
            ...node.properties,
            type,
            ...(title ? { title } : {}),
          },
          children: children.filter((child) => child !== firstParagraph),
        });
      },
    },
  } satisfies HastPlugin;
}
