import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const createTransition = (duration = 100) => {
  const then = performance.now();
  const isPending = () => {
    const now = performance.now();
    return now - then < duration;
  };
  return isPending;
};

test("show/hide", async ({ page }) => {
  const q = query(page);
  await expect(q.listbox("Favorite fruit")).not.toBeVisible();
  await q.combobox("Favorite fruit").click();
  await expect(q.listbox("Favorite fruit")).toBeVisible();
  await expect(q.combobox("Favorite fruit")).toBeFocused();
  await expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Apple")).toHaveAttribute("data-active-item");
  const isLeaving = createTransition();
  await page.keyboard.press("Escape");
  await expect(q.combobox("Favorite fruit")).toBeFocused();
  if (isLeaving()) {
    await expect(q.listbox("Favorite fruit")).toBeVisible();
  }
  await expect(q.listbox("Favorite fruit")).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(q.combobox("Favorite fruit")).toBeFocused();
  await expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Apple")).toHaveAttribute("data-active-item");
  await page.keyboard.press("ArrowDown");
  await expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Banana")).toHaveAttribute("data-active-item");
  await page.keyboard.press("Enter");
  await expect(q.listbox("Favorite fruit")).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(q.combobox("Favorite fruit")).toBeFocused();
  await expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Banana")).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/pull/6832
test("do not scroll on the first popover mount", async ({ page }) => {
  const q = query(page);
  const select = q.combobox("Favorite fruit");
  const popover = q.listbox("Favorite fruit");
  await expect(popover).not.toBeAttached();
  await select.focus();
  await page.evaluate(() => window.scrollTo({ top: 100 }));
  const selectBox = await select.boundingBox();
  expect(selectBox).not.toBeNull();
  if (!selectBox) throw new Error("Select box is missing");

  await page.keyboard.press("Enter");

  await expect(popover).toBeVisible();
  const popoverBox = await popover.boundingBox();
  expect(popoverBox).not.toBeNull();
  if (!popoverBox) throw new Error("Popover box is missing");
  expect(Math.abs(popoverBox.x - selectBox.x)).toBeLessThan(10);
  expect(popoverBox.y).toBeGreaterThan(selectBox.y);
  expect(await page.evaluate(() => window.scrollY)).toBe(100);
});

test("https://github.com/ariakit/ariakit/issues/1684", async ({ page }) => {
  const q = query(page);
  await q.combobox("Favorite fruit").focus();
  await page.keyboard.press("Enter");
  await page.mouse.click(1, 1);
  await expect(q.listbox("Favorite fruit")).not.toBeVisible();
});
