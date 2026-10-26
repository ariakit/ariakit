/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";
import { hoverPastShowTimeout, SHOW_TIMEOUT } from "#app/test-utils/tooltip.ts";

const recipePath = "/react/recipes/tooltip/";

/**
 * Hovers an anchor until its tooltip shows. A hidden tooltip isn't in the DOM,
 * so the shown tooltip is what proves that the island hydrated. A hover that
 * arrives before React hydrates the island shows nothing, so it repeats.
 */
async function hoverUntilTooltip(
  page: Page,
  anchor: Locator,
  tooltip: Locator,
) {
  await expect(async () => {
    await page.mouse.move(0, 0);
    await anchor.hover();
    // Each attempt waits past the show timeout of the first tooltip.
    await expect(tooltip).toBeVisible({ timeout: SHOW_TIMEOUT * 2 });
  }).toPass();
}

test("names the header buttons with tooltips on hover and focus", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  const toggle = q.button("Toggle navigation");
  await hoverUntilTooltip(page, toggle, q.tooltip("Toggle navigation"));
  await page.mouse.move(0, 0);
  await expect(q.tooltip("Toggle navigation")).toBeHidden();
  // A Tab press makes the focus visible, which shows the tooltip.
  await toggle.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(toggle).toBeFocused();
  await expect(q.tooltip("Toggle navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(q.tooltip("Toggle navigation")).toBeHidden();
});

test("keeps the layout script wiring on the tooltip buttons", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  // The layout script added the click listener before the island hydrated.
  const toggle = q.button("Toggle navigation");
  await hoverUntilTooltip(page, toggle, q.tooltip("Toggle navigation"));
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(q.navigation("Site")).not.toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(q.navigation("Site")).toBeVisible();
});

test("renders the theme buttons without tooltips", async ({ page, q }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  // The tooltip button islands hydrate together, so a theme button tooltip
  // would show on hover after this one shows.
  await hoverUntilTooltip(
    page,
    q.button("Toggle navigation"),
    q.tooltip("Toggle navigation"),
  );
  const theme = q.button("Theme");
  await hoverPastShowTimeout(page, theme);
  await expect(q.tooltip()).toHaveCount(0);
  await theme.click();
  await expect(q.complementary("Theme")).toBeVisible();
  await hoverPastShowTimeout(page, q.button("Close theme"));
  await expect(q.tooltip()).toHaveCount(0);
});

test("keeps the header controls at the start of the header", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  // The Open menu button is hidden at this width. Its island must not leave an
  // empty flex item and a gap before the Toggle navigation button.
  const offset = await q.button("Toggle navigation").evaluate((element) => {
    const start = element.closest(".shell-bar-start");
    if (!start) return null;
    const padding = Number.parseFloat(
      getComputedStyle(start).paddingInlineStart,
    );
    const startEdge = start.getBoundingClientRect().left + padding;
    return element.getBoundingClientRect().left - startEdge;
  });
  expect(offset).toBe(0);
});

test("names the preview card buttons with tooltips", async ({ page, q }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  const open = q.link("Open preview in a new tab").first();
  await open.scrollIntoViewIfNeeded();
  await hoverUntilTooltip(page, open, q.tooltip("Open preview in a new tab"));
  await q.button("Reload preview").first().hover();
  await expect(q.tooltip("Reload preview")).toBeVisible();
});
