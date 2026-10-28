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
   * Secondary text under the label, such as the number of examples.
   */
  description?: string;
  /**
   * The static markup of the page thumbnail.
   */
  thumbnail?: string;
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

// The inline script in the layout toggles panels by these ids, because the
// shell renders without hydration.
export const APP_NAVIGATION_ID = "app-navigation";
export const APP_DRAWER_ID = "app-drawer";
export const THEME_PANEL_ID = "app-theme";
