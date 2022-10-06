import { Page, expect, test } from "@playwright/test";

const getCombobox = (page: Page) =>
  page.locator("role=combobox[name='Your favorite fruit']");
const getListbox = (page: Page) => page.locator("role=listbox");
const getOption = (page: Page, name: string) =>
  page.locator(`role=option[name='${name}']`);

test("combobox show/hide animation", async ({ page }) => {
  await page.goto("/examples/combobox-animated");
  await getCombobox(page).click();
  await expect(getListbox(page)).toBeVisible();
  await getOption(page, "🍎 Apple").click();
  await expect(getListbox(page)).not.toBeVisible();
});
