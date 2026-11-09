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

/** A page entry with a cover, such as a recipe or a component. */
export interface CoverEntry {
  id: string;
  collection: "recipes" | "components";
}

/**
 * Imports the cover of a recipe or a component page: the default export of its
 * `cover.react.tsx` file, which draws the scene of its card in the collection
 * list.
 */
export async function importCover(entry: CoverEntry) {
  try {
    // Vite resolves dynamic imports only from static path templates, so each
    // content directory needs its own import.
    const module =
      entry.collection === "recipes"
        ? await import(`../recipes/${entry.id}/cover.react.tsx`)
        : await import(`../component-docs/${entry.id}/cover.react.tsx`);
    return module.default as ComponentType | undefined;
  } catch (_error) {
    console.log(`Missing cover for ${entry.collection}/${entry.id}`);
    return;
  }
}

/** Renders the cover of a recipe or a component page to static markup. */
export async function renderCover(entry: CoverEntry) {
  const Cover = await importCover(entry);
  if (!Cover) return;
  return renderToStaticMarkup(createElement(Cover));
}
