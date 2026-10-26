/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

const recipePath = "/react/recipes/tooltip/";

/**
 * Waits until the island of a tooltip button hydrates. Its tooltip renders,
 * hidden, only in the browser.
 */
async function waitForTooltipButton(q: Query, name: string) {
  await expect(q.tooltip(name, { includeHidden: true })).toBeAttached();
}

test("names the header buttons with tooltips on hover and focus", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  const toggle = q.button("Toggle navigation");
  await waitForTooltipButton(q, "Toggle navigation");
  await toggle.hover();
  await expect(q.tooltip("Toggle navigation")).toBeVisible();
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
  await waitForTooltipButton(q, "Toggle navigation");
  // The layout script added the click listener before the island hydrated.
  const toggle = q.button("Toggle navigation");
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
  // The tooltip button islands hydrate together, so the hidden tooltip of
  // another button shows that a theme button tooltip would have rendered.
  await waitForTooltipButton(q, "Toggle navigation");
  await q.button("Theme").click();
  await expect(q.complementary("Theme")).toBeVisible();
  await expect(q.tooltip("Theme", { includeHidden: true })).toHaveCount(0);
  await expect(q.tooltip("Close theme", { includeHidden: true })).toHaveCount(
    0,
  );
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
  await expect(
    q.tooltip("Open preview in a new tab", { includeHidden: true }).first(),
  ).toBeAttached();
  await open.hover();
  await expect(q.tooltip("Open preview in a new tab")).toBeVisible();
  await q.button("Reload preview").first().hover();
  await expect(q.tooltip("Reload preview")).toBeVisible();
});
