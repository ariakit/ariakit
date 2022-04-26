import { expect, test } from "@playwright/test";

test("basic test", async ({ page }) => {
  await page.goto("http://localhost:3000/examples/combobox-textarea");
  const element = await page.locator("role=combobox[name='Comment']");
  await element.click();
  await element.type("Hello @");
  await expect(page.locator("role=listbox")).toBeVisible();
  await page.locator("role=option[name='lluia']").hover();
  await page.locator("role=option[name='lluia']").click();
  await expect(page.locator("role=combobox[name='Comment']")).toHaveValue(
    "Hello @lluia "
  );
});
