import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const getSelect = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite fruit" });
const getList = (page: Page) => page.getByRole("listbox");

test("show/hide with click", async ({ page }) => {
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
