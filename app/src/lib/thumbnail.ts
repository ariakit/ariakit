/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ComponentType } from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/**
 * `large` thumbnails fill page cards. `small` thumbnails fill navigation slots,
 * so they draw only coarse shapes.
 */
export type ThumbnailSize = "large" | "small";

/** A page entry with a thumbnail, such as a recipe or a component. */
export interface ThumbnailEntry {
  id: string;
  collection: "recipes" | "components";
}

/**
 * Imports the thumbnail of a recipe or a component page. The default export of
 * its `thumbnail.react.tsx` file is the large thumbnail, and `SmallThumbnail`
 * is the small one. Large scenes do not fit a slot, so a file without a small
 * thumbnail returns nothing for the small size.
 */
export async function importThumbnail(
  entry: ThumbnailEntry,
  size: ThumbnailSize = "large",
) {
  try {
    // Vite resolves dynamic imports only from static path templates, so each
    // content directory needs its own import.
    const module =
      entry.collection === "recipes"
        ? await import(`../recipes/${entry.id}/thumbnail.react.tsx`)
        : await import(`../component-docs/${entry.id}/thumbnail.react.tsx`);
    const Thumbnail = size === "small" ? module.SmallThumbnail : module.default;
    return Thumbnail as ComponentType | undefined;
  } catch (_error) {
    console.log(`Missing thumbnail for ${entry.collection}/${entry.id}`);
    return;
  }
}

// Thumbnails are pure static markup, but page cards render them repeatedly —
// reference items alone request the same thumbnail thousands of times across
// partial pages. Cache per name during production builds only, so dev keeps
// re-rendering after thumbnail edits.
const thumbnailCache = new Map<string, string | undefined>();

export async function renderThumbnail(
  entry: ThumbnailEntry,
  size: ThumbnailSize = "large",
) {
  const cacheKey = `${size}:${entry.collection}/${entry.id}`;
  if (import.meta.env.PROD && thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey);
  }
  const Thumbnail = await importThumbnail(entry, size);
  const html = Thumbnail
    ? renderToStaticMarkup(createElement(Thumbnail))
    : undefined;
  if (import.meta.env.PROD) {
    thumbnailCache.set(cacheKey, html);
  }
  return html;
}
