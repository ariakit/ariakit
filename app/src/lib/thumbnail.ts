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

/**
 * Imports the thumbnail of an example. The default export of its
 * `thumbnail.react.tsx` file is the large thumbnail, and `SmallThumbnail` is
 * the small one. Large scenes do not fit a slot, so a file without a small
 * thumbnail returns nothing for the small size.
 */
export async function importThumbnail(
  name?: string,
  size: ThumbnailSize = "large",
) {
  if (!name) return;
  const example = name.split("/").shift();
  try {
    const module = await import(`../examples/${example}/thumbnail.react.tsx`);
    const Thumbnail = size === "small" ? module.SmallThumbnail : module.default;
    return Thumbnail as ComponentType | undefined;
  } catch (_error) {
    console.log(`Missing thumbnail for ${name}`);
    return;
  }
}

// Thumbnails are pure static markup, but page cards render them repeatedly —
// reference items alone request the same thumbnail thousands of times across
// partial pages. Cache per name during production builds only, so dev keeps
// re-rendering after thumbnail edits.
const thumbnailCache = new Map<string, string | undefined>();

export async function renderThumbnail(
  name?: string,
  size: ThumbnailSize = "large",
) {
  if (!name) return;
  const cacheKey = size + ":" + name;
  if (import.meta.env.PROD && thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey);
  }
  const Thumbnail = await importThumbnail(name, size);
  const html = Thumbnail
    ? renderToStaticMarkup(createElement(Thumbnail))
    : undefined;
  if (import.meta.env.PROD) {
    thumbnailCache.set(cacheKey, html);
  }
  return html;
}
