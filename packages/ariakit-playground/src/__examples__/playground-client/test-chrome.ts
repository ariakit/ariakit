import { expect, test } from "@playwright/test";

test("updating code reflects on preview", async ({ page }) => {
  await page.goto("/examples/playground-client");
  const editor = await page.getByRole("textbox", { name: "index.js" });
  const preview = await page.frameLocator(".preview");
  await expect(preview.getByRole("button", { name: "Button" })).toBeVisible({
    timeout: 15000,
  });
  await editor.getByText("<Button>").dblclick({ position: { x: 150, y: 10 } });
  await editor.type("Hello");
  await expect(preview.getByRole("button", { name: "Hello" })).toBeVisible();
});
