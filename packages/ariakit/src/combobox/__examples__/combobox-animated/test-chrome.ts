import { Page, expect, test } from "@playwright/test";

const getListbox = (page: Page) => page.locator("role=listbox");

test("combobox show/hide animation", async ({ page }) => {
  await page.goto("/examples/combobox-animated");
  await page.locator("role=combobox").click();
  await expect(getListbox(page)).toBeVisible();
  await page.locator("role=option").first().click();
  await expect(getListbox(page)).not.toBeVisible();
});
