import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getAnchor = (page: Page) =>
  page.getByRole("link", { name: "@ariakitjs" });
const getHovercard = (page: Page) =>
  page.getByRole("dialog", { name: "Ariakit" });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/hovercard", { waitUntil: "networkidle" });
});

test.describe.configure({ retries: process.env.CI ? 2 : 1 });

test("https://github.com/ariakit/ariakit/issues/1662", async ({ page }) => {
  await getAnchor(page).hover();
  await expect(getHovercard(page)).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(getHovercard(page)).not.toBeVisible();
  await getAnchor(page).hover();
  await expect(getHovercard(page)).toBeVisible();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(600);
  await expect(getHovercard(page)).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(getHovercard(page)).not.toBeVisible();
});
