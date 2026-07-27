import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const getMenuButton = (page: Page) =>
  page.getByRole("button", { name: "Add block" });

const getMenu = (page: Page) => page.getByRole("dialog", { name: "Add block" });

const getCombobox = (page: Page) =>
  page.getByRole("combobox", { name: "Search..." });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name });

withFramework(import.meta.dirname, async ({ test }) => {
  test("auto select first option", async ({ page }) => {
    await getMenuButton(page).click();
    await expect(getMenu(page)).toBeVisible();
    await getCombobox(page).type("a");
    await expect(getOption(page, "Audio")).toHaveAttribute("data-active-item");
  });
});
