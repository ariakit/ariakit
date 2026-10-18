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

// The inline script in the layout toggles panels by these ids, because the
// shell renders without hydration.
export const APP_NAVIGATION_ID = "app-navigation";
export const APP_DRAWER_ID = "app-drawer";
export const THEME_PANEL_ID = "app-theme";
