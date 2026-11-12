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
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

// The hide timeout of the card, which the site navigation sets.
export const HIDE_TIMEOUT = 300;

/** Opens a page with the site navigation, and returns its queries. */
export async function gotoPage(page: Page, path = "/react/recipes/tabs/") {
  await gotoAndSettle(page, path);
  // React drops a mouse move that arrives before it commits the hydration of
  // the island, so a hover then opens no card. Astro removes the ssr attribute
  // of the island before that commit. The server renders the button of the open
  // group collapsed, and the button expands only after the commit. Hydration
  // can outlast the expect timeout on a busy runner, so the wait can take the
  // test timeout, as gotoAndHydrate does.
  const navigation = query(query(page).navigation("Site"));
  await expect(navigation.button(undefined, { expanded: true })).toBeVisible({
    timeout: test.info().timeout,
  });
  return navigation;
}
