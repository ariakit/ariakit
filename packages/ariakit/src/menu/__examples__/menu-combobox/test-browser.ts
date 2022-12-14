import { Page, expect, test } from "@playwright/test";

const getMenuButton = (page: Page) =>
  page.getByRole("button", { name: "Add block" });

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Search..." });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

test("auto select first option", async ({ page }) => {
  await page.goto("/examples/menu-combobox");
  await getMenuButton(page).click();
  await getCombobox(page).type("a");
  await expect(getOption(page, "Audio")).toHaveAttribute(
    "data-active-item",
    ""
  );
});
