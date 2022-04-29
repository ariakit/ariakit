import { expect, test } from "@playwright/test";

test("updating code reflects on preview", async ({ page }) => {
  await page.goto("/examples/playground-client");
  const editor = await page.locator("role=textbox[name=index.js]");
  const preview = await page.frameLocator(".preview");
  await expect(preview.locator("role=button[name=Button]")).toBeVisible();
  await editor
    .locator("text=<Button>")
    .dblclick({ position: { x: 150, y: 10 } });
  await editor.type("Hello");
  await expect(preview.locator("role=button[name=Hello]")).toBeVisible();
});
