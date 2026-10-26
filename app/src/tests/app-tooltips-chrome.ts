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
import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, gotoAndSettle } from "#app/test-utils/preview.ts";
import { SHOW_TIMEOUT } from "#app/test-utils/tooltip.ts";

type Query = ReturnType<typeof query>;

const recipePath = "/react/recipes/tooltip/";

/**
 * Waits until the island of a tooltip button hydrates. Its tooltip renders,
 * hidden, only in the browser.
 */
async function waitForTooltipButton(q: Query, name: string) {
  await expect(q.tooltip(name, { includeHidden: true })).toBeAttached();
}

/** Moves the pointer onto a button after the pointer rests elsewhere. */
async function hoverAgain(page: Page, q: Query, name: string) {
  await page.mouse.move(0, 0);
  await q.button(name).hover();
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

test("shows the Theme tooltip only while the label is hidden", async ({
  page,
  q,
}) => {
  // At this width, the open theme panel narrows the header enough to hide the
  // label of the Theme button.
  await page.setViewportSize({ width: 800, height: 800 });
  await gotoAndSettle(page, recipePath);
  const theme = q.button("Theme");
  const label = query(theme).text("Theme");
  await expect(label).toBeVisible();
  await waitForTooltipButton(q, "Close theme");
  await hoverAgain(page, q, "Theme");
  // No state tracks a tooltip that doesn't show. Cross Ariakit's show timeout,
  // then the frames that would render the tooltip.
  await page.waitForTimeout(SHOW_TIMEOUT);
  await flushFrames(page);
  await expect(q.tooltip("Theme")).toHaveCount(0);
  await theme.click();
  await expect(theme).toHaveAttribute("aria-expanded", "true");
  await expect(label).toBeHidden();
  await waitForTooltipButton(q, "Theme");
  await hoverAgain(page, q, "Theme");
  await expect(q.tooltip("Theme")).toBeVisible();
});

test("keeps the gap between the Theme icon and its label", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await gotoAndSettle(page, recipePath);
  const theme = q.button("Theme");
  // The island wraps the icon slot and the label in an element that would take
  // them out of the button layout and its gap. The server renders the wrapper
  // too, so the layout doesn't wait for hydration.
  const iconBox = await theme.locator("svg").boundingBox();
  const labelBox = await query(theme).text("Theme").boundingBox();
  expect(iconBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  if (!iconBox || !labelBox) return;
  expect(labelBox.x).toBeGreaterThan(iconBox.x + iconBox.width);
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
});
