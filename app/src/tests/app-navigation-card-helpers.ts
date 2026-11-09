/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

/** Opens a page with the site navigation, and returns its queries. */
export async function gotoPage(page: Page, path = "/react/recipes/tabs/") {
  await gotoAndSettle(page, path);
  // Astro removes the ssr attribute once the island hydrates, and the links
  // open no card before that.
  const navigation = query(page).navigation("Site");
  await expect(navigation.locator("astro-island[ssr]")).toHaveCount(0);
  return query(navigation);
}
