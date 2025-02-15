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
  await expect(q.listbox("Favorite fruit")).toBeFocused();
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
  await expect(q.listbox("Favorite fruit")).toBeFocused();
  await expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Apple")).toHaveAttribute("data-active-item");
  await page.keyboard.press("ArrowDown");
  await expect(q.option("Apple")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Banana")).toHaveAttribute("data-active-item");
  await page.keyboard.press("Enter");
  await expect(q.listbox("Favorite fruit")).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(q.listbox("Favorite fruit")).toBeFocused();
  await expect(q.option("Banana")).toHaveAttribute("aria-selected", "true");
  await expect(q.option("Banana")).toHaveAttribute("data-active-item");
});

test("do not scroll when opening the select popover", async ({ page }) => {
  const q = query(page);
  await q.combobox("Favorite fruit").focus();
  await page.evaluate(() => window.scrollTo({ top: 100 }));
  await page.keyboard.press("Enter");
  await expect(q.listbox("Favorite fruit")).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(100);
});

test("https://github.com/ariakit/ariakit/issues/1684", async ({ page }) => {
  const q = query(page);
  await q.combobox("Favorite fruit").focus();
  await page.keyboard.press("Enter");
  await page.mouse.click(1, 1);
  await expect(q.listbox("Favorite fruit")).not.toBeVisible();
});
