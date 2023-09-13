import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getDialog = (page: Page) => page.getByRole("dialog", { name: "Success" });
const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

test("show before JS", async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener("load", () => {
      const details = document.querySelector<HTMLDetailsElement>("details");
      if (details) {
        details.open = true;
      }
    });
  });
  await page.goto("/previews/dialog-provider-details");
  await page.waitForTimeout(250);
  await expect(getDialog(page)).toBeVisible();
  await expect(getButton(page, "OK")).toBeFocused();
});
