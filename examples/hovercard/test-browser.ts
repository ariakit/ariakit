import { Page, expect, test } from "@playwright/test";

const getAnchor = (page: Page) =>
  page.getByRole("link", { name: "@ariakitjs" });
const getHovercard = (page: Page) =>
  page.getByRole("dialog", { name: "Ariakit" });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/hovercard", { waitUntil: "networkidle" });
});

test("show/hide hovercard after scrolling", async ({ page }) => {
  await getAnchor(page).hover();
  await expect(getHovercard(page)).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(getHovercard(page)).not.toBeVisible();
  await page.mouse.wheel(0, 300);
  await getAnchor(page).hover();
  await expect(getHovercard(page)).toBeVisible();
  await page.mouse.wheel(0, -300);
  await page.mouse.move(0, 0);
  await expect(getHovercard(page)).not.toBeVisible();
});
