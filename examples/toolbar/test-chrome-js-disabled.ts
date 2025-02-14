import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { preview, test } from "../test-utils.ts";

const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

test.use({ javaScriptEnabled: false });

test("make sure elements are tabbable with JS disabled", async ({ page }) => {
  await expect(async () => {
    await page.goto(preview("toolbar"));
    await expect(getButton(page, "Undo")).toBeInViewport();
  }).toPass();
  await page.keyboard.press("Tab");
  await expect(getButton(page, "Undo")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(getButton(page, "Bold")).toBeFocused();
});
