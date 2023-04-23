import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-nested", { waitUntil: "networkidle" });
});

test("remove product", async ({ page }) => {
  await page.getByRole("button", { name: "View Cart" }).click();
  await expect(
    page.getByRole("dialog", { name: "Your Shopping Cart" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Dismiss popup" })
  ).toBeFocused();
  await page.getByRole("button", { name: "Remove Warm Jacket" }).click();
  await expect(
    page.getByRole("dialog", { name: "Remove product" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(
    page.getByRole("dialog", { name: "Remove product" })
  ).not.toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Your Shopping Cart" })
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Your Shopping Cart" })
  ).toBeFocused();
});
