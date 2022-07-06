import { Page, expect, test } from "@playwright/test";

const getSelect = (page: Page) =>
  page.locator("role=combobox[name='Favorite fruit']");
const getList = (page: Page) => page.locator("role=listbox");

test("show/hide with click", async ({ page }) => {
  await page.goto("/examples/form-select");
  await getSelect(page).click();
  await expect(getList(page)).toBeVisible();
  await expect(getList(page)).toBeFocused();
  await page.mouse.click(10, 10);
  await expect(getList(page)).not.toBeVisible();
  await expect(getSelect(page)).toBeFocused();
  await getSelect(page).click({ delay: 20 });
  await expect(getList(page)).toBeVisible();
  await expect(getList(page)).toBeFocused();
});
