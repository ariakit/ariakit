/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getEntry, render } from "astro:content";
import type { AppExample } from "./app.ts";
import { getGalleryIds } from "./app.ts";
import type { ComponentRecipeEntry, PreviewOwnerEntry } from "./content.ts";
import type { Framework } from "./schemas.ts";

/**
 * Returns the examples of a gallery that the framework of the page renders, in
 * page order, from the `examples` field that `remarkGalleryExamples` adds to
 * its remark plugin frontmatter.
 */
export async function getGalleryExamples(
  frontmatter: Record<string, unknown> | undefined,
  framework: Framework,
) {
  const examples = frontmatter?.examples;
  if (!Array.isArray(examples)) return [];
  const previews = await Promise.all(
    examples.map(async (previewId: unknown) => {
      if (typeof previewId !== "string") return;
      return getEntry("previews", previewId);
    }),
  );
  // A card renders nothing for a framework that its preview doesn't support.
  return previews.flatMap((preview): AppExample[] => {
    if (!preview) return [];
    if (!preview.data.frameworks.includes(framework)) return [];
    return [
      {
        previewId: preview.id,
        title: preview.data.title,
        fullscreen: preview.data.fullscreen,
      },
    ];
  });
}

/** An example of an entry, with its place in the gallery of its page. */
export interface EntryExample extends AppExample {
  /** The URL of the example in the gallery of its page. */
  href: string;
}

// The site navigation lists the examples of every entry on each page, so
// production builds read each gallery once. Development reads stay uncached, so
// gallery edits show up.
const entryGalleryCache = new Map<string, Promise<EntryExample[]>>();

function getEntryPage(entry: PreviewOwnerEntry) {
  if (entry.collection === "recipes") {
    return getEntry("recipes", entry.id);
  }
  return getEntry("components", entry.id);
}

/** Returns the examples of the page gallery of an entry, in page order. */
function getEntryGalleryExamples(
  entry: PreviewOwnerEntry,
  framework: Framework,
) {
  const root = entry.collection === "recipes" ? "recipes" : "component-docs";
  const galleryId = `${root}/${entry.id}`;
  const cacheKey = `${framework}:${galleryId}`;
  const cached = import.meta.env.PROD && entryGalleryCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const read = async (): Promise<EntryExample[]> => {
    const [gallery, page] = await Promise.all([
      getEntry("galleries", galleryId),
      getEntryPage(entry),
    ]);
    if (!gallery) return [];
    const [{ remarkPluginFrontmatter }, headings] = await Promise.all([
      render(gallery),
      page ? render(page).then((rendered) => rendered.headings) : [],
    ]);
    const examples = await getGalleryExamples(
      remarkPluginFrontmatter,
      framework,
    );
    // The cards take their ids from the headings of their page, as the layout
    // gives them.
    const { exampleIds } = getGalleryIds(headings, examples);
    const pageHref = `/${framework}/${entry.collection}/${entry.id}/`;
    return examples.map((example) => {
      const id = exampleIds.get(example.previewId);
      return { ...example, href: id ? `${pageHref}#${id}` : pageHref };
    });
  };
  const examples = read();
  if (import.meta.env.PROD) {
    entryGalleryCache.set(cacheKey, examples);
  }
  return examples;
}

export interface GetEntryExamplesParams {
  entry: PreviewOwnerEntry;
  framework: Framework;
  recipes: ComponentRecipeEntry[];
}

/**
 * Returns the examples that demonstrate an entry, in page order, which the
 * sidebar and the collection pages count. A component also lists the examples
 * of the recipes that list it in their `components` frontmatter, after its own.
 */
export async function getEntryExamples({
  entry,
  framework,
  recipes,
}: GetEntryExamplesParams) {
  const entries =
    entry.collection === "recipes"
      ? [entry]
      : [
          entry,
          ...recipes.filter((recipe) =>
            recipe.data.components.some(
              (component) => component.id === entry.id,
            ),
          ),
        ];
  const galleries = await Promise.all(
    entries.map((entry) => getEntryGalleryExamples(entry, framework)),
  );
  return galleries.flat();
}
