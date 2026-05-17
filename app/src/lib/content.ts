/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { invariant } from "@ariakit/core/utils/misc";
import type { MarkdownProcessor, RehypePlugin } from "@astrojs/markdown-remark";
import type { CollectionEntry } from "astro:content";
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

let markdownProcessor: MarkdownProcessor | null = null;

async function getMarkdownProcessor() {
  if (markdownProcessor) {
    return markdownProcessor;
  }
  const [{ createMarkdownProcessor }, { rehypeAsTagName }] = await Promise.all([
    import("@astrojs/markdown-remark"),
    import("./rehype.ts"),
  ]);
  markdownProcessor = await createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeAsTagName as RehypePlugin,
        { tags: ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"] },
      ],
    ],
  });
  return markdownProcessor;
}

export async function markdownToHtml(markdownString: string) {
  const processor = await getMarkdownProcessor();
  const result = await processor.render(markdownString);
  return result.code;
}

export async function descriptionToText(
  body: string | undefined,
  framework: Framework,
) {
  if (!body) return;
  const frameworkLabel = getFramework(framework).label;
  let markdown = "";
  for (const line of body.split("\n")) {
    if (!line.trimStart().startsWith("import ")) {
      markdown += `${line}\n`;
    }
  }
  markdown = markdown
    .split("{getFramework(props.framework).label}")
    .join(frameworkLabel);
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
  const [{ unified }, { default: rehypeParse }, { toText }] = await Promise.all(
    [import("unified"), import("rehype-parse"), import("hast-util-to-text")],
  );
  const html = await markdownToHtml(markdown);
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);
  const text = toText(tree).replace(/\s+/g, " ").trim();
  return text || undefined;
}
