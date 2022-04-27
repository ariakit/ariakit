import { expect, test } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("http://localhost:3000/examples/focusable-button");
  const element = await page.locator("role=button[name='Button']");
  await element.click();
  await expect(element).toBeFocused();
});
