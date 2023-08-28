import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page) =>
  page.getByRole("combobox", { name: "Favorite fruit" });

const getOption = (page: Page, name: string) =>
  page.getByRole("option", { name, exact: true });

async function expectSelected(page: Page, name: string) {
  await expect(getOption(page, name)).toBeInViewport();
  await expect(getOption(page, name)).toHaveAttribute("data-active-item", "");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/select-combobox");
});

test("auto select first option", async ({ page }) => {
  await getButton(page).click();
  await page.keyboard.type("c");
  await expectSelected(page, "Cake");
  await page.keyboard.type("h");
  await expectSelected(page, "Cherry");
  await page.keyboard.type("o");
  await expectSelected(page, "Chocolate");
  await page.keyboard.press("Enter");
  await getButton(page).click();
  await expectSelected(page, "Chocolate");
  await page.keyboard.type("a");
  await expectSelected(page, "Apple");
  await page.keyboard.type("s");
  await expectSelected(page, "Pasta");
  await page.keyboard.press("Backspace");
  await expectSelected(page, "Apple");
});
