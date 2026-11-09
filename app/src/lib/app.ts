/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

export interface AppLink {
  href: string;
  label: string;
  current: boolean;
  /**
   * The number of examples on the page, which shows at the end of the link.
   */
  count?: number;
  /**
   * The examples of the page, in page order. A card shows them while the mouse
   * pointer rests on the link.
   */
  examples?: AppLinkExample[];
}

/** An example that a navigation card shows from its preview page. */
export interface AppLinkExample {
  title: string;
  /** The URL of the example in the gallery of its page. */
  href: string;
  /** The URL of the preview page of the example. */
  previewHref: string;
  /** Whether the preview fills a whole page, such as an app shell. */
  fullscreen?: boolean;
}

export interface AppNavigationGroup {
  label: string;
  links: AppLink[];
}

export interface AppHeading {
  slug: string;
  text: string;
  depth: number;
}

/**
 * A preview card in the gallery of a page, which the table of contents lists
 * under the examples heading.
 */
export interface AppExample {
  previewId: string;
  title: string;
  /** Whether the preview fills a whole page, such as an app shell. */
  fullscreen?: boolean;
}

/**
 * Returns the slug, or the slug with the first free numeric suffix when the
 * page already uses it, and adds the result to the used slugs.
 */
export function getUniqueSlug(slugs: Set<string>, slug: string) {
  let unique = slug;
  for (let i = 1; slugs.has(unique); i++) {
    unique = `${slug}-${i}`;
  }
  slugs.add(unique);
  return unique;
}

// The title link of the table of contents targets the page root, so it scrolls
// to the top of the page, above the title.
export const APP_TOP_ID = "top";

/**
 * Returns the ids of the examples heading and of the gallery cards of a page,
 * which the cards are headings under. Each card id comes from the last segment
 * of its preview id, such as `shortcuts` for `tooltip/shortcuts`, and stays
 * clear of the ids of the page headings.
 */
export function getGalleryIds(headings: AppHeading[], examples: AppExample[]) {
  const slugs = new Set([
    APP_TOP_ID,
    ...headings.map((heading) => heading.slug),
  ]);
  const examplesId = getUniqueSlug(slugs, "examples");
  const exampleIds = new Map<string, string>();
  for (const example of examples) {
    const segment = example.previewId.split("/").at(-1) ?? example.previewId;
    exampleIds.set(example.previewId, getUniqueSlug(slugs, segment));
  }
  return { examplesId, exampleIds };
}

// The inline script in the layout toggles panels by these ids, because the
// shell renders without hydration.
export const APP_NAVIGATION_ID = "app-navigation";
export const APP_DRAWER_ID = "app-drawer";
export const THEME_PANEL_ID = "app-theme";
