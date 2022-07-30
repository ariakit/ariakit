import { Page, expect, test } from "@playwright/test";

const getAnchor = (page: Page) => page.locator("role=link[name='@ariakitjs']");
const getHovercard = (page: Page) =>
  page.locator("role=dialog[name='Ariakit']");

test("show/hide hovercard", async ({ page }) => {
  await page.goto("/examples/hovercard");
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
