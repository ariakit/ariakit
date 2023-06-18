import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

test.use({ javaScriptEnabled: false });

test("make sure elements are tabbable with JS disabled", async ({ page }) => {
  await page.goto("/previews/toolbar", { waitUntil: "networkidle" });
  await expect(async () => {
    await page.keyboard.press("Tab");
    await expect(getButton(page, "Undo")).toBeFocused();
  }).toPass();
  await page.keyboard.press("Tab");
  await expect(getButton(page, "Bold")).toBeFocused();
});
