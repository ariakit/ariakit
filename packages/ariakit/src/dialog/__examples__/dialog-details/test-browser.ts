import { Page, expect, test } from "@playwright/test";

const getDialog = (page: Page) => page.getByRole("dialog", { name: "Success" });
const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

test("show before JS", async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener("DOMContentLoaded", () => {
      const details = document.querySelector<HTMLDetailsElement>("details");
      if (details) {
        details.open = true;
      }
    });
  });
  await page.goto("/examples/dialog-details", {
    waitUntil: "domcontentloaded",
  });
  await expect(getDialog(page)).toBeVisible();
  await expect(getButton(page, "OK")).toBeFocused();
});
