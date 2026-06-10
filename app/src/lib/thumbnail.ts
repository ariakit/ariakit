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

export async function importThumbnail(name?: string) {
  if (!name) return;
  const example = name.split("/").shift();
  try {
    const { default: Thumbnail } = await import(
      `../examples/${example}/thumbnail.react.tsx`
    );
    return Thumbnail as ComponentType;
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

export async function renderThumbnail(name?: string) {
  if (!name) return;
  if (import.meta.env.PROD && thumbnailCache.has(name)) {
    return thumbnailCache.get(name);
  }
  const Thumbnail = await importThumbnail(name);
  const html = Thumbnail
    ? renderToStaticMarkup(createElement(Thumbnail))
    : undefined;
  if (import.meta.env.PROD) {
    thumbnailCache.set(name, html);
  }
  return html;
}
