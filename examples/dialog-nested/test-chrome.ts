import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const getButton = (page: Page | Locator, name: string) =>
  page.getByRole("button", { name });

const getDialog = (page: Page | Locator, name: string) =>
  page.getByRole("dialog", { name });

test("remove product", async ({ page }) => {
  await getButton(page, "View Cart").click();
  await expect(getDialog(page, "Your Shopping Cart")).toBeVisible();
  await expect(getButton(page, "Dismiss popup")).toBeFocused();
  await getButton(page, "Remove Warm Jacket").click();
  await expect(getDialog(page, "Remove product")).toBeVisible();
  await expect(getButton(page, "Cancel")).toBeFocused();
  await getButton(getDialog(page, "Remove product"), "Remove").click();
  await expect(getDialog(page, "Remove product")).not.toBeVisible();
  await expect(getDialog(page, "Your Shopping Cart")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(getDialog(page, "Your Shopping Cart")).not.toBeVisible();
});
