/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

export interface SiteLink {
  href: string;
  label: string;
  current?: boolean;
}

export interface SiteNavigationGroup {
  label: string;
  links: SiteLink[];
}

export interface SiteHeading {
  slug: string;
  text: string;
  depth: number;
}

// The inline script in the layout toggles panels by these ids, because the
// shell renders without hydration.
export const SITE_NAVIGATION_ID = "site-navigation";
export const SITE_DRAWER_ID = "site-drawer";
export const THEME_PANEL_ID = "site-theme";
