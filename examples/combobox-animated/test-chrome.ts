import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Your favorite fruit" });
const getListbox = (page: Page) => page.getByRole("listbox");
const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

test("combobox show/hide animation", async ({ page }) => {
  await getCombobox(page).click();
  await expect(getListbox(page)).toBeVisible();
  await getOption(page, "🍎 Apple").click();
  await expect(getListbox(page)).not.toBeVisible();
});
