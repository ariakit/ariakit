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
import { gotoPage } from "./app-navigation-card-helpers.ts";

// Browsers implement the resize grip of the card themselves, so this test runs
// in every desktop browser.
test("site navigation card keeps the size that the person gives it", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Radio").hover();
  const card = query(page).dialog("Radio");
  // The card holds the box that the person resizes, inside its padding.
  const box = card.locator(":scope > div");
  const getSize = () =>
    box.evaluate((element) => {
      // The box is an HTML element in the page, which has layout sizes.
      if (!(element instanceof HTMLElement)) return null;
      return { width: element.offsetWidth, height: element.offsetHeight };
    });
  const getStoredSize = () =>
    page.evaluate(() => localStorage.getItem("app-navigation-card-size"));
  // The card scales in as it opens, so the grip is in place once the box has
  // the size of its layout.
  await expect
    .poll(async () => {
      const current = await box.boundingBox();
      const size = await getSize();
      return Math.round(current?.width ?? 0) === size?.width;
    })
    .toBe(true);
  const before = await getSize();
  const rect = await box.boundingBox();
  expect(before).not.toBeNull();
  expect(rect).not.toBeNull();
  if (!before) return;
  if (!rect) return;
  expect(await getStoredSize()).toBeNull();
  // The resize grip lies at the bottom end corner of the box. The drag goes
  // past the card, where a move without a press would hide it.
  const grip = { x: rect.x + rect.width - 3, y: rect.y + rect.height - 3 };
  await page.mouse.move(grip.x, grip.y);
  await page.mouse.down();
  await page.mouse.move(grip.x + 80, grip.y + 40, { steps: 5 });
  // The card would hide after the default 500ms hide timeout of a hovercard,
  // and no state shows that the timeout passed without it.
  await page.waitForTimeout(600);
  // A closing card stays visible while it fades out, so the open state shows
  // that it didn't start to close.
  await expect(card).toHaveAttribute("data-open");
  await page.mouse.up();
  await expect
    .poll(async () => (await getSize())?.width)
    .toBeGreaterThan(before.width + 40);
  const size = await getSize();
  expect(JSON.parse((await getStoredSize()) ?? "null")).toEqual(size);
  // The card opens with that size after the page loads again.
  await gotoPage(page);
  await navigation.link("Radio").hover();
  await expect(card).toBeVisible();
  await expect.poll(getSize).toEqual(size);
  // A double click on the grip gives the card its default size again, and
  // forgets the size.
  const resized = await box.boundingBox();
  if (!resized) return;
  await page.mouse.dblclick(
    resized.x + resized.width - 3,
    resized.y + resized.height - 3,
  );
  await expect.poll(getSize).toEqual(before);
  expect(await getStoredSize()).toBeNull();
});

test("site navigation card keeps a size whose drag ends over a preview", async ({
  page,
}) => {
  const navigation = await gotoPage(page);
  await navigation.link("Radio").hover();
  const card = query(page).dialog("Radio");
  const frame = card.locator("iframe");
  await expect(frame).toHaveCSS("opacity", "1");
  const box = card.locator(":scope > div");
  // The card scales in as it opens, so the grip is in place once the box has
  // the size of its layout.
  await expect
    .poll(() =>
      box.evaluate((element) => {
        if (!(element instanceof HTMLElement)) return false;
        const { width } = element.getBoundingClientRect();
        return Math.round(width) === element.offsetWidth;
      }),
    )
    .toBe(true);
  const rect = await box.boundingBox();
  if (!rect) throw new Error("The card has no box");
  // The drag shrinks the card past its minimum size, so the pointer ends over
  // the preview, inside the card.
  const grip = { x: rect.x + rect.width - 3, y: rect.y + rect.height - 3 };
  await page.mouse.move(grip.x, grip.y);
  await page.mouse.down();
  await page.mouse.move(grip.x - 300, grip.y - 200, { steps: 5 });
  await page.mouse.up();
  const size = await box.evaluate((element) => {
    if (!(element instanceof HTMLElement)) return null;
    return { width: element.offsetWidth, height: element.offsetHeight };
  });
  expect(size?.width).toBeLessThan(rect.width);
  await expect
    .poll(async () => {
      const stored = await page.evaluate(() =>
        localStorage.getItem("app-navigation-card-size"),
      );
      return JSON.parse(stored ?? "null");
    })
    .toEqual(size);
});
