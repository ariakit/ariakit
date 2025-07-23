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
import mdxRenderer from "@astrojs/mdx/server.js";
import reactRenderer from "@astrojs/react/server.js";
import { experimental_AstroContainer } from "astro/container";
import type { Element } from "hast";
import { toText } from "hast-util-to-text";
import rehypeParse from "rehype-parse";
import { unified } from "unified";
import { isFramework } from "./frameworks.ts";

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
  const path = `${groupPath}/${id}`;
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

export function getGalleryLength(
  examples: CollectionEntry<"examples">[],
  galleries: CollectionEntry<"galleries">[],
) {
  return examples.reduce((acc, example) => {
    const gallery = galleries.find((g) => g.id === example.id);
    return acc + (gallery?.data.length || 1);
  }, 0);
}

interface Section {
  parent: string | null;
  id: string | null;
  title: string | null;
  content: string[];
}

export async function renderContentToString(
  component: RenderResult["Content"],
  props: Record<string, any>,
) {
  const container = await experimental_AstroContainer.create();
  const getServerRenderer = (renderer: typeof mdxRenderer) => ({
    name: renderer.name,
    renderer: renderer,
  });
  container.addServerRenderer(getServerRenderer(mdxRenderer));
  container.addServerRenderer(getServerRenderer(reactRenderer));

  container.addClientRenderer({
    name: "@astrojs/react",
    entrypoint: "@astrojs/react/client.js",
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
