/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { invariant } from "@ariakit/utils";
import type { CollectionEntry } from "astro:content";
import GithubSlugger from "github-slugger";
import { toText } from "hast-util-to-text";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSmartypants from "remark-smartypants";
import { unified } from "unified";
import type { Plugin } from "unified";
import { getFramework, isFramework } from "./frameworks.ts";
import type { Framework } from "./schemas.ts";

interface ContentGroup {
  type: "examples" | "components" | "styles";
  label: string;
  path: string | ((framework: Framework) => string);
}

const contentGroups: Record<string, ContentGroup> = {
  "ariakit-react": {
    type: "components",
    label: "Components",
    path: (framework) => `${framework}/components`,
  },
  "ariakit-solid": {
    type: "components",
    label: "Components",
    path: (framework) => `${framework}/components`,
  },
  "ariakit-tailwind": {
    type: "styles",
    label: "Styles",
    path: "styles",
  },
  examples: {
    type: "examples",
    label: "Examples",
    path: "examples",
  },
};

function getGroupPath(group: ContentGroup, framework?: Framework) {
  if (typeof group.path === "string") {
    return group.path;
  }
  invariant(framework, "Framework is required to get the group path");
  return group.path(framework);
}

export function getGuideDetail(entry: CollectionEntry<"guides">) {
  const [groupKey, id] = entry.id.split("/");
  invariant(groupKey, "Guide must belong to a group or framework");
  invariant(id, "Guide must have an id");
  const group = contentGroups[groupKey];
  invariant(
    group,
    `Invalid group key. Must be one of: ${Object.keys(contentGroups).join(", ")}`,
  );
  const segments = groupKey.split("-");
  const framework = segments.find((segment) => isFramework(segment));
  const groupPath = `/${getGroupPath(group, framework)}`;
  const path = `${groupPath}/${id}/`;
  return {
    ...entry,
    path,
    framework,
    groupLabel: group.label,
    groupPath,
    type: group.type,
  };
}

export function filterGuidesByGroup(groupPath: string) {
  return (entry: CollectionEntry<"guides">) => {
    const guide = getGuideDetail(entry);
    return guide.groupPath === groupPath;
  };
}

export interface FilterPreviewsParams {
  type?: "examples" | "components";
  entries?: CollectionEntry<"examples" | "components">[];
  framework?: Framework;
}

export function filterPreviews(
  params: FilterPreviewsParams,
): (preview: CollectionEntry<"previews">) => boolean;

export function filterPreviews(
  previews: CollectionEntry<"previews">[],
  params: FilterPreviewsParams,
): CollectionEntry<"previews">[];

export function filterPreviews(
  previewsOrParams: CollectionEntry<"previews">[] | FilterPreviewsParams,
  params: FilterPreviewsParams = {},
) {
  const hasPreviews = Array.isArray(previewsOrParams);
  params = !Array.isArray(previewsOrParams) ? previewsOrParams : params;
  const filter = (preview: CollectionEntry<"previews">) => {
    if (params.type) {
      const isComponentPreview = preview.id.endsWith("_component");
      if (params.type === "examples" && isComponentPreview) return false;
      if (params.type === "components" && !isComponentPreview) return false;
    }
    if (params.framework) {
      if (!preview.data.frameworks.includes(params.framework)) return false;
    }
    if (params.entries) {
      const isEntryPreview = params.entries.some((entry) => {
        if (preview.id === entry.id) return true;
        return preview.id.startsWith(`${entry.id}/`);
      });
      if (!isEntryPreview) return false;
    }
    return true;
  };
  return hasPreviews ? previewsOrParams.filter(filter) : filter;
}

interface HastNode {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
}

const asTagNameTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"]);

function isHastNode(value: unknown): value is HastNode {
  return !!value && typeof value === "object";
}

function visitHast(node: unknown, callback: (node: HastNode) => void) {
  if (!isHastNode(node)) return;
  callback(node);
  for (const child of node.children ?? []) {
    visitHast(child, callback);
  }
}

const rehypeAsTagName: Plugin = () => (tree) => {
  visitHast(tree, (node) => {
    if (node.type !== "element") return;
    if (!node.tagName) return;
    if (!asTagNameTags.has(node.tagName)) return;
    node.properties ??= {};
    node.properties.as = node.tagName;
  });
};

const rehypeHeadingIds: Plugin = () => (tree) => {
  const slugger = new GithubSlugger();
  visitHast(tree, (node) => {
    if (node.type !== "element") return;
    if (!node.tagName) return;
    if (!/^h[1-6]$/.test(node.tagName)) return;
    node.properties ??= {};
    if (typeof node.properties.id === "string") return;
    node.properties.id = slugger.slug(
      toText(node as Parameters<typeof toText>[0]),
    );
  });
};

function createMarkdownProcessor() {
  // This helper runs inside Cloudflare prerendering. Keep it on unified until
  // Satteri's WASI browser binding can load its wasm in workerd.
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHeadingIds)
    .use(rehypeAsTagName)
    .use(rehypeStringify, { allowDangerousHtml: true });
}

let markdownProcessor: ReturnType<typeof createMarkdownProcessor> | null = null;

function getMarkdownProcessor() {
  if (markdownProcessor) {
    return markdownProcessor;
  }
  markdownProcessor = createMarkdownProcessor();
  return markdownProcessor;
}

export async function markdownToHtml(markdownString: string) {
  const result = await getMarkdownProcessor().process(markdownString);
  return String(result);
}

function unwrapContentLinks(markdown: string) {
  while (true) {
    const start = markdown.indexOf("<ContentLink");
    if (start < 0) break;
    const openEnd = markdown.indexOf(">", start);
    if (openEnd < 0) break;
    const closeStart = markdown.indexOf("</ContentLink>", openEnd);
    if (closeStart < 0) break;
    const closeEnd = closeStart + "</ContentLink>".length;
    markdown =
      markdown.slice(0, start) +
      markdown.slice(openEnd + 1, closeStart) +
      markdown.slice(closeEnd);
  }
  return markdown;
}

function getDescriptionMarkdown(body: string, framework: Framework) {
  const frameworkLabel = getFramework(framework).label;
  const lines = body.split("\n").filter((line) => {
    return !line.trimStart().startsWith("import ");
  });
  const markdown = lines
    .join("\n")
    .split("{getFramework(props.framework).label}")
    .join(frameworkLabel);
  return unwrapContentLinks(markdown);
}

export async function descriptionToText(
  body: string | undefined,
  framework: Framework,
) {
  if (!body) return;
  const markdown = getDescriptionMarkdown(body, framework);
  const html = await markdownToHtml(markdown);
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  for (const node of tree.children) {
    const text = toText(node).replace(/\s+/g, " ").trim();
    if (!text) continue;
    invariant(
      !/[<{}]/.test(text),
      `descriptionToText: unsupported MDX in description (got: ${text})`,
    );
    return text;
  }
  return undefined;
}
