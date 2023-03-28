import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/button");
});

test("buton receives focus on click", async ({ page }) => {
  const button = page.getByRole("button", { name: "Button" });
  await expect(async () => {
    await button.click();
    await expect(button).toBeFocused();
  }).toPass();
});
