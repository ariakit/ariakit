import { expect, test } from "@playwright/test";

test("buton receives focus on click", async ({ page }) => {
  await page.goto("/previews/button");
  const button = await page.getByRole("button", { name: "Button" });
  await button.click();
  await expect(button).toBeFocused();
});
