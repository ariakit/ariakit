import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const getButton = (page: Page, name: string) =>
  page.getByRole("button", { name });

const getDialog = (page: Page) => page.getByRole("dialog");

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-framer-motion", {
    waitUntil: "networkidle",
  });
});

test("show/hide with click", async ({ page }) => {
  await expect(getDialog(page)).not.toBeVisible();
  await getButton(page, "Show modal").click();
  await expect(getDialog(page)).toBeVisible();
  await getButton(page, "OK").click();
  await expect(getDialog(page)).not.toBeVisible();
});
