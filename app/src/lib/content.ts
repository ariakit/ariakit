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
import { unified as createUnifiedProcessor } from "@astrojs/markdown-remark";
import type { MarkdownRenderer } from "@astrojs/markdown-remark";
import type { CollectionEntry } from "astro:content";
import { toText } from "hast-util-to-text";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { getFramework, isFramework } from "./framework.ts";
import type { RecipeCategory } from "./recipe-categories.ts";
import { RECIPE_CATEGORIES } from "./schemas.ts";
import type { Framework } from "./schemas.ts";

interface ContentGroup {
  type: "recipes" | "components" | "styles";
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
  recipes: {
    type: "recipes",
    label: "Recipes",
    path: "recipes",
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

/** A page entry whose examples are previews, such as a recipe. */
export interface PreviewOwnerEntry {
  id: string;
  collection: "recipes" | "components";
}

/** A recipe with the components that its frontmatter lists. */
export interface ComponentRecipeEntry extends PreviewOwnerEntry {
  collection: "recipes";
  data: { components: { id: string }[] };
}

/** The fields of a recipe or component that order the site navigation. */
export interface NavigationOrderData {
  title: string;
  category?: RecipeCategory;
}

function getCategoryIndex(data: NavigationOrderData) {
  if (!data.category) return -1;
  return RECIPE_CATEGORIES.indexOf(data.category);
}

/**
 * Compares entries in the order of the site navigation. Entries of the same
 * category stay together, in the order of the categories, and the titles order
 * the entries in a category.
 */
export function compareNavigationOrder(
  a: NavigationOrderData,
  b: NavigationOrderData,
) {
  const categoryOrder = getCategoryIndex(a) - getCategoryIndex(b);
  return categoryOrder || a.title.localeCompare(b.title);
}

let markdownRenderer: MarkdownRenderer | null = null;

async function getMarkdownRenderer() {
  if (markdownRenderer) {
    return markdownRenderer;
  }
  markdownRenderer = await createUnifiedProcessor({}).createRenderer({
    syntaxHighlight: false,
  });
  return markdownRenderer;
}

// Rendering markdown is a pure text transform, and reference descriptions
// repeat heavily (inherited props share docs across components and frameworks),
// so memoizing by source string collapses thousands of renders into a few
// hundred unique ones.
const markdownHtmlCache = new Map<string, Promise<string>>();

export function markdownToHtml(markdownString: string) {
  const cached = markdownHtmlCache.get(markdownString);
  if (cached) return cached;
  const promise = (async () => {
    const renderer = await getMarkdownRenderer();
    const result = await renderer.render(markdownString);
    return result.code;
  })();
  markdownHtmlCache.set(markdownString, promise);
  // Drop rejected renders so a transient failure is not cached forever.
  promise.catch(() => markdownHtmlCache.delete(markdownString));
  return promise;
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
