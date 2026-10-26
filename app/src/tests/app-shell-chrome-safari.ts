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
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

const recipePath = "/react/recipes/app-shell/";

// Safari doesn't focus a clicked button without a tabindex attribute, and the
// theme buttons don't hydrate. The panel returns focus to the Theme button only
// when focus is still inside the panel as it closes.
test("theme panel returns focus to the Theme button when Close theme is clicked", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, recipePath);
  const themeButton = q.button("Theme", { exact: true });
  const closeButton = query(q.complementary("Theme")).button("Close theme");
  await themeButton.click();
  await expect(closeButton).toBeFocused();
  await closeButton.click();
  await expect(q.complementary("Theme")).not.toBeVisible();
  await expect(themeButton).toBeFocused();
});
