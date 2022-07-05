import { Page, expect, test } from "@playwright/test";

const getSelect = (page: Page) =>
  page.locator("role=combobox[name='Favorite fruit']");
const getList = (page: Page) => page.locator("role=listbox");

test("show with click", async ({ page }) => {
  await page.goto("/examples/form-select");
  await getSelect(page).click();
  await expect(getList(page)).toBeVisible();
});
