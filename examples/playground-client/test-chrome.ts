import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/playground-client");
});

test("updating code reflects on preview", async ({ page }) => {
  const editor = page.getByRole("textbox", { name: "index.js" });
  const preview = page.frameLocator(".preview");
  await expect(preview.getByRole("button", { name: "Button" })).toBeVisible({
    timeout: 15000,
  });
  await editor.getByText("<Button>").dblclick({ position: { x: 150, y: 10 } });
  await editor.type("Hello");
  await expect(preview.getByRole("button", { name: "Hello" })).toBeVisible();
});
