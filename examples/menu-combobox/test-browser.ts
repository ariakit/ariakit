import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("auto select first option", async ({ page }) => {
  const q = query(page);
  await q.button("Add block").click();
  await expect(q.dialog("Add block")).toBeVisible();
  await q.combobox("Search...").fill("a");
  await expect(q.option("Audio")).toHaveAttribute("data-active-item");
});

test("https://github.com/ariakit/ariakit/issues/4324", async ({ page }) => {
  const q = query(page);
  await q.button("Add block").click();
  await expect(q.dialog("Add block")).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.mouse.click(10, 10);
  await expect(q.dialog("Add block")).not.toBeVisible();
  await expect(q.button("Add block")).not.toBeInViewport();
});
