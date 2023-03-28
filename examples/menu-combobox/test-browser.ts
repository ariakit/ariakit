import { Page, expect, test } from "@playwright/test";

const getMenuButton = (page: Page) =>
  page.getByRole("button", { name: "Add block" });

const getMenu = (page: Page) => page.getByRole("dialog", { name: "Add block" });

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Search..." });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/menu-combobox");
});

test("auto select first option", async ({ page }) => {
  await expect(async () => {
    await getMenuButton(page).click();
    await expect(getMenu(page)).toBeVisible();
  }).toPass();
  await getCombobox(page).type("a");
  await expect(getOption(page, "Audio")).toHaveAttribute(
    "data-active-item",
    ""
  );
});
