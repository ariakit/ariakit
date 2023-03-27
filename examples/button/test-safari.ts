import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/button");
});

test("buton receives focus on click", async ({ page }) => {
  const button = await page.getByRole("button", { name: "Button" });
  await button.click();
  await expect(button).toBeFocused();
});
