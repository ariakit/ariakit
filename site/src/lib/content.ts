/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { CollectionEntry, RenderResult } from "astro:content";
import { invariant } from "@ariakit/core/utils/misc";
import type { MarkdownProcessor } from "@astrojs/markdown-remark";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import type { Element } from "hast";
import { toText } from "hast-util-to-text";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { createContainer } from "./astro.ts";
import { isFramework } from "./frameworks.ts";
import { rehypeAsTagName } from "./rehype.ts";
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
  markdownProcessor = await createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypeAsTagName,
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

interface Section {
  parent: string | null;
  id: string | null;
  title: string | null;
  content: string[];
}

export async function contentToText(
  component: RenderResult["Content"],
  props: Record<string, any>,
) {
  const container = await createContainer({
    renderers: ["mdx", "react"],
    client: true,
  });
  const result = await container.renderToString(component, { props });
  const sections = parseContentToSections(result);
  return sections;
}

export function parseContentToSections(html: string): Section[] {
  const tree = unified().use(rehypeParse, { fragment: true }).parse(html);

  const sections: Section[] = [
    { id: null, parent: null, title: null, content: [] },
  ];
  const parentHeadings: Element[] = [];

  for (const node of tree.children) {
    if (node.type !== "element") continue;

    const { tagName } = node;
    const isHeading = /^h[1-6]$/.test(tagName);

    if (isHeading) {
      const { id } = node.properties || {};
      if (typeof id === "string") {
        const level = parseInt(tagName.charAt(1), 10);
        while (parentHeadings.length > 0) {
          const parentHeading = parentHeadings[parentHeadings.length - 1];
          if (!parentHeading) break;
          const parentLevel = parseInt(parentHeading.tagName.charAt(1), 10);
          if (parentLevel >= level) {
            parentHeadings.pop();
          } else {
            break;
          }
        }
        const parentHeading = parentHeadings[parentHeadings.length - 1];
        const parent = parentHeading?.properties?.id;
        const newSection: Section = {
          id,
          parent: typeof parent === "string" ? parent : null,
          // @ts-ignore TODO: Remove this comment once we fully migrate the site
          title: toText(node),
          content: [],
        };
        sections.push(newSection);
        // @ts-ignore TODO: Remove this comment once we fully migrate the site
        parentHeadings.push(node);
        continue;
      }
    }

    // @ts-ignore TODO: Remove this comment once we fully migrate the site
    const content = toText(node).trim();
    if (content) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        lastSection.content.push(content);
      }
    }
  }

  return sections.filter((s) => s.id || s.content.length > 0);
}

export async function descriptionToText(
  component: RenderResult["Content"] | undefined,
  framework: Framework,
  components: Record<string, any>,
) {
  if (!component) return;
  const sections = await contentToText(component, {
    framework,
    components,
  });
  return sections[0]?.content[0];
}
