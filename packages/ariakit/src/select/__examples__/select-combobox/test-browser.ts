import { Page, expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite fruit" });

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Search..." });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

// TODO: Test this on menu-combobox as well.
test("auto select first option", async ({ page }) => {
  await page.goto("/examples/select-combobox");
  await getButton(page).click();
  await getCombobox(page).type("p");
  await expect(getOption(page, "Pasta")).toHaveAttribute(
    "data-active-item",
    ""
  );
});
