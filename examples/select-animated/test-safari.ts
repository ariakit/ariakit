import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

// https://github.com/ariakit/ariakit/pull/6832
test("do not scroll with smooth scrolling", async ({ page }) => {
  const q = query(page);
  await q.combobox("Favorite fruit").focus();
  await page.evaluate(() => window.scrollTo({ top: 100, behavior: "instant" }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const scrollY = window.scrollY;
    window.addEventListener("scroll", () => {
      if (window.scrollY === scrollY) return;
      document.documentElement.dataset.scrollMoved = "true";
    });
  });

  await page.keyboard.press("Enter");

  await expect(q.listbox("Favorite fruit")).toBeVisible();
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
  expect(
    await page.evaluate(() => document.documentElement.dataset.scrollMoved),
  ).toBeUndefined();
  expect(await page.evaluate(() => window.scrollY)).toBe(100);
});
