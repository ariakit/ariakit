import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite fruit" });

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Search..." });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/select-combobox");
});

test("auto select first option", async ({ page }) => {
  await getButton(page).click();
  await getCombobox(page).type("p");
  await expect(getOption(page, "Pasta")).toHaveAttribute(
    "data-active-item",
    ""
  );
});
