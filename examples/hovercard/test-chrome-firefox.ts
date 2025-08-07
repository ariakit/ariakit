import { expect, query } from "@ariakit/test/playwright";
import { test } from "../test-utils.ts";

test.describe.configure({ retries: process.env.CI ? 2 : 1 });

test("https://github.com/ariakit/ariakit/issues/1662", async ({ page }) => {
  const q = query(page);
  await q.link("@ariakit.org").hover();
  await expect(q.dialog("Ariakit")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(q.dialog("Ariakit")).not.toBeVisible();
  await q.link("@ariakit.org").hover();
  await expect(q.dialog("Ariakit")).toBeVisible();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(600);
  await expect(q.dialog("Ariakit")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(q.dialog("Ariakit")).not.toBeVisible();
});
